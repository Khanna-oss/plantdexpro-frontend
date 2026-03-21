import React from 'react';
import { motion } from 'framer-motion';

export const SoilBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" style={{ backgroundColor: '#4B3621' }}>
      {/* Enhanced Texture Layer */}
      <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} />
      
      {/* High-Impact Black Outline Watermarks with Enhanced Visibility */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
        className="save-soil-watermark top-[8%] -left-[3%] -rotate-[12deg]"
      >
        SAVE OUR SOIL
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5 }}
        className="save-soil-watermark bottom-[12%] -right-[8%] rotate-[6deg]"
      >
        SAVE OUR SOIL
      </motion.div>

      {/* Enhanced Earth Core Shadowing for Better Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      
      {/* Center Depth Radiance with Soil Theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[#8b5a2b]/15 blur-[180px] rounded-full" />
      
      {/* Additional Soil-themed Accent Lights */}
      <div className="absolute top-1/4 left-1/4 w-[80vw] h-[80vw] bg-[#c79016]/8 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/3 right-1/3 w-[60vw] h-[60vw] bg-[#556b2f]/6 blur-[100px] rounded-full" />
    </div>
  );
};