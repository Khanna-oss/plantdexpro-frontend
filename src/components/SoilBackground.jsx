import React from 'react';
import { motion } from 'framer-motion';

export const SoilBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-gradient-to-br from-[#4B3621] via-[#5C4127] to-[#7F6030]">
      {/* Soil Texture / Radiance Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[#CCFF00]/5 blur-[150px] rounded-full opacity-30" />
      
      {/* Save Our Soil Watermarks with Carved Dirt Effect */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 0.12, x: 0 }}
        transition={{ duration: 2 }}
        className="save-soil-watermark top-[10%] -left-[10%] -rotate-[12deg] carved-text font-black tracking-tighter"
      >
        SAVE OUR SOIL
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 0.1, x: 0 }}
        transition={{ duration: 2.5 }}
        className="save-soil-watermark bottom-[15%] -right-[15%] rotate-[8deg] carved-text font-black tracking-tighter"
      >
        SAVE OUR SOIL
      </motion.div>

      {/* Center Branding Watermark */}
      <div className="save-soil-watermark top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] text-8xl">
        PLANTDEXPRO
      </div>

      {/* Ground Shadow / Depth */}
      <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      
      {/* Subtle Dust Particles (Simulated) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CCFF00 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
    </div>
  );
};