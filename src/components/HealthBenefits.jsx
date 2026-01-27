import React from 'react';
import { Heart, Check, ExternalLink } from 'lucide-react';

export const HealthBenefits = ({ plant }) => {
  if (!plant.isEdible) return null;

  const nutrients = plant.nutrients || {
    vitamins: "Analysis in progress...",
    minerals: "Data fetching...",
    proteins: "Contacting database..."
  };
  
  const healthHints = plant.healthHints || [
    { label: "Botanical Research", desc: "Consulting scientific databases for specific species benefits." }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Heart size={18} className="text-emerald-900" />
        <h3 className="text-[12px] font-black text-emerald-900 uppercase tracking-[0.3em]">
          TRUTHFUL NUTRITION PROFILE
        </h3>
      </div>

      <div className="space-y-3">
        {/* Vitamins Card */}
        <div className="bg-white/40 rounded-2xl p-4 border border-emerald-900/10 shadow-sm">
          <span className="text-[9px] font-bold text-emerald-900/50 uppercase tracking-widest block mb-1">SPECIFIC VITAMINS</span>
          <p className="text-md font-bold text-emerald-950">{nutrients.vitamins}</p>
        </div>

        {/* Minerals Card */}
        <div className="bg-white/40 rounded-2xl p-4 border border-emerald-900/10 shadow-sm">
          <span className="text-[9px] font-bold text-emerald-900/50 uppercase tracking-widest block mb-1">KEY MINERALS</span>
          <p className="text-md font-bold text-emerald-950">{nutrients.minerals}</p>
        </div>

        {/* Proteins Card */}
        <div className="bg-white/40 rounded-2xl p-4 border border-emerald-900/10 shadow-sm">
          <span className="text-[9px] font-bold text-emerald-900/50 uppercase tracking-widest block mb-1">PROTEIN & AMINO ACIDS</span>
          <p className="text-md font-bold text-emerald-950">{nutrients.proteins}</p>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-[10px] font-black text-emerald-900/50 uppercase tracking-widest mb-4">IDENTIFIED BENEFITS</h4>
        <div className="space-y-4">
          {healthHints.map((hint, idx) => (
            <div key={idx} className="flex gap-3 items-start group">
              <div className="mt-1 w-4 h-4 rounded-full bg-emerald-950/10 flex items-center justify-center shrink-0">
                <Check size={10} className="text-emerald-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-emerald-950 group-hover:underline cursor-default">
                    {hint.label}
                  </h5>
                  <ExternalLink size={10} className="text-emerald-900/40" />
                </div>
                <p className="text-[10px] text-emerald-900/60 leading-relaxed mt-0.5 font-medium">
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