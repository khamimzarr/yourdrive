import { getClient } from './telegram';
import { Api } from 'teleproto';

export interface VFSFile {
  id: number;
  name: string;
  path: string;
  size: number;
  date: number;
  mimeType?: string;
  isTrash?: boolean;
  rawMeta?: any;
}

const META_REGEX = /\[YourDrive-Meta:\s*(\{.*\})\s*\]/;

export async function getAllFiles(): Promise<VFSFile[]> {
  const client = await getClient();
  const messages = await client.getMessages('me', { limit: 100 });
  const allFiles: VFSFile[] = [];
  
  for (const msg of messages) {
    if (!msg.media) continue;
    
    let meta: any = null;
    if (msg.message) {
      const match = msg.message.match(META_REGEX);
      if (match) {
        try {
          meta = JSON.parse(match[1]);
        } catch(e) {}
      }
    }
    
    let path = '/';
    let name = 'Unknown File';
    let isTrash = false;
    
    if (meta) {
       path = meta.path || '/';
       name = meta.name || name;
       isTrash = !!meta.trash;
    } else {
       if (msg.media instanceof Api.MessageMediaDocument && msg.media.document instanceof Api.Document) {
          for (const attr of msg.media.document.attributes) {
             if (attr instanceof Api.DocumentAttributeFilename) {
                name = attr.fileName;
             }
          }
       } else if (msg.media instanceof Api.MessageMediaPhoto) {
          name = `Photo_${msg.id}.jpg`;
       }
    }
    
    let size = 0;
    if (msg.media instanceof Api.MessageMediaDocument && msg.media.document instanceof Api.Document) {
       size = Number(msg.media.document.size) || 0;
    }
    
    allFiles.push({
      id: msg.id,
      name,
      path,
      size,
      date: msg.date,
      isTrash,
      rawMeta: meta
    });
  }
  
  return allFiles;
}

export async function listFiles(folderPath: string): Promise<VFSFile[]> {
  const all = await getAllFiles();
  return all.filter(f => f.path === folderPath && !f.isTrash);
}

export async function listTrashFiles(): Promise<VFSFile[]> {
  const all = await getAllFiles();
  return all.filter(f => f.isTrash);
}

export async function listRecentFiles(): Promise<VFSFile[]> {
  const all = await getAllFiles();
  return all.filter(f => !f.isTrash && f.path !== '/.trash').sort((a, b) => b.date - a.date);
}

export async function moveToTrash(file: VFSFile): Promise<void> {
  const client = await getClient();
  const meta = { ...(file.rawMeta || {}), trash: true, originalPath: file.path };
  const caption = `[YourDrive-Meta: ${JSON.stringify(meta)}]`;
  await client.editMessage('me', { message: file.id, text: caption });
}

export async function restoreFromTrash(file: VFSFile): Promise<void> {
  const client = await getClient();
  const meta = { ...(file.rawMeta || {}) };
  delete meta.trash;
  meta.path = meta.originalPath || '/';
  delete meta.originalPath;
  const caption = `[YourDrive-Meta: ${JSON.stringify(meta)}]`;
  await client.editMessage('me', { message: file.id, text: caption });
}

export async function listFolders(basePath: string = '/'): Promise<string[]> {
  const client = await getClient();
  const messages = await client.getMessages('me', { limit: 100 });
  const folders = new Set<string>();
  
  for (const msg of messages) {
    let meta: any = null;
    if (msg.message) {
      const match = msg.message.match(META_REGEX);
      if (match) {
        try { meta = JSON.parse(match[1]); } catch(e) {}
      }
    }
    
    if (meta && meta.type === 'folder') {
       if (meta.path === basePath && meta.name) {
          folders.add(meta.name);
       }
    } else if (meta && meta.path) {
       if (meta.path.startsWith(basePath) && meta.path !== basePath) {
          const rest = meta.path.substring(basePath.length);
          const parts = rest.split('/').filter(Boolean);
          if (parts.length > 0) {
             folders.add(parts[0]);
          }
       }
    }
  }
  
  return Array.from(folders);
}

export async function uploadFile(file: File, folderPath: string): Promise<VFSFile> {
  const client = await getClient();
  
  // Some environments need Buffer for teleproto
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

export async function deleteFile(messageId: number): Promise<void> {
  const client = await getClient();
  await client.deleteMessages('me', [messageId], { revoke: true });
}

export async function downloadFile(messageId: number): Promise<Buffer> {
  const client = await getClient();
  const msgs = await client.getMessages('me', { ids: [messageId] });
  if (msgs.length === 0) throw new Error('File not found');
  
  const buffer = await client.downloadMedia(msgs[0]);
  return buffer as Buffer;
}

export async function createFolder(folderPath: string): Promise<void> {
  const client = await getClient();
  
  const parts = folderPath.split('/').filter(Boolean);
  const name = parts.pop() || '';
  const path = '/' + parts.join('/') + (parts.length > 0 ? '/' : '');
  
  const meta = { type: 'folder', path, name };
  const caption = `[YourDrive-Meta: ${JSON.stringify(meta)}]`;
  await client.sendMessage('me', { message: caption });
}
