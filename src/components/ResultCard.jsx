import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, Leaf, Sparkles, Share2, Lightbulb, Loader2, Youtube, Stethoscope } from 'lucide-react';
import { plantDexService } from '../services/plantDexService.js';
import { YouTubePlayer } from './YouTubePlayer.jsx';
import { HealthBenefits } from './HealthBenefits.jsx';

const EdibleBadge = ({ isEdible }) => {
  const bgColor = isEdible ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-rose-100 dark:bg-rose-900/40';
  const textColor = isEdible ? 'text-emerald-700 dark:text-emerald-200' : 'text-rose-700 dark:text-rose-200';
  const borderColor = isEdible ? 'border-emerald-200 dark:border-emerald-700' : 'border-rose-200 dark:border-rose-700';
  const text = isEdible ? 'Edible' : 'Not Edible';
  const Icon = isEdible ? CheckCircle2 : ShieldAlert;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${bgColor} ${textColor} ${borderColor} shadow-sm uppercase tracking-wide`}>
      <Icon size={14} />
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
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className={`${barColor} h-1.5 rounded-full shadow-sm`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                />
            </div>
        </div>
    );
};

export const ResultCard = ({ plant, index, originalImage }) => {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  useEffect(() => {
    if (plant.commonName) {
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
    <ul className="text-sm space-y-1.5 mt-2 text-gray-600 dark:text-gray-400">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
            <span className="mt-2 w-1 h-1 rounded-full bg-current opacity-60 shrink-0"></span>
            <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <motion.div
      className="w-full max-w-[760px] mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
        
        {/* --- Main Info Section --- */}
        <div className="p-8 md:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div>
                <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50 mb-3">
                   {plant.scientificName}
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-2">
                  {plant.commonName}
                </h2>
                <div className="flex items-center gap-3 mt-4">
                     <EdibleBadge isEdible={plant.isEdible} />
                     <button onClick={handleShare} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Share">
                        <Share2 size={18} />
                    </button>
                </div>
              </div>
              
              <div className="w-full md:w-48 shrink-0">
                  <ConfidenceMeter score={plant.confidenceScore} />
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 font-medium">
                {plant.description}
            </p>
            
            {/* Fun Fact */}
            {plant.funFact && (
                <div className="mb-8 flex gap-4 items-start bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                    <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-full shrink-0">
                        <Lightbulb className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wide mb-1">Did You Know?</h4>
                        <p className="text-amber-900/80 dark:text-amber-100/80 text-sm leading-relaxed">{plant.funFact}</p>
                    </div>
                </div>
            )}

            {/* Edible/Toxic Details */}
            <div className="grid grid-cols-1 gap-6 mb-2">
               {plant.isEdible ? (
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Leaf size={16} /> Edible Parts
                    </h4>
                    <p className="text-emerald-900 dark:text-emerald-100 text-sm font-medium leading-relaxed">
                      {plant.edibleParts?.join(', ') || 'None listed'}
                    </p>
                  </div>
               ) : (
                   <div className="bg-rose-50/50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                      <h4 className="font-bold text-rose-800 dark:text-rose-200 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                          <ShieldAlert size={16} /> Toxicity Alert
                      </h4>
                      <div className="text-rose-900 dark:text-rose-100 font-medium">
                          {renderList(plant.toxicParts) || <p className="text-sm">No specific toxicity details available.</p>}
                      </div>
                   </div>
               )}
            </div>
        </div>

        {/* --- Health Benefits (If Edible) --- */}
        {plant.isEdible && (
            <div className="px-8 md:px-10 pb-4">
                 <HealthBenefits plant={plant} />
            </div>
        )}

        {/* --- Video Section --- */}
        <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 p-8 md:p-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    {plant.videoContext === 'recipes' ? <Youtube size={20} className="text-red-600"/> : <Stethoscope size={20} className="text-blue-600"/>}
                    {plant.videoContext === 'recipes' ? 'Related Recipes' : 'Beneficial Uses & Care'}
                </h3>
              </div>

              {loadingVideos ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Loader2 className="animate-spin w-8 h-8 mb-3 text-emerald-500" /> 
                      <p className="text-sm font-medium">Curating videos for you...</p>
                  </div>
              ) : videos.length > 0 ? (
                  <div className="space-y-6"> 
                      {videos.map((v, i) => (
                          <div key={i} className="relative">
                             <YouTubePlayer 
                                video={v} 
                                isActive={activeVideoUrl === v.link}
                                onPlay={() => setActiveVideoUrl(v.link)}
                                plantImage={originalImage}
                             />
                             {/* Subtle divider except for last item */}
                             {i < videos.length - 1 && (
                                <div className="absolute -bottom-3 left-0 right-0 h-px bg-gray-200/50 dark:bg-gray-700/50 mx-4 hidden" />
                             )}
                          </div>
                      ))}
                  </div>
              ) : (
                  <a href={`https://www.youtube.com/results?search_query=${plant.commonName}+${plant.isEdible ? 'recipe' : 'benefits'}`} target="_blank" rel="noreferrer" className="block w-full py-8 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded-2xl text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-emerald-300 transition-all group">
                      <Youtube size={32} className="mx-auto mb-2 text-gray-300 group-hover:text-red-500 transition-colors" />
                      Find Videos on YouTube
                  </a>
              )}
        </div>
      </div>
    </motion.div>
  );
};