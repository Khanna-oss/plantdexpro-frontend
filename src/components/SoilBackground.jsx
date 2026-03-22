import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { unsplashService } from '../services/unsplashService.js';

export const SoilBackground = () => {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBackground = async () => {
      try {
        const bgData = await unsplashService.getBackgroundImage();
        if (bgData.url) {
          await unsplashService.preloadBackground(bgData.url);
          setBackgroundImage(bgData);
        }
      } catch (error) {
        console.error('Failed to load background:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBackground();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* PHASE 5: Dynamic Unsplash Background */}
      {backgroundImage?.url ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundImage.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          {/* Overlay for readability - lighter earth tones */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b7355]/85 via-[#6b5444]/80 to-[#5c4033]/85" />
        </>
      ) : (
        /* Fallback: Lighter earth-tone gradient */
        <div className="absolute inset-0 bg-gradient-to-br from-[#a0826d] via-[#8b7355] to-[#6b5444]" />
      )}
      
      {/* Subtle Texture Layer */}
      <div className="absolute inset-0 opacity-15 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} />
      
      {/* PHASE 5: Save Our Soil Watermarks - More Visible */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5 }}
        className="absolute top-[12%] -left-[3%] -rotate-[8deg] text-[clamp(80px,15vw,180px)] font-black tracking-tighter leading-none"
        style={{
          color: 'rgba(139, 115, 85, 0.12)',
          textShadow: '0 2px 20px rgba(0,0,0,0.1)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          WebkitTextStroke: '1px rgba(139, 115, 85, 0.08)'
        }}
      >
        SAVE OUR SOIL
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="absolute bottom-[10%] -right-[5%] rotate-[5deg] text-[clamp(80px,15vw,180px)] font-black tracking-tighter leading-none"
        style={{
          color: 'rgba(139, 115, 85, 0.12)',
          textShadow: '0 2px 20px rgba(0,0,0,0.1)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          WebkitTextStroke: '1px rgba(139, 115, 85, 0.08)'
        }}
      >
        SAVE OUR SOIL
      </motion.div>

      {/* Gentle Vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
      
      {/* Warm Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[#c79016]/8 blur-[180px] rounded-full" />
      
      {/* Photographer Credit (Unsplash requirement) */}
      {backgroundImage?.photographer && (
        <div className="absolute bottom-4 right-4 text-[9px] text-white/30 font-medium pointer-events-auto">
          Photo by{' '}
          <a 
            href={`${backgroundImage.photographerUrl}?utm_source=PlantDexPro&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/50 transition-colors"
          >
            {backgroundImage.photographer}
          </a>
          {' '}on{' '}
          <a 
            href="https://unsplash.com?utm_source=PlantDexPro&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/50 transition-colors"
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
};