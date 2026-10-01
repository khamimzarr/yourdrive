import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-canvas text-charcoal font-inter selection:bg-amber-pulse/30">
      
      {/* Header Bar */}
      <nav className="w-full max-w-[1280px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo representation */}
          <div className="w-6 h-6 rounded-full bg-lime-signal relative overflow-hidden flex-shrink-0">
             <div className="absolute top-0 left-0 w-full h-1/2 bg-charcoal"></div>
          </div>
          <span className="font-bold text-[20px] tracking-tight">YourDrive</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2 rounded-full border border-charcoal text-charcoal font-bold text-[14px] hover:bg-black/5 transition-colors">
            Log in
          </Link>
          <Link href="/login" className="px-6 py-2 rounded-full bg-amber-pulse text-charcoal font-bold text-[14px] flex items-center gap-2 hover:opacity-90 transition-opacity">
            Sign up <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col gap-8 max-w-[540px]">
          <h1 className="text-[64px] font-bold leading-[1.05] tracking-[-0.04em]">
            Unlimited cloud. Powered by Telegram.
          </h1>
          <p className="text-[18px] text-ink-stone leading-[1.5] font-normal">
            Serverless, private, and unlimited cloud storage built directly on your Telegram account. Completely free forever.
          </p>
          <div className="flex gap-4 items-center pt-4">
            <Link href="/login" className="px-6 py-3 rounded-full bg-amber-pulse text-charcoal font-bold text-[16px] flex items-center gap-2 hover:opacity-90 transition-opacity">
              Try now <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Hero Product Mockup */}
        <div className="w-full aspect-[4/3] bg-pure-paper rounded-md border border-hairline p-6 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <div className="font-bold text-lg">My Files</div>
            <div className="px-3 py-1 bg-ink-stone text-pure-paper rounded-full text-xs font-bold ml-auto">All synced</div>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { name: 'vacation-2026.mp4', size: '1.2 GB', active: true },
              { name: 'project-assets.zip', size: '450 MB' },
              { name: 'design-v4.fig', size: '82 MB' }
            ].map((file, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-hairline last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${file.active ? 'bg-lime-signal' : 'bg-pale-mist'}`}>
                     <div className={`w-4 h-4 rounded-full ${file.active ? 'bg-charcoal' : 'bg-pure-paper'}`}></div>
                  </div>
                  <span className="font-bold text-[14px]">{file.name}</span>
                </div>
                <span className="text-[14px] text-ash">{file.size}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Panel 1 (Lavender) */}
      <section className="w-full bg-lavender-wash py-20 px-6">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6 max-w-[480px]">
            <h2 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em]">
              100% Private & Encrypted
            </h2>
            <p className="text-[16px] leading-[1.5] font-normal text-ink-stone">
              Your files are chunked and encrypted client-side before they ever touch Telegram's servers. Only you hold the keys.
            </p>
            <div className="pt-2">
               <button className="px-5 py-2 rounded-full border border-charcoal text-charcoal font-bold text-[14px] bg-pure-paper hover:bg-black/5 transition-colors">
                 Learn more
               </button>
            </div>
          </div>
          <div className="w-full aspect-[4/3] bg-pure-paper rounded-md border border-hairline p-6 flex items-center justify-center">
             <div className="w-3/4 aspect-square bg-warm-canvas rounded-full border border-hairline relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-charcoal rounded-full flex items-center justify-center">
                  <div className="w-1/2 h-1/2 bg-lime-signal rounded-full"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Panel 2 (Mustard) */}
      <section className="w-full bg-mustard-field py-20 px-6">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6 max-w-[480px] lg:order-2">
            <h2 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em]">
              Unlimited Space
            </h2>
            <p className="text-[16px] leading-[1.5] font-normal text-ink-stone">
              No quotas. No limits. Harness the power of Telegram's Saved Messages to store terabytes of data effortlessly.
            </p>
          </div>
          <div className="w-full aspect-[4/3] bg-pure-paper rounded-md border border-hairline p-6 lg:order-1 flex flex-col">
             {/* Mockup UI */}
             <div className="w-full h-8 bg-pale-mist rounded-md mb-4 flex items-center px-4">
               <div className="w-2 h-2 rounded-full bg-charcoal mr-2"></div>
               <div className="w-2 h-2 rounded-full bg-ash mr-2"></div>
               <div className="w-2 h-2 rounded-full bg-ash"></div>
             </div>
             <div className="flex-1 border border-hairline rounded-md flex items-end justify-between p-4 bg-warm-canvas">
                <div className="w-1/6 h-full bg-amber-pulse/20 rounded-md relative">
                   <div className="absolute bottom-0 w-full h-[80%] bg-amber-pulse rounded-md"></div>
                </div>
                <div className="w-1/6 h-full bg-amber-pulse/20 rounded-md relative">
                   <div className="absolute bottom-0 w-full h-[60%] bg-amber-pulse rounded-md"></div>
                </div>
                <div className="w-1/6 h-full bg-amber-pulse/20 rounded-md relative">
                   <div className="absolute bottom-0 w-full h-[95%] bg-amber-pulse rounded-md"></div>
                </div>
                <div className="w-1/6 h-full bg-amber-pulse/20 rounded-md relative">
                   <div className="absolute bottom-0 w-full h-[40%] bg-amber-pulse rounded-md"></div>
                </div>
                <div className="w-1/6 h-full bg-amber-pulse/20 rounded-md relative">
                   <div className="absolute bottom-0 w-full h-[100%] bg-lime-signal rounded-md"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1280px] mx-auto px-6 py-32 flex flex-col items-center text-center">
        <h2 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em] max-w-[600px] mb-8">
          Ready to reclaim your digital space?
        </h2>
        <Link href="/login" className="px-8 py-4 rounded-full bg-amber-pulse text-charcoal font-bold text-[18px] flex items-center gap-2 hover:opacity-90 transition-opacity">
          Generate your drive
        </Link>
      </section>
      
      {/* Footer */}
      <footer className="w-full border-t border-hairline py-8">
         <div className="max-w-[1280px] mx-auto px-6 flex justify-between items-center">
            <span className="font-bold text-[14px]">YourDrive</span>
            <div className="flex gap-6">
               <a href="https://github.com/khamimzarr/yourdrive" className="text-[14px] text-ink-stone hover:text-charcoal transition-colors">GitHub</a>
               <a href="#" className="text-[14px] text-ink-stone hover:text-charcoal transition-colors">Privacy</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
