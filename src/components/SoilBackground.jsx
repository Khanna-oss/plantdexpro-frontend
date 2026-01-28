import React from 'react';
import { motion } from 'framer-motion';

export const SoilBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-gradient-to-b from-[#3d2b1f] to-[#261a10]">
      {/* High-Impact Watermarks */}
      <motion.div 
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 2 }}
        className="save-soil-watermark top-[10%] -left-[10%] -rotate-12"
      >
        SAVE OUR SOIL
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 2.5 }}
        className="save-soil-watermark bottom-[20%] -right-[15%] rotate-6"
      >
        SAVE OUR SOIL
      </motion.div>

      {/* Earth Texture Overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-matter.png")' }} />
      
      {/* Radiance Focus */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[#CCFF00]/5 blur-[150px] rounded-full" />
    </div>
  );
};