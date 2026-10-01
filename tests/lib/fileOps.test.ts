import { uploadFile, getAllFiles, META_REGEX, MAX_FILE_SIZE } from '../../src/lib/fileOps';
import { getClient } from '../../src/lib/telegram';

jest.mock('../../src/lib/telegram');

describe('File Operations', () => {
  const mockSendFile = jest.fn();
  const mockGetMessages = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getClient as jest.Mock).mockResolvedValue({
      sendFile: mockSendFile,
      getMessages: mockGetMessages,
    });
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
});
