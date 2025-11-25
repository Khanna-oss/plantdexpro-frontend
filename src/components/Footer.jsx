import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-800 bg-white dark:bg-gray-800 mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p>Disclaimer: This app is for informational purposes only. Always consult a professional expert before consuming any plant.</p>
        <div className="mt-4 space-x-6">
          <a href="#" className="hover:underline hover:text-emerald-600">Terms of Use</a>
          <span>&bull;</span>
          <a href="#" className="hover:underline hover:text-emerald-600">Privacy Policy</a>
        </div>
        <p className="mt-4">&copy; {new Date().getFullYear()} PlantDexPro. All rights reserved.</p>
      </div>
    </footer>
  );
};