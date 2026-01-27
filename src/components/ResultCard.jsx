import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Info, MapPin, History, Youtube, Loader2, Leaf, ShieldCheck
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
      className="w-full max-w-2xl mx-auto mb-16 relative z-10"
    >
      <div className="bg-[#111827] dark:bg-[#111827] rounded-3xl border border-white/5 clay-shadow overflow-hidden">
        
        {/* Plant Meta Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
              plant.isEdible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {plant.isEdible ? '✓ Edible Species' : '⚠ High Risk'}
            </div>
            <div className="flex items-center gap-2 text-gray-500">
               <ShieldCheck size={14} />
               <span className="text-[10px] font-bold uppercase tracking-widest">{confidenceScore}% Match</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white mb-1">{plant.commonName}</h2>
          <p className="text-sm font-serif italic text-emerald-500/60 mb-6">{plant.scientificName}</p>
          
          <AICondensedSummary description={plant.description} />
        </div>

        <div className="px-8 pb-8 space-y-4">
          {/* Edible Parts Section - As seen in image */}
          <SectionCard 
            title="Edible Parts" 
            icon={Leaf} 
            preview={plant.isEdible ? "Fruit, leaves, or roots..." : "Non-consumable"}
            defaultOpen={true}
          >
            <p className="text-white font-medium">{plant.isEdible ? "Fruit, seeds, and occasionally leaves." : "No parts are recommended for consumption."}</p>
          </SectionCard>

          {/* Nutrition Profile - Restored as requested */}
          {plant.isEdible && <HealthBenefits plant={plant} />}

          {/* Botanical Details */}
          <SectionCard title="Habitat & Distribution" icon={MapPin}>
            <p className="text-gray-400">Native to diverse geographical zones. Thrives in well-drained soil.</p>
          </SectionCard>
          
          <SectionCard title="Botanical History" icon={History}>
            <p className="text-gray-400">{plant.funFact}</p>
          </SectionCard>
        </div>

        {/* Video verification section */}
        <div className="bg-black/20 p-8 border-t border-white/5">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6">
             <Youtube size={16} className="text-red-500" /> Verification Media
           </h3>
           {loadingVideos ? (
             <div className="flex justify-center py-6"><Loader2 className="animate-spin text-emerald-500" /></div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
                {videos.slice(0, 1).map((v, i) => (
                  <YouTubePlayer key={i} video={v} isActive={activeVideoUrl === v.link} onPlay={() => setActiveVideoUrl(v.link)} />
                ))}
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
};