import React from 'react';
import { motion } from 'framer-motion';

export const SoilBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#261a10]">
      {/* Texture Layer */}
      <div className="absolute inset-0 opacity-50 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} />
      
      {/* High-Impact Black Outline Watermarks */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
        className="save-soil-watermark top-[10%] -left-[5%] -rotate-[12deg]"
      >
        SAVE OUR SOIL
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5 }}
        className="save-soil-watermark bottom-[15%] -right-[10%] rotate-[6deg]"
      >
        SAVE OUR SOIL
      </motion.div>

      {/* Earth Core Shadowing */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      
      {/* Center Depth Radiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[#8b5a2b]/20 blur-[200px] rounded-full" />
    </div>
  );
};