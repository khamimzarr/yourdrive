'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, logout } from '../../lib/telegram';
import { listFiles, listFolders, uploadFile, deleteFile, downloadFile, createFolder, VFSFile, listRecentFiles, listTrashFiles, moveToTrash, restoreFromTrash } from '../../lib/fileOps';

export default function Dashboard() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');
  const [activeTab, setActiveTab] = useState<'files' | 'recent' | 'trash'>('files');
  const [files, setFiles] = useState<VFSFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [currentPath, router, activeTab]);

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
      } else if (activeTab === 'recent') {
        setFiles(await listRecentFiles());
        setFolders([]);
      } else if (activeTab === 'trash') {
        setFiles(await listTrashFiles());
        setFolders([]);
      }
    } catch (e: any) {
      console.error('Error fetching data:', e);
      setError(e.message || 'Failed to load files. Session may be expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const navigateToFolder = (folderName: string) => {
    setCurrentPath(`${currentPath}${folderName}/`);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentPath('/');
      return;
    }
    const parts = currentPath.split('/').filter(Boolean);
    const newPath = '/' + parts.slice(0, index + 1).join('/') + '/';
    setCurrentPath(newPath);
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
      console.error('Upload failed', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const newPath = `${currentPath}${newFolderName.trim()}/`;
      await createFolder(newPath);
      setShowNewFolder(false);
      setNewFolderName('');
      await fetchData();
    } catch (err) {
      console.error('Failed to create folder', err);
      alert('Failed to create folder');
    }
  };

  const handleDelete = async (file: VFSFile) => {
    if (activeTab === 'trash') {
      if (!confirm('Are you sure you want to permanently delete this file?')) return;
      try {
        await deleteFile(file.id);
        await fetchData();
      } catch (err) {
        console.error('Delete failed', err);
        alert('Delete failed');
      }
    } else {
      try {
        await moveToTrash(file);
        await fetchData();
      } catch (err) {
        console.error('Move to trash failed', err);
        alert('Move to trash failed');
      }
    }
  };

  const handleRestore = async (file: VFSFile) => {
    try {
      await restoreFromTrash(file);
      await fetchData();
    } catch (err) {
      console.error('Restore failed', err);
      alert('Restore failed');
    }
  };

  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
      webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp',
      mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
      pdf: 'application/pdf', zip: 'application/zip', rar: 'application/x-rar-compressed',
      doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain', json: 'application/json', csv: 'text/csv',
    };
    return mimeMap[ext] || 'application/octet-stream';
  };

  const handleDownload = async (file: VFSFile) => {
    try {
      const buffer = await downloadFile(file.id);
      const mimeType = file.mimeType || getMimeType(file.name);
      const blob = new Blob([buffer as any], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download failed', err);
      setError(err?.message || 'Download failed');
    }
  };
  
  const breadcrumbParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="h-screen w-full bg-warm-canvas text-charcoal font-inter flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[280px] bg-khaki-paper border-r border-hairline flex flex-col justify-between shrink-0 h-full">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-5 h-5 rounded-full bg-lime-signal relative overflow-hidden flex-shrink-0">
               <div className="absolute top-0 left-0 w-full h-1/2 bg-charcoal"></div>
            </div>
            <span className="font-bold text-[18px] tracking-tight">YourDrive</span>
          </div>
          
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors border ${activeTab === 'files' ? 'bg-ink-stone text-pure-paper border-ink-stone' : 'bg-transparent text-charcoal border-transparent hover:border-charcoal'}`}
            >
              My Files
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors border ${activeTab === 'recent' ? 'bg-ink-stone text-pure-paper border-ink-stone' : 'bg-transparent text-charcoal border-transparent hover:border-charcoal'}`}
            >
              Recent
            </button>
            <button 
              onClick={() => setActiveTab('trash')}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors border ${activeTab === 'trash' ? 'bg-ink-stone text-pure-paper border-ink-stone' : 'bg-transparent text-charcoal border-transparent hover:border-charcoal'}`}
            >
              Trash
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-warm-canvas overflow-hidden">
        {/* Top bar */}
        <header className="h-[80px] border-b border-hairline px-8 flex items-center justify-between bg-warm-canvas shrink-0">
          <div className="flex items-center gap-4">
            {activeTab === 'files' && (
              <nav className="flex items-center text-[16px] font-bold gap-2 text-charcoal">
                <button 
                  onClick={() => handleBreadcrumbClick(-1)}
                  className="hover:underline"
                >
                  Root
                </button>
                {breadcrumbParts.map((part, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-ash">/</span>
                    <button
                      onClick={() => handleBreadcrumbClick(idx)}
                      className="hover:underline"
                    >
                      {part}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            )}
            {activeTab === 'recent' && <span className="text-[16px] font-bold text-charcoal">Recent Files</span>}
            {activeTab === 'trash' && <span className="text-[16px] font-bold text-charcoal">Trash</span>}
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'files' && (
              <>
                <button 
                  onClick={() => setShowNewFolder(true)}
                  className="px-5 py-2 rounded-full border border-charcoal text-charcoal font-bold text-[14px] bg-pure-paper hover:bg-black/5 transition-colors"
                >
                  New Folder
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 rounded-full bg-amber-pulse text-charcoal font-bold text-[14px] flex items-center hover:opacity-90 transition-opacity"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </>
            )}
            <div className="w-px h-6 bg-hairline mx-2"></div>
            <button 
              onClick={handleLogout}
              className="text-[14px] font-bold text-ash hover:text-charcoal transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {error && (
            <div className="bg-red-500 text-pure-paper p-4 rounded-md mb-6 font-bold flex justify-between items-center">
              <span>Error: {error}</span>
              <button onClick={() => setError(null)} className="underline text-sm">Dismiss</button>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <span className="font-bold text-ash">Loading...</span>
            </div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <p className="text-[18px] font-bold text-charcoal mb-2">It's quiet in here</p>
              <p className="text-[14px] text-ash font-normal">This section is completely empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {/* Folders */}
              {folders.map(folderName => (
                <div 
                  key={folderName}
                  onClick={() => navigateToFolder(folderName)}
                  className="cursor-pointer bg-pure-paper border border-hairline rounded-md p-6 flex flex-col gap-4 hover:border-charcoal transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-khaki-paper flex items-center justify-center group-hover:bg-charcoal group-hover:text-pure-paper transition-colors font-bold text-[18px]">
                    /
                  </div>
                  <span className="text-[16px] font-bold truncate text-charcoal">{folderName}</span>
                </div>
              ))}
              
              {/* Files */}
              {files.map(file => (
                <div 
                  key={file.id}
                  className="bg-pure-paper border border-hairline rounded-md flex flex-col group relative overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-pale-mist w-full relative flex items-center justify-center border-b border-hairline">
                     {/* The lime-signal sun motif for files */}
                     <div className="w-12 h-12 relative overflow-hidden bg-warm-canvas rounded-md">
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-lime-signal"></div>
                     </div>
                     
                     <div className="absolute inset-0 bg-charcoal/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {activeTab !== 'trash' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                            className="px-4 py-1.5 bg-pure-paper text-charcoal rounded-full font-bold text-[12px] hover:bg-amber-pulse transition-colors"
                          >
                            Download
                          </button>
                        )}
                        {activeTab === 'trash' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRestore(file); }}
                            className="px-4 py-1.5 bg-pure-paper text-charcoal rounded-full font-bold text-[12px] hover:bg-amber-pulse transition-colors"
                          >
                            Restore
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                          className="px-4 py-1.5 border border-pure-paper text-pure-paper rounded-full font-bold text-[12px] hover:bg-red-500 hover:border-red-500 transition-colors"
                        >
                          {activeTab === 'trash' ? 'Delete' : 'Trash'}
                        </button>
                     </div>
                  </div>
                  <div className="p-4 flex flex-col">
                    <p className="text-[14px] font-bold text-charcoal truncate" title={file.name}>{file.name}</p>
                    <p className="text-[12px] text-ash font-normal mt-1">{formatSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
          <form onSubmit={handleCreateFolder} className="bg-pure-paper border border-hairline rounded-md p-8 w-full max-w-sm">
            <h2 className="text-[20px] font-bold mb-6 text-charcoal">Create folder</h2>
            <input 
              type="text" 
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full bg-warm-canvas border border-hairline rounded-md px-4 py-3 text-charcoal font-normal focus:outline-none focus:border-charcoal transition-colors mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setShowNewFolder(false)}
                className="px-5 py-2.5 rounded-full border border-charcoal font-bold text-[14px] text-charcoal hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 rounded-full font-bold text-[14px] bg-charcoal text-pure-paper hover:opacity-90 transition-opacity"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
