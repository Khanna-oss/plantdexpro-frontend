import React from 'react';

export const SoilBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background Radiance matching the "Hands holding earth" theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-emerald-400/10 blur-[120px] rounded-full" />
      
      {/* Save Soil Watermarks with Radium Borders */}
      <div className="save-soil-watermark top-10 -left-20 rotate-[-12deg]">
        Save Our Soil
      </div>
      <div className="save-soil-watermark bottom-20 -right-20 rotate-[8deg]">
        Save Our Soil
      </div>
      <div className="save-soil-watermark top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
        PlantDexPro
      </div>

      {/* Hero Visual Proxy (Hands holding earth theme) */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-emerald-900/10 to-transparent" />
    </div>
  );
};