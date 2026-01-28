import React from 'react';
import { Heart, Check, ExternalLink } from 'lucide-react';

export const HealthBenefits = ({ plant }) => {
  if (!plant.isEdible) return null;

  // Use the fetched nutrients or show high-quality placeholders during very short loading
  const nutrients = plant.nutrients || {
    vitamins: "Analyzing primary vitamins...",
    minerals: "Determining mineral composition...",
    proteins: "Calculating protein levels..."
  };
  
  const healthHints = plant.healthHints || [
    { label: "Validating Benefits", desc: "Accessing botanical databases for peer-reviewed health data." }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Heart size={18} className="text-emerald-950" />
        <h3 className="text-[12px] font-black text-emerald-950 uppercase tracking-[0.3em]">
          Nutrition Profile
        </h3>
      </div>

      <div className="space-y-3">
        {/* Vitamins Card */}
        <div className="bg-white/60 rounded-2xl p-4 border border-emerald-950/10 shadow-sm transition-all hover:bg-white/80">
          <span className="text-[9px] font-black text-emerald-900/60 uppercase tracking-widest block mb-1">SPECIFIC VITAMINS</span>
          <p className="text-md font-bold text-emerald-950 leading-tight">{nutrients.vitamins}</p>
        </div>

        {/* Minerals Card */}
        <div className="bg-white/60 rounded-2xl p-4 border border-emerald-950/10 shadow-sm transition-all hover:bg-white/80">
          <span className="text-[9px] font-black text-emerald-900/60 uppercase tracking-widest block mb-1">KEY MINERALS</span>
          <p className="text-md font-bold text-emerald-950 leading-tight">{nutrients.minerals}</p>
        </div>

        {/* Proteins Card */}
        <div className="bg-white/60 rounded-2xl p-4 border border-emerald-950/10 shadow-sm transition-all hover:bg-white/80">
          <span className="text-[9px] font-black text-emerald-900/60 uppercase tracking-widest block mb-1">PROTEIN & AMINO ACIDS</span>
          <p className="text-md font-bold text-emerald-950 leading-tight">{nutrients.proteins}</p>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-[10px] font-black text-emerald-900/60 uppercase tracking-widest mb-4">IDENTIFIED BENEFITS</h4>
        <div className="space-y-4">
          {healthHints.map((hint, idx) => (
            <div key={idx} className="flex gap-3 items-start group">
              <div className="mt-1 w-4 h-4 rounded-full bg-emerald-950/20 flex items-center justify-center shrink-0 border border-emerald-950/10">
                <Check size={10} className="text-emerald-950" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-black text-emerald-950 group-hover:underline decoration-emerald-950/30">
                    {hint.label}
                  </h5>
                  <ExternalLink size={10} className="text-emerald-950/30" />
                </div>
                <p className="text-[10px] text-emerald-950/70 leading-relaxed mt-0.5 font-bold">
                  {hint.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};