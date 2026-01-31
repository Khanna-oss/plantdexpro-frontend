import React from 'react';
import { Heart, Check, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export const HealthBenefits = ({ plant, isLoading }) => {
  if (!plant.isEdible && !isLoading) return null;

  const nutrients = plant.nutrients || null;
  const healthHints = plant.healthHints || [];

  const renderNutrientField = (label, value) => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 py-1">
          <Loader2 size={12} className="animate-spin text-[#D63434]" />
          <span className="text-[10px] font-black text-[#D63434] italic">
            Querying Data Warehouse...
          </span>
        </div>
      );
    }
    
    // Hallucination check & fallback
    const isInvalid = !value || value.length < 5 || value.toLowerCase().includes("analyzing");
    if (isInvalid) {
      return (
        <div className="flex items-center gap-1.5 py-1">
          <AlertCircle size={12} className="text-[#D63434]/60" />
          <p className="text-[10px] font-bold italic text-[#6B0000]/60">
            Nutrition data not reliably available for this plant.
          </p>
        </div>
      );
    }

    return (
      <p className="text-sm font-black text-[#6B0000] drop-shadow-sm leading-tight">
        {value}
      </p>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D63434]/10 rounded-xl border border-[#D63434]/20">
            <Heart size={18} className="text-[#D63434]" />
          </div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#D63434]">
            Nutrition Profile
          </h3>
        </div>
        {plant.nutrients?.isVerified && (
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-emerald-700 tracking-tighter">
            <ShieldCheck size={12} /> ETL Verified
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="bg-white/60 rounded-2xl p-4 border border-black/5 shadow-sm hover:bg-white/80 transition-all">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1.5 text-[#6B0000] opacity-60">
            Specific Vitamins
          </span>
          {renderNutrientField("vitamin", nutrients?.vitamins)}
        </div>

        <div className="bg-white/60 rounded-2xl p-4 border border-black/5 shadow-sm hover:bg-white/80 transition-all">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1.5 text-[#6B0000] opacity-60">
            Key Minerals
          </span>
          {renderNutrientField("mineral", nutrients?.minerals)}
        </div>

        <div className="bg-white/60 rounded-2xl p-4 border border-black/5 shadow-sm hover:bg-white/80 transition-all">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1.5 text-[#6B0000] opacity-60">
            Protein Profile
          </span>
          {renderNutrientField("protein", nutrients?.proteins)}
        </div>
      </div>

      {!isLoading && healthHints.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#6B0000]/10">
          <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 text-[#D63434]">Explainable Insights</h4>
          <div className="grid grid-cols-1 gap-4">
            {healthHints.map((hint, idx) => (
              <div key={idx} className="flex gap-4 items-start p-3 rounded-2xl bg-[#6B0000]/5 border border-[#6B0000]/10 hover:bg-[#6B0000]/10 transition-colors">
                <div className="mt-1 w-5 h-5 rounded-full bg-[#D63434] flex items-center justify-center shrink-0">
                  <Check size={10} className="text-white" />
                </div>
                <div>
                  <h5 className="text-[12px] font-black text-[#6B0000] mb-0.5">{hint.label}</h5>
                  <p className="text-[11px] leading-snug font-bold text-[#6B0000]/70">{hint.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};