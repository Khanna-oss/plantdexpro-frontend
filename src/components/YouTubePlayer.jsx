import React, { useState, useEffect } from 'react';
import { Play, Loader2, Youtube, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
// Fixed resolution for Vercel: explicit lowercase to match the file name
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

  // Use hqdefault as fallback if maxresdefault doesn't exist (common for older/lower res videos)
  const thumbnailUrl = thumbError 
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : (youtubeThumbnailCache.get(videoId) || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);

  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-black/40 border border-white/10 shadow-2xl group/player transition-all duration-500 hover:border-white/30">
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
            className="relative w-full aspect-video block overflow-hidden"
            aria-label={`Play: ${video.title}`}
          >
            <img 
              src={thumbnailUrl} 
              className="w-full h-full object-cover opacity-70 group-hover/player:opacity-40 transition-all duration-700 group-hover/player:scale-110" 
              alt={video.title}
              onError={() => setThumbError(true)}
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                whileHover={{ scale: 1.15 }}
                className="w-20 h-20 rounded-full bg-[#D63434] border-4 border-white/30 flex items-center justify-center shadow-2xl z-10"
              >
                <Play fill="white" className="text-white ml-1" size={28} />
              </motion.div>
              <div className="mt-4 px-6 py-2 bg-[#CCFF00] text-[#1D3B23] rounded-full text-[10px] font-black uppercase tracking-widest transform translate-y-4 opacity-0 group-hover/player:translate-y-0 group-hover/player:opacity-100 transition-all duration-500">
                Watch Preparation
              </div>
            </div>

            <div className="absolute top-4 left-4">
               <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <Youtube size={14} className="text-[#D63434]" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Recipe Insight</span>
               </div>
            </div>
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h4 className="text-sm font-black text-[#F5F5DC] line-clamp-2 tracking-tight leading-tight group-hover/player:text-[#CCFF00] transition-colors">
            {video.title}
          </h4>
          <a 
            href={video.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/5 text-[#F5F5DC]/40 hover:bg-white/10 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
        <p className="text-[10px] font-bold text-[#F5F5DC]/40 uppercase tracking-widest">{video.channel}</p>
      </div>
    </div>
  );
};