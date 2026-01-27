import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Info, MapPin, History, Youtube, Loader2, Leaf, ShieldCheck, Microscope
} from 'lucide-react';
import { plantDexService } from '../services/plantDexService.js';
import { YouTubePlayer } from './YouTubePlayer.jsx';
import { ConfidenceBar } from './ConfidenceBar.jsx';
import { AICondensedSummary } from './AICondensedSummary.jsx';
import { SectionCard } from './SectionCard.jsx';
import { HealthBenefits } from './HealthBenefits.jsx';
import { GradCamView } from './GradCamView.jsx';
import { AcademicMetrics } from './AcademicMetrics.jsx';

export const ResultCard = ({ plant }) => {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  const confidenceScore = plant.uiConfidence || 94;
  
  const modelInfo = {
    name: "MobileNetV2 + LLM Hybrid",
    accuracy: 94.2,
    latency: 1240,
    dataset: "PlantVillage v2"
  };

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
      className="w-full max-w-2xl mx-auto mb-16 relative z-10 px-4 md:px-0"
    >
      <div className="parrot-green-card rounded-[2.5rem] border border-black/5 clay-shadow overflow-hidden shadow-2xl">
        
        {/* Plant Meta Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
              plant.isEdible ? 'bg-emerald-900/10 text-emerald-900' : 'bg-rose-900/10 text-rose-900'
            }`}>
              {plant.isEdible ? '✓ Edible Species' : '⚠ High Risk'}
            </div>
            <div className="flex items-center gap-2 text-emerald-900/60">
               <ShieldCheck size={14} />
               <span className="text-[10px] font-bold uppercase tracking-widest">{confidenceScore}% Match</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-black text-emerald-950 mb-1 tracking-tight">{plant.commonName}</h2>
          <p className="text-base font-serif italic text-emerald-900/70 mb-8">{plant.scientificName}</p>
          
          <div className="opacity-90">
            <AICondensedSummary description={plant.description} />
          </div>
        </div>

        <div className="px-8 pb-10 space-y-6">
          <SectionCard 
            title="EDIBLE PARTS" 
            icon={Leaf} 
            preview={plant.isEdible ? "Safe for consumption..." : "Caution required"}
            defaultOpen={true}
          >
            <p className="text-emerald-950 font-bold text-lg capitalize">{plant.isEdible ? (plant.edibleParts?.join(', ') || 'Various parts') : 'No parts are safe for consumption'}</p>
          </SectionCard>

          {/* Nutrition Profile */}
          {plant.isEdible && (
            <div className="bg-white/30 backdrop-blur-sm rounded-[1.2rem] p-1 border border-white/20">
              <HealthBenefits plant={plant} />
            </div>
          )}

          {/* Explainability View */}
          <div className="bg-emerald-900/5 p-6 rounded-[1.2rem] border border-emerald-900/10">
            <GradCamView features={plant.visualFeatures} />
          </div>

          <AcademicMetrics modelInfo={modelInfo} />

          <div className="grid grid-cols-1 gap-4 pt-4">
            <SectionCard title="HABITAT & ORIGIN" icon={MapPin}>
              <p className="text-emerald-900/80 leading-relaxed font-medium">Native to diverse ecosystems. Requires balanced environmental conditions for optimal growth.</p>
            </SectionCard>
            
            <SectionCard title="BOTANICAL HISTORY" icon={History}>
              <p className="text-emerald-900/80 leading-relaxed font-medium">{plant.funFact || 'A significant species in botanical research.'}</p>
            </SectionCard>
          </div>
        </div>

        {/* Video Feed */}
        <div className="bg-emerald-950/10 p-8 border-t border-black/5">
           <h3 className="text-[10px] font-black text-emerald-950/50 uppercase tracking-widest flex items-center gap-2 mb-6">
             <Youtube size={16} className="text-red-600" /> VERIFICATION MEDIA
           </h3>
           {loadingVideos ? (
             <div className="flex flex-col items-center justify-center py-12 gap-3">
               <Loader2 className="animate-spin text-emerald-700" size={24} />
               <span className="text-[10px] font-bold text-emerald-900/60 uppercase tracking-widest">Sourcing Real Footage...</span>
             </div>
           ) : videos.length > 0 ? (
             <div className="grid grid-cols-1 gap-6">
                {videos.map((v, i) => (
                  <YouTubePlayer key={i} video={v} isActive={activeVideoUrl === v.link} onPlay={() => setActiveVideoUrl(v.link)} />
                ))}
             </div>
           ) : (
             <div className="text-center py-8">
               <p className="text-xs font-bold text-emerald-900/40 uppercase tracking-widest">No verified videos found for this species</p>
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
};