import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Sparkles, Share2, Youtube, 
  History, Info, MapPin, FlaskConical, Leaf, ShieldCheck, Zap, Loader2
} from 'lucide-react';
import { plantDexService } from '../services/plantDexService.js';
import { YouTubePlayer } from './YouTubePlayer.jsx';
import { ConfidenceBar } from './ConfidenceBar.jsx';
import { AICondensedSummary } from './AICondensedSummary.jsx';
import { SectionCard } from './SectionCard.jsx';
import { HealthBenefits } from './HealthBenefits.jsx';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-[850px] mx-auto mb-24 relative z-10 px-4 md:px-0"
    >
      <div className="bg-[#fffcf7] dark:bg-[#1a140f] rounded-[1.8rem] border border-[#8b5a2b]/10 clay-shadow overflow-hidden">
        
        {/* Professional Header */}
        <div className="relative aspect-[16/10] md:aspect-[16/6] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#4a3728] via-[#4a3728]/20 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-lg ${
                plant.isEdible ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}>
                {plant.isEdible ? 'Edible Species' : 'Caution Required'}
              </span>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                <ShieldCheck size={12} className="text-white" />
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">Match: {confidenceScore}%</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
              {plant.commonName}
            </h2>
            <p className="text-lg md:text-xl font-serif italic text-white/80">
              {plant.scientificName}
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <AICondensedSummary description={plant.description} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
              
              <SectionCard 
                title="Botanical Overview" 
                icon={Info} 
                preview="Leaf pattern, growth cycle, and physiology..."
                defaultOpen={true}
              >
                <p className="text-gray-700 dark:text-gray-300">
                  {plant.description}
                </p>
              </SectionCard>

              <SectionCard 
                title="Habitat & Origin" 
                icon={MapPin} 
                preview="Distribution data..."
              >
                <p className="text-gray-700 dark:text-gray-300">
                  Traditionally endemic to diverse tropical and subtropical regions.
                </p>
              </SectionCard>

              <SectionCard 
                title="Traditional Usage" 
                icon={History} 
                preview="Historical ethnobotanical applications..."
              >
                <p className="text-gray-700 dark:text-gray-300">
                  Utilized for centuries in regional crafts and local folk traditions.
                </p>
                <div className="mt-4 p-5 rounded-2xl bg-[#8b5a2b]/5 border-l-4 border-[#8b5a2b]">
                  <p className="text-sm italic font-medium text-[#4a3728] dark:text-amber-200">
                    "{plant.funFact}"
                  </p>
                </div>
              </SectionCard>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <ConfidenceBar score={confidenceScore} />
              
              <div className="p-6 rounded-[1.5rem] bg-[#f4f1ea] dark:bg-gray-800/30 border border-[#8b5a2b]/10">
                <h4 className="text-[10px] font-black text-[#8b5a2b] uppercase tracking-widest mb-4">Quick Stats</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Stability</span>
                    <span className="font-bold">Steady</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Engine</span>
                    <span className="font-bold text-[#8b5a2b]">G3-Pro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Restored Nutrition Section */}
          {plant.isEdible && (
            <div className="mt-20 pt-20 border-t border-gray-100 dark:border-gray-800">
              <HealthBenefits plant={plant} />
            </div>
          )}
        </div>

        {/* Media Feed */}
        <div className="bg-[#f4f1ea] dark:bg-black/40 p-8 md:p-12 border-t border-[#8b5a2b]/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <Youtube size={18} className="text-red-500" /> Visual Verification
            </h3>
          </div>

          {loadingVideos ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#8b5a2b] mb-4" size={32} />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sourcing Media...</p>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((v, i) => (
                <YouTubePlayer key={i} video={v} isActive={activeVideoUrl === v.link} onPlay={() => setActiveVideoUrl(v.link)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Multimedia feed loading...</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};