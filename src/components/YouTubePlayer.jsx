import React, { useState, useEffect } from 'react';
import { Play, Loader2, Youtube, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
// Explicit path to resolve build environment issues
import { youtubeThumbnailCache } from '../services/youtubeThumbnailCache.js';

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const YouTubePlayer = ({ video, isActive, onPlay }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [thumbError, setThumbError] = useState(false);
  
  const videoId = getYoutubeId(video.link);

  if (!videoId) return null;

  const thumbnailUrl = thumbError 
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-black/20 border border-white/10 shadow-lg group/player transition-all hover:border-white/30">
      {isActive ? (
        <div className="relative aspect-video bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/90">
              <Loader2 className="w-10 h-10 text-[#CCFF00] animate-spin" />
            </div>
          )}
          <iframe
            className="absolute top-0 left-0 w-full h-full z-20"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>
      ) : (
        <div className="relative">
          <button 
            onClick={onPlay}
            className="relative w-full aspect-video block overflow-hidden"
          >
            <img 
              src={thumbnailUrl} 
              className="w-full h-full object-cover opacity-60 group-hover/player:opacity-80 transition-all duration-700" 
              alt={video.title}
              onError={() => setThumbError(true)}
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-[#D63434] flex items-center justify-center shadow-2xl z-10"
              >
                <Play fill="white" className="text-white ml-1" size={24} />
              </motion.div>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
               <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                  <p className="text-[11px] font-black text-white line-clamp-1 leading-tight">{video.title}</p>
                  <p className="text-[9px] font-bold text-white/60 mt-0.5">{video.channel}</p>
               </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};