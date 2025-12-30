
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Sparkles, Share2, Lightbulb, Loader2, Youtube, Clock, Bookmark } from 'lucide-react';
import { plantDexService } from '../services/plantDexService.js';
import { YouTubePlayer } from './YouTubePlayer.jsx';
import { HealthBenefits } from './HealthBenefits.jsx';
import { ConfidenceBar } from './ConfidenceBar.jsx';

export const ResultCard = ({ plant, index }) => {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  const confidenceScore = plant.uiConfidence || Math.round((plant.confidenceScore || 0) * 100);
  const isLowConfidence = confidenceScore < 65;

  useEffect(() => {
    if (plant.commonName) {
      setLoadingVideos(true);
      plantDexService.findSpecificRecipes(plant.commonName)
        .then(res => setVideos(res || []))
        .catch(err => console.error(err))
        .finally(() => setLoadingVideos(false));
    }
  }, [plant.commonName]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Identification: ${plant.commonName}`,
        text: `Scientific Name: ${plant.scientificName}. Verified via PlantDexPro.`,
        url: window.location.href
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="w-full max-w-[850px] mx-auto mb-12"
    >
      <div className={`relative bg-white dark:bg-gray-900 rounded-[3rem] border ${isLowConfidence ? 'border-amber-400/50 shadow-amber-500/10' : 'border-gray-200 dark:border-gray-800'} shadow-2xl overflow-hidden`}>
        
        {/* Clean Header - NO IMAGES */}
        <div className="pt-12 px-8 md:px-14 pb-10 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Bookmark size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 block leading-none mb-1">Botanical Report</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleShare} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all text-gray-400 hover:text-emerald-500">
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-[0.9] drop-shadow-sm">
              {plant.commonName}
            </h2>
            <p className="text-sm font-bold text-emerald-600/70 dark:text-emerald-400 italic font-serif">
              {plant.scientificName}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${plant.isEdible ? 'bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white border-transparent shadow-lg shadow-rose-500/20'}`}>
                {plant.isEdible ? 'CULINARY SAFE' : 'CAUTION ADVISED'}
              </span>
              {isLowConfidence && (
                <span className="px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-2">
                  <ShieldAlert size={14} /> MANUAL REVIEW SUGGESTED
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 md:px-14 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Analysis Data */}
            <div className="lg:col-span-7 space-y-12">
              <section>
                <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-4">Morphological Profile</h4>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {plant.description}
                </p>
              </section>

              {plant.funFact && (
                <div className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 relative group overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                     <Sparkles size={48} className="text-emerald-500" />
                   </div>
                   <div className="flex gap-5 items-start">
                     <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                       <Lightbulb className="text-amber-500" size={24} />
                     </div>
                     <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed font-medium">
                       "{plant.funFact}"
                     </p>
                   </div>
                </div>
              )}
            </div>

            {/* Confidence & Stats */}
            <div className="lg:col-span-5 space-y-8">
              <ConfidenceBar score={confidenceScore} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50">
                   <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Engine</span>
                   <span className="text-xs font-bold">Gemini 3.0-V</span>
                </div>
                <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
                   <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block mb-1">Date</span>
                   <span className="text-xs font-bold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nutritional Profile */}
        {plant.isEdible && (
          <div className="px-8 md:px-14 pb-14 border-t border-gray-50 dark:border-gray-800 pt-14">
            <HealthBenefits plant={plant} />
          </div>
        )}

        {/* intelligence Feed */}
        <div className="bg-gray-900 dark:bg-black p-8 md:p-14">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <Youtube size={18} className="text-red-500" /> 
              Botanical Media Feed
            </h3>
          </div>

          {loadingVideos ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scanning Global Archives...</p>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((v, i) => (
                <YouTubePlayer key={i} video={v} isActive={activeVideoUrl === v.link} onPlay={() => setActiveVideoUrl(v.link)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-[2rem]">
              <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Sourcing context-specific media...</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
