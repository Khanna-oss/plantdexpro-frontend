import React from 'react';
import { motion } from 'framer-motion';

export const SoilBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#261a10]">
      {/* Texture Layer */}
      <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} />
      
      {/* High-Impact Watermarks with broad black outline (via CSS class) */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="save-soil-watermark top-[5%] -left-[5%] -rotate-[10deg]"
      >
        SAVE OUR SOIL
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8 }}
        className="save-soil-watermark bottom-[15%] -right-[10%] rotate-[5deg]"
      >
        SAVE OUR SOIL
      </motion.div>

      {/* Earth Depth Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Focus Radiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[#8b5a2b]/10 blur-[180px] rounded-full" />
    </div>
  );
};