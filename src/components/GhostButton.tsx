import React from 'react';

export default function GhostButton({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-transparent border border-whiteout text-whiteout rounded-lg px-4 py-2 font-medium hover:bg-whiteout/10 transition-colors"
    >
      {children}
    </button>
  );
}
