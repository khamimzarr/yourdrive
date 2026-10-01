import { initDB, saveFiles, getAllCachedFiles, closeDB } from '../../src/lib/db';

// Mock indexedDB for Node environment
import 'fake-indexeddb/auto';

describe('IndexedDB Wrapper', () => {
  beforeEach(async () => {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });

  afterAll(() => {
    closeDB();
  });

  it('should save and retrieve files', async () => {
    const mockFiles = [{ id: 1, name: 'test.txt', path: '/', size: 100, date: 123, isTrash: false }];
    await saveFiles(mockFiles);
    const files = await getAllCachedFiles();
    expect(files.length).toBe(1);
    expect(files[0].name).toBe('test.txt');
  });

  it('should update existing files with same id', async () => {
    const initialFiles = [{ id: 1, name: 'test.txt', path: '/', size: 100, date: 123, isTrash: false }];
    await saveFiles(initialFiles);

    const mockFiles = [{ id: 1, name: 'test-updated.txt', path: '/', size: 200, date: 456, isTrash: false }];
    await saveFiles(mockFiles);
    const files = await getAllCachedFiles();
    expect(files.length).toBe(1);
    expect(files[0].name).toBe('test-updated.txt');
    expect(files[0].size).toBe(200);
  });

  it('should handle saving multiple files', async () => {
    const mockFiles = [
      { id: 2, name: 'file2.pdf', path: '/docs', size: 500, date: 789, isTrash: false },
      { id: 3, name: 'file3.png', path: '/images', size: 1000, date: 999, isTrash: true }
    ];
    await saveFiles(mockFiles);
    const files = await getAllCachedFiles();
    expect(files.length).toBe(2);
    expect(files.map((f) => f.id).sort()).toEqual([2, 3]);
  });
});

