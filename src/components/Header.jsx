import React from 'react';
import { Sun, Moon, Leaf } from 'lucide-react';

export const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <div className="container mx-auto soil-shell px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="glass-card p-2.5">
            <Leaf className="w-6 h-6 text-[var(--golden-soil)]" />
          </div>
          <div>
            <span className="block text-2xl font-heading text-[var(--cream)] leading-none">PlantDexPro</span>
            <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[var(--golden-soil)] mt-1">Save Soil XAI Console</span>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="glass-card p-3 text-[var(--cream)] hover:text-[var(--golden-soil)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--golden-soil)] transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};