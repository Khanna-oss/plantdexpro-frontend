import React, { useState, useEffect } from 'react';
import { Play, Loader2, Youtube, ExternalLink, Sparkles, Clock, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Enforce exact lowercase to match GitHub on Linux environments
import { youtubeThumbnailCache } from '../services/youtubeThumbnailCache';

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
      <div className="bg-black/40 rounded-[2rem] p-10 text-center border border-dashed border-white/10">
        <Youtube className="mx-auto mb-4 text-[#F5F5DC]/30" size={40} />
        <p className="text-[11px] font-black uppercase text-[#F5F5DC] opacity-50 tracking-widest mb-4">No recipe videos found for this species.</p>
        <button className="px-6 py-2.5 bg-[#D63434] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
          Search Community
        </button>
      </div>
    );
  }

  const cachedThumb = youtubeThumbnailCache.get(videoId);
  const thumbnailUrl = thumbError 
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : (cachedThumb || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);

  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-black/20 border border-white/5 shadow-2xl group/player transition-all duration-500 hover:border-white/20">
      {isActive ? (
        <div className="relative aspect-video bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/90">
              <Loader2 className="w-10 h-10 text-[#CCFF00] animate-spin" />
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
            className="relative w-full aspect-video block overflow-hidden group-hover/player:bg-black"
            aria-label={`Play recipe: ${video.title}`}
          >
            <img 
              src={thumbnailUrl} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover/player:scale-110 group-hover/player:opacity-40" 
              alt={video.title}
              onError={() => setThumbError(true)}
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                whileHover={{ scale: 1.15 }}
                className="w-20 h-20 rounded-full bg-[#D63434] border-4 border-white/40 flex items-center justify-center shadow-2xl z-10"
              >
                <Play fill="white" className="text-white ml-1" size={32} />
              </motion.div>
              <div className="mt-4 px-6 py-2 bg-[#CCFF00] text-[#1D3B23] rounded-full text-[11px] font-black uppercase tracking-[0.2em] transform translate-y-4 opacity-0 group-hover/player:translate-y-0 group-hover/player:opacity-100 transition-all duration-500 shadow-xl">
                Play Recipe
              </div>
            </div>

            <div className="absolute top-4 left-4">
               <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <Sparkles size={10} className="text-[#CCFF00]" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Recommended Match</span>
               </div>
            </div>
          </button>
        </div>
      )}

      <div className="p-8">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h4 className="text-base font-black text-[#F5F5DC] line-clamp-2 tracking-tight leading-tight group-hover/player:text-[#CCFF00] transition-colors">
            {video.title}
          </h4>
          <div className="flex items-center gap-2 shrink-0">
            {video.reason && (
              <button 
                onClick={() => setShowReason(!showReason)}
                className={`p-2.5 rounded-full transition-all ${showReason ? 'bg-[#CCFF00] text-[#1D3B23]' : 'bg-white/5 text-[#F5F5DC]/60 hover:bg-white/10'}`}
              >
                <Info size={16} />
              </button>
            )}
            <a 
              href={video.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/5 text-[#F5F5DC]/60 hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
        <p className="text-[10px] font-bold text-[#F5F5DC]/40 uppercase tracking-[0.2em]">{video.channel}</p>
        
        <AnimatePresence>
          {showReason && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[11px] text-[#F5F5DC]/80 italic leading-relaxed">
                  <span className="font-black uppercase text-[9px] block mb-1.5 text-[#CCFF00]">Expert Rationale:</span>
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