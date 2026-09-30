import React from 'react';
import Link from 'next/link';
import TerminalMockup from '@/components/TerminalMockup';

export default function Home() {
  return (
    <div className="min-h-screen bg-void-canvas text-bone font-display">
      
      {/* Floating Frosted Nav */}
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-5 py-2.5 nav-glass rounded-full-2 w-[calc(100%-48px)] max-w-[900px] shadow-nav">
        <span className="text-snow-white font-medium tracking-tight text-[15px]">YourDrive</span>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex gap-1.5">
            <button className="px-3.5 py-1.5 rounded-full-2 border border-hairline/15 text-snow-white/85 text-[14px] hover:bg-snow-white/5 hover:scale-105 active:scale-95 transition-all duration-300">
              Features
            </button>
            <button className="px-3.5 py-1.5 rounded-full-2 border border-hairline/15 text-snow-white/85 text-[14px] hover:bg-snow-white/5 hover:scale-105 active:scale-95 transition-all duration-300">
              Privacy
            </button>
          </div>
          <Link href="/login" className="bg-[#ededed] text-black rounded-md px-5 py-2 text-[14px] font-medium hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 ml-2">
            Connect Telegram
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center bg-[#0a0a0a] overflow-hidden">
        
        <div className="max-w-[1200px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10 pt-32 pb-24">
          <div className="flex flex-col gap-8">
            <h1 className="text-[clamp(40px,8vw,72px)] font-medium text-snow-white leading-[1] tracking-[-0.035em]">
              Your files.
              <br />
              Telegram's cloud.
            </h1>
            
            <p className="text-[18px] text-ash leading-relaxed max-w-[420px]">
              Unlimited, serverless cloud storage powered by your Telegram account.
            </p>

            <div className="flex gap-4 items-center">
              <Link href="/login" className="bg-[#ededed] text-black rounded-md px-8 py-3.5 text-[16px] font-medium hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300">
                Get Started
              </Link>
              <button className="rounded-md px-8 py-3.5 text-[16px] font-medium text-[#ededed] bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:scale-105 active:scale-95 transition-all duration-300">
                How it works
              </button>
            </div>
          </div>

          {/* Terminal Mockup */}
          <div className="relative w-full aspect-[4/3] rounded-t-3xl-2 overflow-hidden shadow-subtle hidden lg:block">
            <div className="absolute inset-0 bg-snow-white rounded-t-3xl-2 p-1.5">
              <TerminalMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-[#222]" />

      {/* Features */}
      <main className="max-w-[1200px] mx-auto px-6 py-24 flex flex-col" style={{ gap: '80px' }}>
        
        {/* Numbered List */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="text-[32px] font-heading font-semibold text-bone mb-4 leading-[1.2] tracking-tight">
              Seamless Sync
            </h2>
            <p className="text-[18px] font-heading font-medium text-ash leading-relaxed">
              From your browser, straight to Telegram.
            </p>
          </div>
          
          <div className="flex flex-col">
            {[
              'Connect Telegram',
              'Upload securely',
              'Organize files',
              'Access anywhere',
              'Always in sync',
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-5 border-b border-hairline/10 hover:px-4 hover:bg-white/[0.02] transition-all duration-300 cursor-default rounded-lg">
                <span className="text-[16px] text-bone transition-transform duration-300">{item}</span>
                <span className="text-[16px] text-ash tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-7 hover:-translate-y-2 hover:border-[#444] transition-all duration-300 cursor-default">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">100% Private</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              Client-side encrypted. Nobody but you can access your files.
            </p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-7 hover:-translate-y-2 hover:border-[#444] transition-all duration-300 cursor-default">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">Unlimited</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              2GB per file. No total cap. Built on Telegram's infrastructure.
            </p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-7 hover:-translate-y-2 hover:border-[#444] transition-all duration-300 cursor-default">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">Folder System</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              Organize files and subfolders exactly like a real hard drive.
            </p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-7 hover:-translate-y-2 hover:border-[#444] transition-all duration-300 cursor-default">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">For Everyone</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              Login with any Telegram account for an instant personal cloud.
            </p>
          </div>
        </section>

        {/* Status Banner */}
        <section className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[#222] bg-[#111]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5L7 1Z" fill="#ededed" />
            </svg>
            <span className="text-[14px] text-bone/90 font-medium">Open source & free forever</span>
            <span className="text-[14px] text-ash">→</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-6 py-12 border-t border-hairline/8 flex justify-between items-center">
        <span className="text-[13px] text-slate">© 2026 YourDrive</span>
        <div className="flex gap-4">
          <a href="https://github.com/khamimzarr/yourdrive" className="text-[13px] text-slate hover:text-bone transition-colors">GitHub</a>
          <a href="#" className="text-[13px] text-slate hover:text-bone transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
