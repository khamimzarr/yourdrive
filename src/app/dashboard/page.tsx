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
    } catch (e) {
      console.error('Error fetching data:', e);
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
    try {
      const file = e.target.files[0];
      await uploadFile(file, currentPath);
      await fetchData();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed');
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

  const handleDownload = async (file: VFSFile) => {
    try {
      const buffer = await downloadFile(file.id);
      const blob = new Blob([buffer as any], { type: file.mimeType || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Download failed');
    }
  };
  
  const breadcrumbParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="h-screen w-full bg-hero-horizon text-bone font-display flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[240px] border-r border-hairline/10 bg-graphite/30 backdrop-blur-xl flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6">
          <div className="text-snow-white font-medium text-lg mb-8 tracking-tight">YourDrive</div>
          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors text-[14px] ${activeTab === 'files' ? 'bg-white/[0.08] text-snow-white' : 'text-ash hover:bg-white/[0.04] hover:text-snow-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
              My Files
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors text-[14px] ${activeTab === 'recent' ? 'bg-white/[0.08] text-snow-white' : 'text-ash hover:bg-white/[0.04] hover:text-snow-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Recent
            </button>
            <button 
              onClick={() => setActiveTab('trash')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors text-[14px] ${activeTab === 'trash' ? 'bg-white/[0.08] text-snow-white' : 'text-ash hover:bg-white/[0.04] hover:text-snow-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Trash
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-graphite/20 backdrop-blur-md border-b border-hairline/10 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {activeTab === 'files' && (
              <nav className="flex items-center text-[15px] font-medium gap-2">
                <button 
                  onClick={() => handleBreadcrumbClick(-1)}
                  className="hover:text-snow-white text-ash transition-colors"
                >
                  Root
                </button>
                {breadcrumbParts.map((part, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-slate">/</span>
                    <button
                      onClick={() => handleBreadcrumbClick(idx)}
                      className="hover:text-snow-white text-ash transition-colors"
                    >
                      {part}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            )}
            {activeTab === 'recent' && <span className="text-[15px] font-medium text-snow-white">Recent Files</span>}
            {activeTab === 'trash' && <span className="text-[15px] font-medium text-snow-white">Trash</span>}
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'files' && (
              <>
                <button 
                  onClick={() => setShowNewFolder(true)}
                  className="px-4 py-2 rounded-full-2 border border-hairline/15 text-snow-white/85 text-[14px] hover:bg-snow-white/5 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  New Folder
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-snow-white text-ink-black rounded-full-2 px-5 py-2 text-[14px] font-medium hover:bg-bone hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-white/10"
                >
                  Upload
                </button>
              </>
            )}
            <div className="w-px h-5 bg-hairline/10 mx-2"></div>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-[#888] hover:text-[#ededed] transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-pulse flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#444]"></div>
                <div className="w-2 h-2 rounded-full bg-[#444] animation-delay-200"></div>
                <div className="w-2 h-2 rounded-full bg-[#444] animation-delay-400"></div>
              </div>
            </div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate">
              <div className="w-16 h-16 mb-4 rounded-xl bg-white/[0.02] flex items-center justify-center border border-hairline/10 border-dashed">
                <svg className="w-6 h-6 text-ash" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-[15px] font-medium text-bone mb-1">No files found</p>
              <p className="text-[13px] text-ash">This section is completely empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {/* Folders */}
              {folders.map(folderName => (
                <div 
                  key={folderName}
                  onClick={() => navigateToFolder(folderName)}
                  className="cursor-pointer frosted-card p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group"
                >
                  <svg className="w-6 h-6 text-ash group-hover:text-snow-white transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="text-[15px] font-medium truncate text-bone group-hover:text-snow-white transition-colors">{folderName}</span>
                </div>
              ))}
              
              {/* Files */}
              {files.map(file => (
                <div 
                  key={file.id}
                  className="frosted-card p-5 flex flex-col justify-between gap-4 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group relative h-36"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-graphite/80 backdrop-blur-md rounded-lg border border-hairline/10 shadow-lg">
                    {activeTab !== 'trash' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                        className="p-1.5 hover:bg-white/10 text-ash hover:text-snow-white transition-colors rounded-l-lg"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      </button>
                    )}
                    {activeTab === 'trash' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRestore(file); }}
                        className="p-1.5 hover:bg-white/10 text-ash hover:text-snow-white transition-colors rounded-l-lg border-r border-hairline/10"
                        title="Restore"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                      className="p-1.5 hover:bg-red-500/20 text-ash hover:text-red-400 transition-colors rounded-r-lg"
                      title={activeTab === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center pt-2">
                     <svg className="w-8 h-8 text-slate group-hover:text-ash transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                     </svg>
                  </div>
                  
                  <div>
                    <p className="text-[13px] font-medium text-bone group-hover:text-snow-white transition-colors truncate w-full" title={file.name}>{file.name}</p>
                    <p className="text-[11px] text-slate mt-1">{formatSize(file.size)}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateFolder} className="bg-graphite border border-hairline/15 rounded-3xl-2 p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-[20px] font-heading font-medium mb-6 text-snow-white">Create New Folder</h2>
            <input 
              type="text" 
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full bg-white/[0.04] border border-hairline/10 rounded-xl px-4 py-3 text-bone placeholder-[#666] focus:outline-none focus:border-white/30 transition-colors"
            />
            <div className="flex gap-3 mt-6 justify-end">
              <button 
                type="button" 
                onClick={() => setShowNewFolder(false)}
                className="px-5 py-2.5 rounded-full-2 text-[14px] font-medium text-ash hover:text-snow-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 rounded-full-2 text-[14px] font-medium bg-snow-white text-ink-black hover:bg-bone transition-colors"
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
