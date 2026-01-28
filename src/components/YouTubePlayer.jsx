import React, { useState, useEffect } from 'react';
import { Play, Loader2, Youtube, ExternalLink, Sparkles, Clock, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Explicit extension and pathing for Vercel/Vite resolution
import { youtubeThumbnailCache } from '../services/youtubeThumbnailCache.js';

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const YouTubePlayer = ({ video, isActive, onPlay }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showReason, setShowReason] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  
  const videoId = getYoutubeId(video.link);

  useEffect(() => {
    if (!isActive) {
      setIsLoading(true);
      setThumbError(false);
    }
  }, [isActive]);

  if (!videoId) {
    return (
      <div className="bg-white/10 rounded-[2rem] p-8 text-center border border-dashed border-[#D63434]/30">
        <Youtube className="mx-auto mb-3 text-[#D63434] opacity-50" size={32} />
        <p className="text-[10px] font-black uppercase text-[#6B0000] mb-4">Recipe video link unavailable</p>
        <button className="px-5 py-2.5 bg-[#D63434] text-white text-[10px] font-black uppercase rounded-full flex items-center gap-2 mx-auto hover:bg-[#b02525] transition-colors shadow-lg">
          <Search size={12} /> Find Recipe Manually
        </button>
      </div>
    );
  }

  const cachedThumb = youtubeThumbnailCache.get(videoId);
  const thumbnailUrl = thumbError 
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : (cachedThumb || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);

  const handleThumbLoad = () => {
    if (!cachedThumb && !thumbError) {
      youtubeThumbnailCache.set(videoId, thumbnailUrl);
    }
  };

  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-white/40 border border-black/5 shadow-sm group/player transition-all duration-500 hover:shadow-xl">
      {isActive ? (
        <div className="relative aspect-video bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80">
              <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
            </div>
          )}
          <iframe
            className="absolute top-0 left-0 w-full h-full z-20"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&controls=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>
      ) : (
        <div className="relative">
          <button 
            onClick={onPlay}
            className="relative w-full aspect-video block overflow-hidden bg-gray-200"
            aria-label={`Play recipe: ${video.title}`}
          >
            <img 
              src={thumbnailUrl} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover/player:scale-110" 
              alt={video.title}
              onLoad={handleThumbLoad}
              onError={() => setThumbError(true)}
            />
            
            <div className="absolute inset-0 bg-black/40 group-hover/player:bg-black/60 transition-colors flex flex-col items-center justify-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 rounded-full bg-[#D63434] border-4 border-white/40 flex items-center justify-center shadow-2xl"
              >
                <Play fill="white" className="text-white ml-1" size={32} />
              </motion.div>
              <div className="mt-4 px-6 py-2 bg-[#CCFF00] text-[#1D3B23] text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg transform translate-y-2 opacity-0 group-hover/player:translate-y-0 group-hover/player:opacity-100 transition-all duration-500">
                Play Recipe
              </div>
            </div>
            
            <div className="absolute top-4 left-4">
               <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                  <Sparkles size={10} className="text-[#CCFF00]" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Botany-Approved Recipe</span>
               </div>
            </div>

            {video.duration && (
              <div className="absolute bottom-4 right-4">
                <div className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-[9px] font-bold text-white">
                  <Clock size={10} />
                  {video.duration}
                </div>
              </div>
            )}
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h4 className="text-sm font-black text-[#6B0000] line-clamp-2 tracking-tight group-hover/player:text-[#D63434] transition-colors">
            {video.title}
          </h4>
          <div className="flex items-center gap-2 shrink-0">
            {video.reason && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowReason(!showReason); }}
                className={`p-2 rounded-full transition-all ${showReason ? 'bg-[#D63434] text-white shadow-inner' : 'bg-[#6B0000]/5 text-[#D63434] hover:bg-[#6B0000]/10'}`}
                title="Why this video?"
              >
                <Info size={14} />
              </button>
            )}
            <a 
              href={video.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#D63434]/10 hover:bg-[#D63434]/20 transition-colors text-[#D63434]"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-[#6B0000]/60 uppercase tracking-widest">{video.channel}</span>
        </div>
        
        <AnimatePresence>
          {showReason && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-2xl bg-[#6B0000]/5 border border-[#6B0000]/10">
                <p className="text-[10px] text-[#6B0000] italic leading-relaxed">
                  <span className="font-black uppercase text-[8px] block mb-1 text-[#D63434] tracking-wider">AI Rationale:</span>
                  "{video.reason}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};