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
            <button className="px-3.5 py-1.5 rounded-full-2 border border-hairline/15 text-snow-white/85 text-[14px] hover:bg-snow-white/5 transition-colors duration-200">
              Features
            </button>
            <button className="px-3.5 py-1.5 rounded-full-2 border border-hairline/15 text-snow-white/85 text-[14px] hover:bg-snow-white/5 transition-colors duration-200">
              Privacy
            </button>
          </div>
          <Link href="/login" className="bg-snow-white text-ink-black rounded-full-2 px-4 py-1.5 text-[14px] font-medium hover:bg-bone transition-colors duration-200 ml-2">
            Connect Telegram
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center bg-hero-horizon overflow-hidden">
        {/* Radial violet glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(107,98,242,0.4) 0%, transparent 70%)' }}
        />
        
        <div className="max-w-[1200px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10 pt-32 pb-24">
          <div className="flex flex-col gap-8">
            <h1 className="text-[clamp(40px,8vw,72px)] font-medium text-snow-white leading-[1] tracking-[-0.035em]">
              Your files.
              <br />
              Telegram's cloud.
            </h1>
            
            <p className="text-[18px] text-ash leading-relaxed max-w-[420px]">
              Private, unlimited storage using your own Telegram account. No servers. No middleman.
            </p>

            <div className="flex gap-3 items-center">
              <Link href="/login" className="bg-snow-white text-ink-black rounded-full-2 px-6 py-3 text-[16px] font-medium hover:bg-bone transition-colors duration-200">
                Get Started
              </Link>
              <button className="rounded-full-2 px-6 py-3 text-[16px] text-snow-white/80 border border-hairline/15 hover:bg-snow-white/5 transition-colors duration-200">
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

      {/* Dusk Violet Wash */}
      <div className="w-full h-px bg-dusk-violet-wash" />

      {/* Features */}
      <main className="max-w-[1200px] mx-auto px-6 py-24 flex flex-col" style={{ gap: '80px' }}>
        
        {/* Numbered List */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="text-[32px] font-heading font-semibold text-bone mb-4 leading-[1.2] tracking-tight">
              How it works
            </h2>
            <p className="text-[18px] font-heading font-medium text-ash leading-relaxed">
              Files go straight from your browser to Telegram. Nothing in between.
            </p>
          </div>
          
          <div className="flex flex-col">
            {[
              'Login with your Telegram account',
              'Upload files to your Saved Messages',
              'Organize with virtual folders',
              'Download or stream anytime',
              'Sync across all your devices',
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-5 border-b border-hairline/10">
                <span className="text-[16px] text-bone">{item}</span>
                <span className="text-[16px] text-ash tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="frosted-card p-7">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">100% Private</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              No server sees your files. Everything runs client-side in your browser via MTProto.
            </p>
          </div>
          <div className="frosted-card p-7">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">Truly Unlimited</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              Up to 2GB per file, no total cap. Powered by Telegram's free cloud infrastructure.
            </p>
          </div>
          <div className="frosted-card p-7">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">Folder System</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              Organize your Saved Messages into folders and subfolders — just like a real drive.
            </p>
          </div>
          <div className="frosted-card p-7">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">For Everyone</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              Each family member logs in with their own Telegram. Personal clouds, zero config.
            </p>
          </div>
        </section>

        {/* Status Banner */}
        <section className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full-2 border border-hairline/12 bg-graphite/50 backdrop-blur-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5L7 1Z" fill="#6b62f2" />
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
