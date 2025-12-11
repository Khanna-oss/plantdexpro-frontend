
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Info, Youtube, ShieldAlert, CheckCircle2, Leaf, Sparkles, Stethoscope, Share2, Lightbulb, Loader2, Play } from 'lucide-react';
import { plantDexService } from '../services/plantDexService.js';

const EdibleBadge = ({ isEdible }) => {
  const bgColor = isEdible ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-rose-100 dark:bg-rose-900/40';
  const textColor = isEdible ? 'text-emerald-700 dark:text-emerald-200' : 'text-rose-700 dark:text-rose-200';
  const borderColor = isEdible ? 'border-emerald-200 dark:border-emerald-700' : 'border-rose-200 dark:border-rose-700';
  const text = isEdible ? 'Edible' : 'Not Edible';
  const Icon = isEdible ? CheckCircle2 : ShieldAlert;

  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${bgColor} ${textColor} ${borderColor} shadow-sm`}>
      <Icon size={16} />
      {text}
    </span>
  );
};

const ConfidenceMeter = ({ score }) => {
    const percentage = Math.round((score || 0) * 100);
    let barColor = 'bg-rose-500';
    if (percentage > 50) barColor = 'bg-amber-500';
    if (percentage > 80) barColor = 'bg-emerald-500';

    return (
        <div className="w-full">
            <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} /> AI Match
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`${barColor} h-2 rounded-full shadow-sm`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                />
            </div>
        </div>
    );
};

// --- Video Player Logic ---

const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const VideoPlayer = ({ video }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoId = getYoutubeId(video.link);

    // If we can't extract an ID (e.g. it's a search result link), render a smart button card
    if (!videoId) {
        return (
            <a href={video.link} target="_blank" rel="noreferrer" className="block p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 group">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Youtube size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{video.title}</p>
                        <p className="text-xs text-gray-500">{video.channel} • {video.duration}</p>
                        <p className="text-xs text-blue-600 mt-1 font-semibold flex items-center gap-1">
                            Click to open in YouTube <Youtube size={12}/>
                        </p>
                    </div>
                </div>
            </a>
        );
    }

    // Embeddable Video Player
    return (
        <div className="bg-black/5 dark:bg-black/20 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            {isPlaying ? (
                <div className="relative pt-[56.25%] bg-black">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            ) : (
                <div className="relative cursor-pointer group" onClick={() => setIsPlaying(true)}>
                    {/* High Quality Thumbnail */}
                    <img 
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                        alt={video.title}
                        className="w-full h-56 sm:h-72 object-cover" 
                        loading="lazy"
                    />
                    
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                         {/* Play Button */}
                         <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform backdrop-blur-sm">
                            <Play fill="white" className="text-white ml-1.5" size={32} />
                         </div>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md border border-white/10">
                        {video.duration}
                    </div>
                </div>
            )}
            
            {/* Video Details */}
            <div className="p-5 bg-white dark:bg-gray-800">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-2 line-clamp-2">
                    {video.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Youtube size={16} className="text-red-600"/>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{video.channel}</span>
                </div>
            </div>
        </div>
    );
};

export const ResultCard = ({ plant, index }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  useEffect(() => {
    if (plant.isEdible && plant.commonName) {
      setLoadingVideos(true);
      plantDexService.findSpecificRecipes(plant.commonName)
        .then(res => setVideos(res || []))
        .catch(err => console.error(err))
        .finally(() => setLoadingVideos(false));
    }
  }, [plant]);

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: `I found ${plant.commonName}!`,
              text: `Check out this plant I identified with PlantDexPro: ${plant.commonName}. ${plant.description}`,
              url: window.location.href
          });
      } else {
          alert("Share not supported on this browser");
      }
  };

  const renderList = (items) => items && items.length > 0 && (
    <ul className="text-sm space-y-1 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0"></span>
            <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <motion.div
      className="group relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        <div className="lg:col-span-12 p-6 md:p-10 flex flex-col justify-between bg-white dark:bg-gray-900">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/50 mb-3 inline-block">
                   {plant.scientificName}
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                  {plant.commonName}
                </h2>
              </div>
              <div className="flex gap-3">
                  <button onClick={handleShare} className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Share2 size={20} />
                  </button>
                  <EdibleBadge isEdible={plant.isEdible} />
              </div>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                {plant.description}
            </p>
            
            {plant.funFact && (
                <div className="mb-8 flex gap-3 items-start bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <Lightbulb className="text-amber-500 shrink-0 mt-1" size={20} />
                    <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-200 text-xs uppercase tracking-wide mb-1">Did You Know?</h4>
                        <p className="text-amber-900 dark:text-amber-100 text-sm italic">{plant.funFact}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
               {plant.isEdible ? (
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Leaf size={14} /> Edible Parts
                    </h4>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                      {plant.edibleParts?.join(', ') || 'None listed'}
                    </p>
                  </div>
               ) : (
                   <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                      <h4 className="font-bold text-rose-800 dark:text-rose-200 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                          <ShieldAlert size={14} /> Toxicity
                      </h4>
                      <div className="text-rose-700 dark:text-rose-300 text-sm font-medium">
                          {renderList(plant.toxicParts) || "No specific toxicity details."}
                      </div>
                   </div>
               )}
               
               <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col justify-center">
                   <ConfidenceMeter score={plant.confidenceScore} />
               </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  {plant.videoContext === 'recipes' ? <Youtube size={18} className="text-red-600"/> : <Stethoscope size={18} className="text-blue-600"/>}
                  {plant.videoContext === 'recipes' ? 'Curated Recipes' : 'Beneficial Uses & Care'}
              </h3>

              {loadingVideos ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="animate-spin w-4 h-4" /> Finding the best videos...
                  </div>
              ) : videos.length > 0 ? (
                  <div className="space-y-6"> 
                      {/* ^^^ Changed from grid to space-y-6 to show videos one after another */}
                      {videos.map((v, i) => (
                          <VideoPlayer key={i} video={v} />
                      ))}
                  </div>
              ) : (
                  <a href={`https://www.youtube.com/results?search_query=${plant.commonName}+${plant.isEdible ? 'recipe' : 'benefits'}`} target="_blank" className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl text-center text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                      <Youtube size={18} />
                      Find Videos on YouTube
                  </a>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
