import React from 'react';
import { Sun, Moon, Leaf } from 'lucide-react';

export const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-3">
      <div className="container mx-auto max-w-6xl soil-shell px-5 sm:px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--golden-soil)]/15 border border-[var(--golden-soil)]/25 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-[var(--golden-soil)]" />
          </div>
          <div>
            <span className="block text-xl font-heading text-[var(--cream)] leading-none">PlantDexPro</span>
            <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-[var(--golden-soil)]/80 mt-0.5">Save Soil Research Console</span>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--cream)]/70 hover:text-[var(--golden-soil)] hover:bg-white/10 focus:outline-none transition-all"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};