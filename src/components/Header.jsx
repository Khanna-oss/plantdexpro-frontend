import React from 'react';
import { Sun, Moon, Leaf } from 'lucide-react';

export const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="py-4 shadow-md bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
            <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">PlantDexPro</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};