# VFS Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Virtual File System to use IndexedDB for metadata caching, enforce a 100MB file limit to prevent OOM crashes, and introduce explicit error handling to the UI.

**Architecture:** We will create a local IndexedDB layer `lib/db.ts` using vanilla Promises. `lib/fileOps.ts` will be updated to sync metadata into this DB and fetch from it instead of Telegram directly. The regex parsing will be hardened. `uploadFile` will reject large files. `dashboard/page.tsx` will display a red banner when errors occur.

**Tech Stack:** Next.js, React, IndexedDB (vanilla), Jest

## Global Constraints

- Max file size: 104,857,600 bytes (100MB)
- No silent catch blocks for network or parsing errors
- All DB operations must be asynchronous (Promises)

---

### Task 1: Create IndexedDB Wrapper

**Files:**
- Create: `src/lib/db.ts`
- Create: `tests/lib/db.test.ts`

**Interfaces:**
- Produces: `initDB()`, `saveFiles(files: VFSFile[])`, `getAllCachedFiles(): Promise<VFSFile[]>`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/db.test.ts
import { initDB, saveFiles, getAllCachedFiles } from '../../src/lib/db';

// Mock indexedDB for Node environment
require('fake-indexeddb/auto');

describe('IndexedDB Wrapper', () => {
  it('should save and retrieve files', async () => {
    await initDB();
    const mockFiles = [{ id: 1, name: 'test.txt', path: '/', size: 100, date: 123, isTrash: false }];
    await saveFiles(mockFiles);
    const files = await getAllCachedFiles();
    expect(files.length).toBe(1);
    expect(files[0].name).toBe('test.txt');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/lib/db.test.ts`
Expected: FAIL with "Cannot find module '../../src/lib/db'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/db.ts
import { VFSFile } from './fileOps';

const DB_NAME = 'YourDriveDB';
const STORE_NAME = 'files';
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveFiles(files: VFSFile[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    files.forEach(f => store.put(f));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllCachedFiles(): Promise<VFSFile[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/lib/db.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/db.ts tests/lib/db.test.ts
git commit -m "feat: add IndexedDB wrapper for file caching"
```

---

### Task 2: Robust Metadata Parsing & 100MB Limit

**Files:**
- Modify: `src/lib/fileOps.ts`
- Create: `tests/lib/fileOps.test.ts`

**Interfaces:**
- Consumes: VFSFile interface
- Produces: Updated `getAllFiles` and `uploadFile`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/fileOps.test.ts
import { uploadFile } from '../../src/lib/fileOps';

describe('File Operations', () => {
  it('should reject file > 100MB', async () => {
    const hugeFile = { name: 'huge.mp4', size: 105000000, arrayBuffer: async () => new ArrayBuffer(0) } as any;
    await expect(uploadFile(hugeFile, '/')).rejects.toThrow('File size exceeds the 100MB limit');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/lib/fileOps.test.ts`
Expected: FAIL (Doesn't throw the expected error)

- [ ] **Step 3: Write minimal implementation**

Modify `src/lib/fileOps.ts`:
Update the `META_REGEX` and `uploadFile`:

```typescript
// At the top of src/lib/fileOps.ts
const META_REGEX = /\[YourDrive-Meta:\s*(\{[\s\S]*?\})\s*\]/;
const MAX_FILE_SIZE = 104857600; // 100MB

// Inside uploadFile
export async function uploadFile(file: File, folderPath: string): Promise<VFSFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 100MB limit');
  }
  const client = await getClient();
  
  const toUpload = typeof window !== 'undefined' ? file : Buffer.from(await file.arrayBuffer());
  const meta = { path: folderPath, name: file.name };
  const caption = `[YourDrive-Meta: ${JSON.stringify(meta)}]`;
  
  const msg = await client.sendFile('me', {
    file: toUpload as any,
    caption,
    forceDocument: true
  });
  
  return {
    id: msg.id,
    name: file.name,
    path: folderPath,
    size: file.size,
    date: msg.date
  };
}
```

Also modify JSON parsing inside `getAllFiles` (no test required for this refactor step, but crucial for robustness):
```typescript
// Inside getAllFiles loop
    if (msg.message) {
      const match = msg.message.match(META_REGEX);
      if (match) {
        try {
          meta = JSON.parse(match[1]);
        } catch(e) {
          console.warn('Failed to parse metadata for message', msg.id, e);
          // Don't silently swallow, at least warn
        }
      }
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/lib/fileOps.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/fileOps.ts tests/lib/fileOps.test.ts
git commit -m "fix: enforce 100MB upload limit and robust regex"
```

---

### Task 3: Sync `getAllFiles` with IndexedDB

**Files:**
- Modify: `src/lib/fileOps.ts`

**Interfaces:**
- Consumes: `saveFiles`, `getAllCachedFiles` from `src/lib/db.ts`
- Produces: Updated `getAllFiles` method that syncs with Telegram and returns cached + new files.

- [ ] **Step 1: Write the failing test**

*(We will skip TDD for the complex Telegram sync integration since it requires heavily mocking `teleproto`. We will implement it directly).*

- [ ] **Step 2: Write minimal implementation**

Modify `src/lib/fileOps.ts` to import DB methods and update `getAllFiles`:
```typescript
import { saveFiles, getAllCachedFiles } from './db';

export async function getAllFiles(): Promise<VFSFile[]> {
  let cachedFiles = [];
  try {
    cachedFiles = await getAllCachedFiles();
  } catch(e) {
    console.warn('IndexedDB not available, falling back to full fetch', e);
  }
  
  const highestId = cachedFiles.length > 0 ? Math.max(...cachedFiles.map(f => f.id)) : 0;
  
  const client = await getClient();
  // Fetch messages newer than highestId
  const messages = await client.getMessages('me', { minId: highestId, limit: 1000 });
  const newFiles: VFSFile[] = [];
  
  for (const msg of messages) {
    if (!msg.media) continue;
    
    let meta: any = null;
    if (msg.message) {
      const match = msg.message.match(META_REGEX);
      if (match) {
        try { meta = JSON.parse(match[1]); } catch(e) { console.warn('Bad meta', e); }
      }
    }
    
    let path = '/'; let name = 'Unknown File'; let isTrash = false;
    if (meta) {
       path = meta.path || '/'; name = meta.name || name; isTrash = !!meta.trash;
    } else {
       if (msg.media.document) name = 'Document';
    }
    
    let size = msg.media.document ? Number(msg.media.document.size) || 0 : 0;
    
    newFiles.push({
      id: msg.id, name, path, size, date: msg.date, isTrash, rawMeta: meta
    });
  }
  
  if (newFiles.length > 0) {
     try {
       await saveFiles(newFiles);
     } catch (e) {
       console.error('Failed to save to cache', e);
     }
  }
  
  return [...newFiles, ...cachedFiles].sort((a, b) => b.id - a.id);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/fileOps.ts
git commit -m "feat: sync file fetches with IndexedDB caching"
```

---

### Task 4: UI Error Handling in Dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**
- Displays errors thrown from `fetchData` and `uploadFile`.

- [ ] **Step 1: Write minimal implementation**

Modify `src/app/dashboard/page.tsx` to add `error` state and display it:
```tsx
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'files') {
        const [fetchedFiles, fetchedFolders] = await Promise.all([
          listFiles(currentPath),
          listFolders(currentPath)
        ]);
        setFiles(fetchedFiles);
        setFolders(fetchedFolders);
      } // ... (keep other conditions)
    } catch (e: any) {
      setError(e.message || 'Failed to load files. Session may be expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const file = e.target.files[0];
      await uploadFile(file, currentPath);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Render the error banner inside the main content area (top of `<main>`)
  // Add this right after `<main className="flex-1 p-8 overflow-y-auto">`
  {error && (
    <div className="bg-red-500 text-pure-paper p-4 rounded-md mb-6 font-bold flex justify-between items-center">
       <span>Error: {error}</span>
       <button onClick={() => setError(null)} className="underline text-sm">Dismiss</button>
    </div>
  )}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add visible error banner in dashboard"
```
