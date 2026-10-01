import { uploadFile, getAllFiles, META_REGEX, MAX_FILE_SIZE } from '../../src/lib/fileOps';
import { getClient } from '../../src/lib/telegram';
import { saveFiles, getAllCachedFiles } from '../../src/lib/db';

jest.mock('../../src/lib/telegram');
jest.mock('../../src/lib/db');

describe('File Operations', () => {
  const mockSendFile = jest.fn();
  const mockGetMessages = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getClient as jest.Mock).mockResolvedValue({
      sendFile: mockSendFile,
      getMessages: mockGetMessages,
    });
    (getAllCachedFiles as jest.Mock).mockResolvedValue([]);
    (saveFiles as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Upload limits', () => {
    it('should reject file > 100MB', async () => {
      const hugeFile = {
        name: 'huge.mp4',
        size: 105000000,
        arrayBuffer: async () => new ArrayBuffer(0),
      } as unknown as File;
      await expect(uploadFile(hugeFile, '/')).rejects.toThrow('File size exceeds the 100MB limit');
      expect(mockSendFile).not.toHaveBeenCalled();
    });

    it('should reject file 1 byte over 100MB limit', async () => {
      const justOverLimitFile = {
        name: 'over.dat',
        size: MAX_FILE_SIZE + 1,
        arrayBuffer: async () => new ArrayBuffer(0),
      } as unknown as File;
      await expect(uploadFile(justOverLimitFile, '/')).rejects.toThrow('File size exceeds the 100MB limit');
      expect(mockSendFile).not.toHaveBeenCalled();
    });

    it('should allow and upload file <= 100MB', async () => {
      const validFile = {
        name: 'valid.pdf',
        size: MAX_FILE_SIZE,
        arrayBuffer: async () => new ArrayBuffer(16),
      } as unknown as File;

      mockSendFile.mockResolvedValueOnce({ id: 42, date: 1700000000 });

      const result = await uploadFile(validFile, '/documents');

      expect(result).toEqual({
        id: 42,
        name: 'valid.pdf',
        path: '/documents',
        size: MAX_FILE_SIZE,
        date: 1700000000,
      });
      expect(mockSendFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('META_REGEX', () => {
    it('should match single line metadata', () => {
      const caption = '[YourDrive-Meta: {"path": "/Documents", "name": "test.txt"}]';
      const match = caption.match(META_REGEX);
      expect(match).not.toBeNull();
      expect(JSON.parse(match![1])).toEqual({ path: '/Documents', name: 'test.txt' });
    });

    it('should match multiline metadata with newlines and indentation', () => {
      const caption = `[YourDrive-Meta:
        {
          "path": "/Projects/Secret",
          "name": "plans.json",
          "trash": false
        }
      ]`;
      const match = caption.match(META_REGEX);
      expect(match).not.toBeNull();
      expect(JSON.parse(match![1])).toEqual({
        path: '/Projects/Secret',
        name: 'plans.json',
        trash: false,
      });
    });

    it('should not match invalid format', () => {
      const caption = 'Just a regular message without meta tag';
      expect(caption.match(META_REGEX)).toBeNull();
    });
  });

  describe('getAllFiles metadata parsing', () => {
    it('should parse valid multiline metadata in messages', async () => {
      mockGetMessages.mockResolvedValueOnce([
        {
          id: 101,
          media: { _: 'messageMediaDocument' },
          message: `[YourDrive-Meta:
            {
              "path": "/Personal",
              "name": "notes.txt",
              "trash": false
            }
          ]`,
          date: 1700000100,
        },
      ]);

      const files = await getAllFiles();
      expect(files.length).toBe(1);
      expect(files[0]).toMatchObject({
        id: 101,
        name: 'notes.txt',
        path: '/Personal',
        isTrash: false,
      });
    });

    it('should log warning and not crash when metadata JSON is malformed', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      mockGetMessages.mockResolvedValueOnce([
        {
          id: 202,
          media: { _: 'messageMediaDocument' },
          message: '[YourDrive-Meta: {not-valid-json}]',
          date: 1700000200,
        },
      ]);

      const files = await getAllFiles();
      expect(files.length).toBe(1);
      expect(files[0].name).toBe('Unknown File');
      expect(files[0].path).toBe('/');
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to parse metadata for message',
        202,
        expect.any(Error)
      );

      warnSpy.mockRestore();
    });
  });

  describe('getAllFiles sync with IndexedDB', () => {
    it('should fetch with minId: 0 when cache empty and save new files to IndexedDB', async () => {
      (getAllCachedFiles as jest.Mock).mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([
        {
          id: 10,
          media: { _: 'messageMediaDocument' },
          message: '[YourDrive-Meta: {"path": "/Docs", "name": "doc1.txt"}]',
          date: 1000,
        },
      ]);

      const files = await getAllFiles();

      expect(mockGetMessages).toHaveBeenCalledWith('me', { minId: 0, limit: 1000 });
      expect(saveFiles).toHaveBeenCalledWith([
        expect.objectContaining({ id: 10, name: 'doc1.txt', path: '/Docs' }),
      ]);
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe(10);
    });

    it('should fetch with minId: highestId and merge new files with cached files sorted by id desc', async () => {
      const cached = [
        { id: 20, name: 'cached20.txt', path: '/', size: 100, date: 500, isTrash: false },
        { id: 50, name: 'cached50.txt', path: '/', size: 200, date: 600, isTrash: false },
      ];
      (getAllCachedFiles as jest.Mock).mockResolvedValueOnce(cached);
      mockGetMessages.mockResolvedValueOnce([
        {
          id: 60,
          media: { _: 'messageMediaDocument' },
          message: '[YourDrive-Meta: {"path": "/", "name": "new60.txt"}]',
          date: 700,
        },
      ]);

      const files = await getAllFiles();

      expect(mockGetMessages).toHaveBeenCalledWith('me', { minId: 50, limit: 1000 });
      expect(saveFiles).toHaveBeenCalledWith([
        expect.objectContaining({ id: 60, name: 'new60.txt' }),
      ]);
      expect(files.map((f) => f.id)).toEqual([60, 50, 20]);
    });

    it('should not call saveFiles if no new messages are found', async () => {
      const cached = [
        { id: 10, name: 'file.txt', path: '/', size: 50, date: 100, isTrash: false },
      ];
      (getAllCachedFiles as jest.Mock).mockResolvedValueOnce(cached);
      mockGetMessages.mockResolvedValueOnce([]);

      const files = await getAllFiles();

      expect(mockGetMessages).toHaveBeenCalledWith('me', { minId: 10, limit: 1000 });
      expect(saveFiles).not.toHaveBeenCalled();
      expect(files).toEqual(cached);
    });

    it('should gracefully handle IndexedDB read error and continue fetch', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      (getAllCachedFiles as jest.Mock).mockRejectedValueOnce(new Error('IDB read failure'));
      mockGetMessages.mockResolvedValueOnce([
        {
          id: 5,
          media: { _: 'messageMediaDocument' },
          message: '[YourDrive-Meta: {"name": "resilient.txt", "path": "/"}]',
          date: 200,
        },
      ]);

      const files = await getAllFiles();

      expect(warnSpy).toHaveBeenCalledWith(
        'IndexedDB not available, falling back to full fetch',
        expect.any(Error)
      );
      expect(mockGetMessages).toHaveBeenCalledWith('me', { minId: 0, limit: 1000 });
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe(5);

      warnSpy.mockRestore();
    });

    it('should catch and log error if saveFiles rejects without failing getAllFiles', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (getAllCachedFiles as jest.Mock).mockResolvedValueOnce([]);
      (saveFiles as jest.Mock).mockRejectedValueOnce(new Error('IDB write failure'));
      mockGetMessages.mockResolvedValueOnce([
        {
          id: 15,
          media: { _: 'messageMediaDocument' },
          message: '[YourDrive-Meta: {"name": "write-fail.txt", "path": "/"}]',
          date: 300,
        },
      ]);

      const files = await getAllFiles();

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to save to cache',
        expect.any(Error)
      );
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe(15);

      errorSpy.mockRestore();
    });

    it('should deduplicate and replace cached file when new file has the same id', async () => {
      const cached = [
        { id: 10, name: 'old-name.txt', path: '/', size: 100, date: 500, isTrash: false },
      ];
      (getAllCachedFiles as jest.Mock).mockResolvedValueOnce(cached);
      mockGetMessages.mockResolvedValueOnce([
        {
          id: 10,
          media: { _: 'messageMediaDocument' },
          message: '[YourDrive-Meta: {"name": "updated-name.txt", "path": "/"}]',
          date: 600,
        },
      ]);

      const files = await getAllFiles();

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('updated-name.txt');
    });
  });
});
