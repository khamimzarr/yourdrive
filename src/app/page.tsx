import React from 'react';

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
              Security
            </button>
          </div>
          <button className="bg-snow-white text-ink-black rounded-full-2 px-4 py-1.5 text-[14px] font-medium hover:bg-bone transition-colors duration-200 ml-2">
            Connect Telegram
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center bg-hero-horizon overflow-hidden">
        {/* Subtle radial violet glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(107,98,242,0.4) 0%, transparent 70%)' }}
        />
        
        <div className="max-w-[1200px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10 pt-32 pb-24">
          <div className="flex flex-col gap-10">
            <h1 className="text-[clamp(40px,8vw,72px)] font-medium text-snow-white leading-[1] tracking-[-0.035em]">
              Store it once.
              <br />
              Keep it forever.
            </h1>
            
            <div className="flex flex-col gap-4">
              {[
                'Client-side MTProto integration',
                'Unlimited Saved Messages storage',
                'End-to-end privacy guaranteed',
                'No server — runs in your browser'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <rect width="16" height="16" rx="4" fill="rgba(255,255,255,0.12)" />
                    <path d="M5 8L7 10L11 6" stroke="#ededed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[16px] text-bone/90 leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 items-center">
              <button className="bg-snow-white text-ink-black rounded-full-2 px-6 py-3 text-[16px] font-medium hover:bg-bone transition-colors duration-200">
                Start Using YourDrive
              </button>
              <button className="rounded-full-2 px-6 py-3 text-[16px] text-snow-white/80 border border-hairline/15 hover:bg-snow-white/5 transition-colors duration-200">
                Learn more
              </button>
            </div>
          </div>

          {/* Device Mockup */}
          <div className="relative w-full aspect-[4/3] rounded-t-3xl-2 overflow-hidden shadow-subtle hidden lg:block">
            <div className="absolute inset-0 bg-snow-white rounded-t-3xl-2 p-1.5">
              <div className="w-full h-full bg-void-canvas rounded-t-[34px] p-5 flex flex-col gap-3 overflow-hidden">
                {/* Mockup toolbar */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></div>
                  </div>
                  <div className="flex-1 h-6 bg-graphite rounded-md mx-8"></div>
                </div>
                {/* Mockup sidebar + content */}
                <div className="flex gap-3 flex-1 min-h-0">
                  <div className="w-1/4 flex flex-col gap-2">
                    <div className="h-4 w-full bg-graphite/70 rounded"></div>
                    <div className="h-4 w-3/4 bg-graphite/50 rounded"></div>
                    <div className="h-4 w-5/6 bg-dusk-violet/20 rounded"></div>
                    <div className="h-4 w-2/3 bg-graphite/50 rounded"></div>
                    <div className="h-4 w-4/5 bg-graphite/50 rounded"></div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 bg-graphite/60 rounded-lg"></div>
                      <div className="h-16 bg-graphite/60 rounded-lg"></div>
                      <div className="h-16 bg-graphite/60 rounded-lg"></div>
                    </div>
                    <div className="flex-1 bg-graphite/30 rounded-lg min-h-[60px]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dusk Violet Wash divider */}
      <div className="w-full h-px bg-dusk-violet-wash" />

      {/* Features Section */}
      <main className="max-w-[1200px] mx-auto px-6 py-24 flex flex-col" style={{ gap: '80px' }}>
        
        {/* Numbered Accordion Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="text-[32px] font-heading font-semibold text-bone mb-4 leading-[1.2] tracking-tight">
              What YourDrive handles for you
            </h2>
            <p className="text-[18px] font-heading font-medium text-ash leading-relaxed">
              Our system intercepts your local file operations and safely routes them through Telegram's cloud infrastructure.
            </p>
          </div>
          
          <div className="flex flex-col">
            {[
              'Virtual File System Mapping',
              'Zero-knowledge Encryption',
              'Metadata Caption Injection',
              'Direct MTProto File Streaming',
              'Automatic Chunk Splitting',
              'Cross-device Sync',
              'Folder Organization'
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-5 border-b border-hairline/10">
                <span className="text-[16px] text-bone">{item}</span>
                <span className="text-[16px] text-ash tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Frosted Glass Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="frosted-card p-7">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">Complete Privacy</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              YourDrive acts as a pure local client. There is no middleman server — your session strings and files never leave your browser.
            </p>
          </div>
          <div className="frosted-card p-7">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">Native Experience</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              A cloud drive interface that feels native to your OS, with drag-and-drop uploads, folder trees, and instant search.
            </p>
          </div>
          <div className="frosted-card p-7">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">Unlimited Storage</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              Leverage Telegram's generous storage limits. Upload files up to 2GB each with no total storage cap — free forever.
            </p>
          </div>
          <div className="frosted-card p-7">
            <h3 className="text-[24px] font-heading font-medium text-bone mb-3 leading-tight">Family & Friends</h3>
            <p className="text-[16px] text-ash leading-relaxed">
              Each member logs in with their own Telegram account. Personal clouds, shared convenience, zero configuration.
            </p>
          </div>
        </section>

        {/* Status Banner */}
        <section className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full-2 border border-hairline/12 bg-graphite/50 backdrop-blur-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5L7 1Z" fill="#6b62f2" />
            </svg>
            <span className="text-[14px] text-bone/90 font-medium">Currently in development — join the beta</span>
            <span className="text-[14px] text-ash">→</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-6 py-12 border-t border-hairline/8 flex justify-between items-center">
        <span className="text-[13px] text-slate">© 2026 YourDrive</span>
        <div className="flex gap-4">
          <a href="#" className="text-[13px] text-slate hover:text-bone transition-colors">GitHub</a>
          <a href="#" className="text-[13px] text-slate hover:text-bone transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
