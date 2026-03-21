import React from 'react';
import { motion } from 'framer-motion';

export const SoilBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" style={{ backgroundColor: '#5c3d2e' }}>
      {/* Subtle Texture Layer */}
      <div className="absolute inset-0 opacity-20 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} />
      
      {/* Warm Visible Watermarks */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5 }}
        className="save-soil-watermark top-[10%] -left-[2%] -rotate-[8deg]"
      >
        SAVE SOIL
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="save-soil-watermark bottom-[8%] -right-[5%] rotate-[5deg]"
      >
        SAVE SOIL
      </motion.div>

      {/* Gentle Vignette - not too dark */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      
      {/* Center Warm Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[#8b5a2b]/10 blur-[160px] rounded-full" />
      
      {/* Accent Lights */}
      <div className="absolute top-[20%] left-[15%] w-[50vw] h-[50vw] bg-[#c79016]/6 blur-[100px] rounded-full" />
      <div className="absolute bottom-[25%] right-[20%] w-[40vw] h-[40vw] bg-[#556b2f]/5 blur-[80px] rounded-full" />
    </div>
  );
};