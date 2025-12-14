import React, { useState, useEffect } from 'react';
import { Play, Loader2, Youtube } from 'lucide-react';

const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export const YouTubePlayer = ({ video, isActive, onPlay }) => {
    const [isLoading, setIsLoading] = useState(true);
    const videoId = getYoutubeId(video.link);

    useEffect(() => {
        if (!isActive) {
            setIsLoading(true);
        }
    }, [isActive, video]);

    if (!videoId) {
        return (
            <a 
                href={video.link} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
            >
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center shrink-0">
                    <Youtube className="text-red-600 w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {video.title}
                    </h4>
                    <p className="text-xs text-blue-600 font-medium">Watch on YouTube</p>
                </div>
            </a>
        );
    }

    // Determine high quality thumbnail url
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            {isActive ? (
                <div className="relative pt-[56.25%] bg-black">
                     {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
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
                    className="relative w-full block group overflow-hidden bg-black aspect-video"
                    aria-label={`Play video: ${video.title}`}
                >
                    {/* Full YouTube Thumbnail */}
                    <img 
                        src={thumbnailUrl}
                        alt={`Thumbnail for ${video.title}`}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`; 
                        }}
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform backdrop-blur-sm">
                            <Play fill="white" className="text-white ml-1" size={24} />
                        </div>
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
                            {video.duration}
                        </div>
                    )}
                </button>
            )}
            
            {/* Meta Data Row */}
            <div className="p-4 bg-white dark:bg-gray-800">
                <h4 className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100 line-clamp-1 mb-1" title={video.title}>
                    {video.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium flex items-center gap-1">
                        <Youtube size={14} className="text-red-500"/>
                        {video.channel}
                    </span>
                </div>
            </div>
        </div>
    );
};