import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode.js';
import { Sun, Moon } from 'lucide-react';

export const Header = () => {
  const [theme, toggleTheme] = useDarkMode();

  return (
    <header className="py-4 shadow-md bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
           <svg
            className="w-8 h-8 text-primary dark:text-primary-light"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L6 22h12L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold text-gray-800 dark:text-white">PlantDexPro</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <Moon /> : <Sun />}
        </button>
      </div>
    </header>
  );
};
