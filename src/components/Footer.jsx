import React from 'react';

export const Footer = () => {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 pb-8 mt-auto">
      <div className="max-w-4xl mx-auto soil-shell px-6 py-8 text-center text-sm text-body-muted">
        <p>Disclaimer: This app is for informational purposes only. Always consult a professional expert before consuming any plant.</p>
        <div className="mt-4 space-x-6">
          <a href="#" className="hover:underline hover:text-[var(--golden-soil)]">Terms of Use</a>
          <span>&bull;</span>
          <a href="#" className="hover:underline hover:text-[var(--golden-soil)]">Privacy Policy</a>
        </div>
        <p className="mt-4 text-[var(--cream)]">&copy; {new Date().getFullYear()} PlantDexPro. All rights reserved.</p>
      </div>
    </footer>
  );
};