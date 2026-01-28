import React, { useState, useEffect } from 'react';
import { Play, Loader2, Youtube, ExternalLink, ImageOff, Sparkles, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="bg-black/5 rounded-[2rem] p-8 text-center border border-dashed border-black/10">
        <p className="text-[10px] font-black uppercase text-[#6B0000] opacity-40">Recipe video link invalid</p>
        <button className="mt-4 text-[10px] font-black uppercase text-emerald-600 underline">Find Manual Recipe</button>
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
    <div className="relative rounded-[2rem] overflow-hidden bg-white/40 dark:bg-black/20 border border-black/5 shadow-sm group/player transition-all duration-500 hover:shadow-xl">
      {isActive ? (
        <div className="relative aspect-video bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          <iframe
            className="absolute top-0 left-0 w-full h-full z-20"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
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
              className="w-full h-full object-cover transition-transform duration-1000 group-hover/player:scale-105" 
              alt={video.title}
              onLoad={handleThumbLoad}
              onError={() => setThumbError(true)}
            />
            
            <div className="absolute inset-0 bg-black/20 group-hover/player:bg-black/40 transition-colors flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 flex items-center justify-center transform transition-all duration-500 group-hover/player:scale-110">
                <Play fill="white" className="text-white ml-1" size={24} />
              </div>
              <span className="mt-4 text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover/player:opacity-100 transition-opacity">Play Recipe Video</span>
            </div>
            
            <div className="absolute top-4 left-4">
               <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <Sparkles size={10} className="text-emerald-400" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Top Rated Recipe</span>
               </div>
            </div>

            {video.duration && (
              <div className="absolute bottom-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-[9px] font-bold text-white">
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
          <h4 className="text-sm font-black text-[#6B0000] line-clamp-2 tracking-tight">
            {video.title}
          </h4>
          <div className="flex items-center gap-2 shrink-0">
            {video.reason && (
              <button 
                onClick={() => setShowReason(!showReason)}
                className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                title="Why this video?"
              >
                <Info size={14} className="text-[#D63434]" />
              </button>
            )}
            <a 
              href={video.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#D63434]/10 hover:bg-[#D63434]/20 transition-colors"
            >
              <ExternalLink size={14} className="text-[#D63434]" />
            </a>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-[#6B0000] opacity-50 uppercase tracking-widest">{video.channel}</span>
        </div>
        
        <AnimatePresence>
          {showReason && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-[10px] text-[#6B0000] mt-3 italic bg-white/50 p-3 rounded-xl border border-black/5">
                <span className="font-black uppercase text-[8px] block mb-1 opacity-60">AI Recommendation Reason:</span>
                "{video.reason}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};