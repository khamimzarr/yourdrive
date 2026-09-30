import React from 'react';

export default function HazeCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-haze text-ink rounded-[12px] p-5">
      {children}
    </div>
  );
}
