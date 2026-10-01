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

  afterAll(async () => {
    await closeDB();
  });

  it('should return empty array when store is empty', async () => {
    const files = await getAllCachedFiles();
    expect(files).toEqual([]);
  });

  it('should handle saving an empty list of files', async () => {
    await saveFiles([]);
    const files = await getAllCachedFiles();
    expect(files).toEqual([]);
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

  it('should reject saveFiles when transaction aborts', async () => {
    const db = await initDB();
    const originalTx = db.transaction.bind(db);
    jest.spyOn(db, 'transaction').mockImplementationOnce((...args) => {
      const tx = originalTx(...args);
      const originalStore = tx.objectStore.bind(tx);
      tx.objectStore = ((...sArgs: Parameters<typeof originalStore>) => {
        const store = originalStore(...sArgs);
        const originalPut = store.put.bind(store);
        store.put = ((...pArgs: Parameters<typeof originalPut>) => {
          const req = originalPut(...pArgs);
          tx.abort();
          return req;
        }) as typeof store.put;
        return store;
      }) as typeof tx.objectStore;
      return tx;
    });

    const mockFiles = [{ id: 99, name: 'abort.txt', path: '/', size: 10, date: 1, isTrash: false }];
    await expect(saveFiles(mockFiles)).rejects.toThrow();
  });

  it('should reject getAllCachedFiles when transaction aborts', async () => {
    const db = await initDB();
    const originalTx = db.transaction.bind(db);
    jest.spyOn(db, 'transaction').mockImplementationOnce((...args) => {
      const tx = originalTx(...args);
      const originalStore = tx.objectStore.bind(tx);
      tx.objectStore = ((...sArgs: Parameters<typeof originalStore>) => {
        const store = originalStore(...sArgs);
        const originalGetAll = store.getAll.bind(store);
        store.getAll = ((...gArgs: Parameters<typeof originalGetAll>) => {
          const req = originalGetAll(...gArgs);
          tx.abort();
          return req;
        }) as typeof store.getAll;
        return store;
      }) as typeof tx.objectStore;
      return tx;
    });

    await expect(getAllCachedFiles()).rejects.toThrow();
  });

  it('should reset dbPromise if indexedDB.open throws synchronously', async () => {
    await closeDB();
    const openSpy = jest.spyOn(indexedDB, 'open').mockImplementationOnce(() => {
      throw new Error('Synchronous open failure');
    });

    await expect(initDB()).rejects.toThrow('Synchronous open failure');
    openSpy.mockRestore();

    const db = await initDB();
    expect(db).toBeDefined();
  });

  it('should close database asynchronously and allow re-opening', async () => {
    const db = await initDB();
    expect(db).toBeDefined();
    await closeDB();
    await expect(closeDB()).resolves.toBeUndefined();
    const newDb = await initDB();
    expect(newDb).toBeDefined();
  });
});

