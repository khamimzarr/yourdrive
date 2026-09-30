'use client';

import React, { useState, useEffect } from 'react';

const lines = [
  { type: 'cmd', text: '$ yourdrive connect' },
  { type: 'out', text: '✓ Connected via MTProto' },
  { type: 'cmd', text: '$ yourdrive upload vacation.mp4 /videos/' },
  { type: 'out', text: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%' },
  { type: 'out', text: '✓ Saved to Telegram · 847MB' },
  { type: 'cmd', text: '$ yourdrive ls /videos/' },
  { type: 'out', text: '  vacation.mp4   847MB   just now' },
  { type: 'out', text: '  birthday.mov   1.2GB   2d ago' },
  { type: 'cmd', text: '$ yourdrive sync --all' },
  { type: 'out', text: '✓ 24 files synced across 3 folders' },
];

export default function TerminalMockup() {
  const [displayed, setDisplayed] = useState<{ text: string; type: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentLine >= lines.length) {
      // Restart after pause
      const timeout = setTimeout(() => {
        setDisplayed([]);
        setCurrentLine(0);
        setCurrentChar(0);
        setIsTyping(true);
      }, 4000);
      return () => clearTimeout(timeout);
    }

    const line = lines[currentLine];

    if (line.type === 'cmd' && isTyping) {
      // Type command character by character
      if (currentChar < line.text.length) {
        const speed = 30 + Math.random() * 40;
        const timeout = setTimeout(() => {
          setCurrentChar((c) => c + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing this command
        setDisplayed((prev) => [...prev, { text: line.text, type: 'cmd' }]);
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
        setIsTyping(true);
      }
    } else if (line.type === 'out') {
      // Output appears instantly after a short delay
      const timeout = setTimeout(() => {
        setDisplayed((prev) => [...prev, { text: line.text, type: 'out' }]);
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
        setIsTyping(true);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [currentLine, currentChar, isTyping]);

  const currentlyTyping =
    currentLine < lines.length && lines[currentLine].type === 'cmd'
      ? lines[currentLine].text.slice(0, currentChar)
      : null;

  return (
    <div className="w-full h-full bg-void-canvas rounded-t-[34px] p-5 flex flex-col gap-3 overflow-hidden font-mono">
      {/* Traffic lights */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] text-slate ml-2">yourdrive — bash</span>
      </div>

      {/* Terminal output */}
      <div className="flex-1 overflow-hidden text-[13px] leading-[1.7] flex flex-col">
        {displayed.map((line, i) => (
          <span
            key={i}
            className={
              line.type === 'cmd'
                ? 'text-bone'
                : line.text.startsWith('✓')
                  ? 'text-[#28c840]'
                  : line.text.startsWith('▓')
                    ? 'text-dusk-violet'
                    : 'text-ash'
            }
          >
            {line.text}
          </span>
        ))}
        {currentlyTyping !== null && (
          <span className="text-bone">
            {currentlyTyping}
            <span className="animate-pulse text-dusk-violet">▋</span>
          </span>
        )}
      </div>
    </div>
  );
}
