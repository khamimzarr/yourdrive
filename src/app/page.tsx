import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-void-canvas text-bone font-dm-sans selection:bg-dusk-violet selection:text-snow-white">
      
      {/* Floating Frosted Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-4 py-2 bg-graphite/80 backdrop-blur-md rounded-2xl border border-hairline w-[90%] max-w-[1200px] shadow-subtle">
        <div className="flex items-center gap-6">
          <span className="text-snow-white font-semibold tracking-tight text-lg">YourDrive</span>
          <div className="hidden md:flex gap-2">
            <button className="px-[14px] py-[6px] rounded-full-2 border border-hairline text-snow-white/85 text-sm hover:bg-snow-white/5 transition-colors">
              Features
            </button>
            <button className="px-[14px] py-[6px] rounded-full-2 border border-hairline text-snow-white/85 text-sm hover:bg-snow-white/5 transition-colors">
              Security
            </button>
          </div>
        </div>
        <button className="bg-snow-white text-graphite rounded-full-2 px-3 py-2 text-sm font-medium hover:bg-bone transition-colors">
          Connect Telegram
        </button>
      </nav>

      {/* Hero Horizon Section */}
      <section className="relative w-full pt-48 pb-32 px-6 overflow-hidden bg-hero-horizon">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          <div className="flex flex-col gap-8">
            <h1 className="text-display font-medium tracking-display text-snow-white leading-display">
              Store it once. <br/> Keep it forever.
            </h1>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-snow-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-ink-black rounded-full"></div>
                </div>
                <span className="text-body text-bone">Client-side MTProto integration</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-snow-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-ink-black rounded-full"></div>
                </div>
                <span className="text-body text-bone">Unlimited Saved Messages storage</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-snow-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-ink-black rounded-full"></div>
                </div>
                <span className="text-body text-bone">End-to-end privacy guaranteed</span>
              </div>
            </div>

            <div>
              <button className="bg-snow-white text-graphite rounded-full-2 px-6 py-3 font-medium text-body hover:bg-bone transition-colors shadow-subtle">
                Start Using YourDrive
              </button>
            </div>
          </div>

          {/* Device Mockup */}
          <div className="relative w-full aspect-[4/3] bg-snow-white rounded-t-3xl-2 shadow-subtle overflow-hidden mt-12 lg:mt-0">
             {/* Mockup UI Inner */}
             <div className="absolute inset-2 bg-void-canvas rounded-t-3xl border border-hairline p-6 flex flex-col gap-4">
                <div className="h-6 w-32 bg-graphite rounded-md"></div>
                <div className="flex gap-4">
                  <div className="h-24 flex-1 bg-graphite/50 rounded-lg"></div>
                  <div className="h-24 flex-1 bg-graphite/50 rounded-lg"></div>
                  <div className="h-24 flex-1 bg-graphite/50 rounded-lg"></div>
                </div>
                <div className="h-48 w-full bg-graphite/30 rounded-lg mt-4"></div>
             </div>
          </div>

        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-[1200px] mx-auto px-6 py-24 flex flex-col gap-section-gap">
        
        {/* Accordion List Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-heading font-geist font-semibold text-bone mb-6">What YourDrive handles for you</h2>
            <p className="text-subheading font-geist text-ash">
              Our system intercepts your local file operations and safely routes them to your Telegram cloud.
            </p>
          </div>
          
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-hairline/20 pb-5">
              <span className="text-body font-dm-sans text-bone">Virtual File System Mapping</span>
              <span className="text-body font-dm-sans text-ash">01</span>
            </div>
            <div className="flex justify-between items-center border-b border-hairline/20 pb-5">
              <span className="text-body font-dm-sans text-bone">Zero-knowledge Encryption</span>
              <span className="text-body font-dm-sans text-ash">02</span>
            </div>
            <div className="flex justify-between items-center border-b border-hairline/20 pb-5">
              <span className="text-body font-dm-sans text-bone">Metadata Caption Injection</span>
              <span className="text-body font-dm-sans text-ash">03</span>
            </div>
            <div className="flex justify-between items-center border-b border-hairline/20 pb-5">
              <span className="text-body font-dm-sans text-bone">Direct MTProto File Streaming</span>
              <span className="text-body font-dm-sans text-ash">04</span>
            </div>
          </div>
        </section>

        {/* Frosted Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[rgba(212,212,212,0.1)] backdrop-blur-md rounded-3xl p-7 border border-hairline/10">
            <h3 className="font-geist text-heading-sm font-semibold text-bone mb-4">Complete Privacy</h3>
            <p className="font-dm-sans text-body text-ash">
              YourDrive acts as a local client. There is no middleman server holding your session strings or intercepting your files.
            </p>
          </div>
          <div className="bg-[rgba(212,212,212,0.1)] backdrop-blur-md rounded-3xl p-7 border border-hairline/10">
            <h3 className="font-geist text-heading-sm font-semibold text-bone mb-4">Native Experience</h3>
            <p className="font-dm-sans text-body text-ash">
              Enjoy a cloud drive interface that feels like your native OS, built entirely with modern web technologies.
            </p>
          </div>
        </section>

      </main>

    </div>
  );
}
