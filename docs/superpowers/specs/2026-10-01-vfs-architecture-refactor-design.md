# VFS Architecture Refactor Design

## Overview
The current Virtual File System (VFS) implementation relies on stateless API calls to Telegram (`getMessages` with a hard limit of 100), loads entire files into RAM via `Buffer`, and silently swallows errors. This design specifies an architectural refactor to introduce IndexedDB caching for infinite pagination, hard file size limits to prevent OOM crashes, and explicit error handling to the UI layer.

## Architecture

### 1. IndexedDB Caching Layer
- **Component**: A new lightweight local database wrapper (e.g., using standard IndexedDB or a tiny wrapper if necessary, though vanilla IndexedDB with Promises is sufficient for this scope).
- **Schema**: Store file records (id, name, path, size, date, isTrash, rawMeta).
- **Data Flow**:
  1. **Initialization**: On dashboard mount, load all known files from IndexedDB and render immediately.
  2. **Synchronization**: Query the highest `message.id` currently in IndexedDB. Fetch only messages newer than this ID from Telegram.
  3. **Update**: Merge new files into IndexedDB and re-render the UI.

### 2. File Size Limiting
- **Component**: Upload UI (`<input type="file">` handler) and `uploadFile` method.
- **Constraint**: Max file size is hardcoded to 100MB (104,857,600 bytes).
- **Behavior**: If `file.size` exceeds the limit, immediately block the upload and throw an error to the UI. No attempt is made to read it into a `Buffer`.

### 3. Metadata Validation
- **Component**: `META_REGEX` in `lib/fileOps.ts`.
- **Constraint**: The current regex `/\[YourDrive-Meta:\s*(\{.*\})\s*\]/` is brittle.
- **Behavior**: Update regex to `/\[YourDrive-Meta:\s*(\{[\s\S]*?\})\s*\]/` to support multiline JSON. Add strict try-catch around `JSON.parse` that flags the file as corrupted (or skips metadata extraction gracefully) without crashing the loop.

### 4. Error Handling & Propagation
- **Component**: `lib/fileOps.ts` and `dashboard/page.tsx`.
- **Behavior**: 
  - Remove silent `catch (e) {}` blocks that swallow network or parsing errors.
  - In `dashboard/page.tsx`, introduce an `error` state. If `fetchData` or `uploadFile` throws, catch it and set the error state.
  - Render a clear, red error banner in the UI showing the failure reason (e.g., "Session expired" or "File exceeds 100MB").

## Trade-offs Made
- Chose a hard 100MB size limit over MTProto Chunked Streaming to save implementation time, sacrificing the "Unlimited 2GB per file" capability of Telegram.
- Relying on IndexedDB introduces statefulness to the client, requiring a robust sync mechanism (fetching delta IDs) instead of a simple stateless fetch.

## Testing Strategy
- Verify that a local database is populated upon first load.
- Verify that exceeding 100 files no longer hides older files (as they are cached).
- Attempt to upload a 101MB file and verify it is rejected instantly without freezing the browser.
- Simulate an expired session and verify the UI shows an explicit error message instead of an empty file list.
