
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, Leaf, Sparkles, Share2, Lightbulb, Loader2, Youtube, Stethoscope, Clock } from 'lucide-react';
import { plantDexService } from '../services/plantDexService.js';
import { YouTubePlayer } from './YouTubePlayer.jsx';
import { HealthBenefits } from './HealthBenefits.jsx';
import { ConfidenceBar } from './ConfidenceBar.jsx';

export const ResultCard = ({ plant, index, originalImage }) => {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  // Use the calibrated uiConfidence (0-100) or fallback to raw score
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
  }, [plant]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `I found ${plant.commonName}!`,
        text: `Check out this ${plant.commonName} I identified with PlantDexPro.`,
        url: window.location.href
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`w-full max-w-[800px] mx-auto mb-12 group`}
    >
      <div className={`relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2.5rem] border ${isLowConfidence ? 'border-amber-400/50 shadow-amber-500/10' : 'border-white/20 dark:border-gray-800/50'} shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-emerald-500/5`}>
        
        {/* Visual Header / Confidence Overlay */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img src={originalImage} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" alt={plant.commonName} />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-transparent" />
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
              <Clock size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Verified {new Date().toLocaleDateString()}</span>
            </div>
            <button onClick={handleShare} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-emerald-500 transition-colors">
              <Share2 size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="px-8 md:px-12 pb-12 -mt-12 relative z-10">
          {/* Main Titles */}
          <div className="mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-2 block">{plant.scientificName}</span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">{plant.commonName}</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${plant.isEdible ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                {plant.isEdible ? '✓ Safe/Edible' : '⚠ Caution'}
              </span>
              {isLowConfidence && (
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1.5">
                  <ShieldAlert size={12} /> Verification Recommended
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Details */}
            <div className="lg:col-span-7 space-y-10">
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Botanical Summary</h4>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {plant.description}
                </p>
              </div>

              {plant.funFact && (
                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden">
                  <Sparkles className="absolute -top-2 -right-2 text-emerald-500/10 w-24 h-24" />
                  <div className="flex gap-4 items-start relative z-10">
                    <Lightbulb className="text-emerald-500 shrink-0" size={24} />
                    <p className="text-sm text-emerald-900/80 dark:text-emerald-100/80 italic font-medium leading-relaxed">
                      "{plant.funFact}"
                    </p>
                  </div>
                </div>
              )}

              {/* Toxicity/Usage Alerts */}
              {!plant.isEdible && plant.toxicParts?.length > 0 && (
                <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10">
                  <h4 className="text-xs font-black text-rose-600 uppercase mb-3 flex items-center gap-2">
                    <ShieldAlert size={16} /> Toxic Properties
                  </h4>
                  <ul className="grid grid-cols-1 gap-2">
                    {plant.toxicParts.map((part, i) => (
                      <li key={i} className="text-sm text-rose-900/70 dark:text-rose-200/70 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {part}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: AI Stats & Metadata */}
            <div className="lg:col-span-5 space-y-6">
              <ConfidenceBar score={confidenceScore} />
              
              <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Plant Characteristics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="font-bold">{plant.isEdible ? 'Culinary/Medicinal' : 'Ornamental/Wild'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Analysis Mode</span>
                    <span className="font-bold flex items-center gap-1.5"><Sparkles size={12} className="text-emerald-500"/> Deep Vision</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        {plant.isEdible && (
          <div className="px-8 md:px-12 pb-12">
            <HealthBenefits plant={plant} />
          </div>
        )}

        {/* Video Explorer */}
        <div className="bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800/50 px-8 md:px-12 py-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
              <Youtube size={18} className="text-red-500" /> 
              Intelligence Feed: {plant.videoContext === 'recipes' ? 'Culinary Guides' : 'Cultivation & Safety'}
            </h3>
          </div>

          {loadingVideos ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sourcing verified content...</p>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((v, i) => (
                <YouTubePlayer key={i} video={v} isActive={activeVideoUrl === v.link} onPlay={() => setActiveVideoUrl(v.link)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 italic">Exploring the global database for related media...</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
