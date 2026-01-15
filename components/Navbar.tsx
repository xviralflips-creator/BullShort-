import React from 'react';
import { Sparkles, Key, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">Hailuo Clone</span>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Billing Docs
            <ExternalLink className="w-3 h-3" />
          </a>
          
          <button 
            onClick={handleOpenKey}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
          >
            <Key className="w-4 h-4 text-primary" />
            <span>Select API Key</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
