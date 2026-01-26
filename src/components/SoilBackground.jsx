import React from 'react';

export const SoilBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <div className="save-soil-watermark top-1/4 -left-10 rotate-[-15deg]">
        Save Soil
      </div>
      <div className="save-soil-watermark bottom-1/4 -right-10 rotate-[10deg]">
        Save Soil
      </div>
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/5 dark:to-white/5 opacity-50" />
    </div>
  );
};