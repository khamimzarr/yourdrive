import { initDB, saveFiles, getAllCachedFiles } from '../../src/lib/db';

// Mock indexedDB for Node environment
import 'fake-indexeddb/auto';

describe('IndexedDB Wrapper', () => {
  it('should save and retrieve files', async () => {
    await initDB();
    const mockFiles = [{ id: 1, name: 'test.txt', path: '/', size: 100, date: 123, isTrash: false }];
    await saveFiles(mockFiles);
    const files = await getAllCachedFiles();
    expect(files.length).toBe(1);
    expect(files[0].name).toBe('test.txt');
  });

  it('should update existing files with same id', async () => {
    await initDB();
    const mockFiles = [{ id: 1, name: 'test-updated.txt', path: '/', size: 200, date: 456, isTrash: false }];
    await saveFiles(mockFiles);
    const files = await getAllCachedFiles();
    expect(files.length).toBe(1);
    expect(files[0].name).toBe('test-updated.txt');
    expect(files[0].size).toBe(200);
  });

  it('should handle saving multiple files', async () => {
    await initDB();
    const mockFiles = [
      { id: 2, name: 'file2.pdf', path: '/docs', size: 500, date: 789, isTrash: false },
      { id: 3, name: 'file3.png', path: '/images', size: 1000, date: 999, isTrash: true }
    ];
    await saveFiles(mockFiles);
    const files = await getAllCachedFiles();
    expect(files.length).toBe(3);
  });
});
