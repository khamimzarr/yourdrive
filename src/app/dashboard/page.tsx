'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, logout } from '../../lib/telegram';
import { listFiles, listFolders, uploadFile, deleteFile, downloadFile, createFolder, VFSFile } from '../../lib/fileOps';

export default function Dashboard() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');
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
  }, [currentPath, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedFiles, fetchedFolders] = await Promise.all([
        listFiles(currentPath),
        listFolders(currentPath)
      ]);
      setFiles(fetchedFiles);
      setFolders(fetchedFolders);
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteFile(id);
      await fetchData();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-display flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-[#161616]/80 backdrop-blur border-b border-[#e5e5e5]/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-xl font-medium tracking-tight">YourDrive</h1>
          
          <nav className="flex items-center text-sm font-medium gap-2">
            <span className="text-[#686868] px-2">|</span>
            <button 
              onClick={() => handleBreadcrumbClick(-1)}
              className="hover:text-white text-[#c2c2c2] transition-colors"
            >
              Root
            </button>
            {breadcrumbParts.map((part, idx) => (
              <React.Fragment key={idx}>
                <span className="text-[#686868]">/</span>
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className="hover:text-white text-[#c2c2c2] transition-colors"
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowNewFolder(true)}
            className="text-sm font-medium text-[#c2c2c2] hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            New Folder
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Upload File
          </button>
          <div className="w-px h-5 bg-[#333] mx-1"></div>
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-[#c2c2c2] hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-pulse flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6b62f2]"></div>
              <div className="w-2 h-2 rounded-full bg-[#6b62f2] animation-delay-200"></div>
              <div className="w-2 h-2 rounded-full bg-[#6b62f2] animation-delay-400"></div>
            </div>
          </div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-[#686868]">
            <div className="w-24 h-24 mb-6 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 border-dashed">
              <svg className="w-10 h-10 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xl font-medium text-white mb-2 tracking-tight">This folder is empty</p>
            <p className="text-sm text-[#888] mb-8">Upload files or create a new folder to get started.</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium bg-white/10 text-white hover:bg-white/15 px-6 py-2.5 rounded-full transition-colors flex items-center gap-2"
            >
              Upload a file
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Folders */}
            {folders.map(folderName => (
              <div 
                key={folderName}
                onClick={() => navigateToFolder(folderName)}
                className="cursor-pointer bg-[rgba(212,212,212,0.06)] backdrop-blur rounded-[24px] p-4 flex flex-col items-center justify-center gap-3 hover:bg-[rgba(212,212,212,0.1)] transition-colors group"
              >
                <svg className="w-12 h-12 text-[#ededed] group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="text-sm font-medium text-center truncate w-full">{folderName}</span>
              </div>
            ))}
            
            {/* Files */}
            {files.map(file => (
              <div 
                key={file.id}
                className="bg-[rgba(212,212,212,0.06)] backdrop-blur rounded-[24px] p-4 flex flex-col items-center justify-between gap-3 hover:bg-[rgba(212,212,212,0.1)] transition-colors group relative"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                    className="p-1.5 bg-[#161616]/80 rounded-full hover:bg-white hover:text-black transition-colors"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                    className="p-1.5 bg-[#161616]/80 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-center pt-4">
                   <svg className="w-10 h-10 text-[#c2c2c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                   </svg>
                </div>
                <div className="w-full text-center">
                  <p className="text-sm font-medium text-[#ededed] truncate w-full" title={file.name}>{file.name}</p>
                  <p className="text-xs text-[#ash] mt-0.5">{formatSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateFolder} className="bg-[#161616] border border-[#e5e5e5]/10 rounded-[24px] p-6 w-full max-w-sm">
            <h2 className="font-heading text-xl mb-4 text-[#ededed]">Create New Folder</h2>
            <input 
              type="text" 
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full bg-[#0a0a0a] border border-[#e5e5e5]/20 rounded-xl px-4 py-3 text-[#ededed] placeholder-[#686868] focus:outline-none focus:border-[#6b62f2] transition-colors"
            />
            <div className="flex gap-3 mt-6 justify-end">
              <button 
                type="button" 
                onClick={() => setShowNewFolder(false)}
                className="px-4 py-2 text-sm font-medium text-[#c2c2c2] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-white text-black rounded-full font-medium text-sm hover:scale-105 transition-transform"
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
