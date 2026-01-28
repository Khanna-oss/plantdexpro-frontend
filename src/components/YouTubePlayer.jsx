import React, { useState, useEffect } from 'react';
import { Play, Loader2, Youtube, ExternalLink, ImageOff, Sparkles, Clock } from 'lucide-react';
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
  
  const videoId = getYoutubeId(video.link);

  useEffect(() => {
    if (!isActive) setIsLoading(true);
  }, [isActive]);

  if (!videoId) return null;

  const cachedThumb = youtubeThumbnailCache.get(videoId);
  const thumbnailUrl = cachedThumb || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  const handleThumbLoad = () => {
    if (!cachedThumb) {
      youtubeThumbnailCache.set(videoId, thumbnailUrl);
    }
  };

  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-black/5 dark:bg-black/20 border border-white/20 dark:border-gray-800 group/player transition-all duration-500 hover:shadow-2xl">
      {isActive ? (
        <div className="relative aspect-video">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          )}
          <iframe
            className="absolute top-0 left-0 w-full h-full z-20"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>
      ) : (
        <button 
          onClick={onPlay}
          className="relative w-full aspect-video block overflow-hidden"
          aria-label="Play recipe"
        >
          <img 
            src={thumbnailUrl} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover/player:scale-110" 
            alt={video.title}
            onLoad={handleThumbLoad}
            onError={(e) => {
              if (e.target.src.includes('maxresdefault')) {
                e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              }
            }}
          />
          <div className="absolute inset-0 bg-black/10 group-hover/player:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center scale-90 opacity-0 group-hover/player:scale-100 group-hover/player:opacity-100 transition-all duration-500">
              <Play fill="white" className="text-white ml-1" size={24} />
            </div>
          </div>
          
          <div className="absolute top-4 left-4">
             <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <Sparkles size={10} className="text-emerald-400" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Recipe Recommended</span>
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
      )}

      <div className="p-6">
        <h4 className="text-sm font-black text-gray-900 dark:text-white line-clamp-1 mb-2 tracking-tight group-hover/player:text-emerald-500 transition-colors">
          {video.title}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{video.channel}</span>
          {video.reason && (
             <button 
                onClick={(e) => { e.stopPropagation(); setShowReason(!showReason); }}
                className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
             >
                Why this?
             </button>
          )}
        </div>
        
        <AnimatePresence>
          {showReason && (
            <motion.p 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-[10px] text-gray-500 mt-3 italic border-t border-gray-100 dark:border-gray-800 pt-3"
            >
              "{video.reason}"
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};