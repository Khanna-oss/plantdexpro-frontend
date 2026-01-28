import React from 'react';
import { Heart, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

export const HealthBenefits = ({ plant, isLoading }) => {
  // If not edible and not loading, we don't show the component
  if (!plant.isEdible && !isLoading) return null;

  const nutrients = plant.nutrients || null;
  const healthHints = plant.healthHints || [];

  /**
   * Field renderer that handles transitions between:
   * 1. Loading state (Fetching insights...)
   * 2. Success state (Real botanical data)
   * 3. Fallback/Error state (Unavailable notice)
   */
  const renderNutrientField = (label, value) => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 py-1">
          <Loader2 size={12} className="animate-spin text-[#c62828]" />
          <span className="text-[10px] font-black text-[#c62828] italic animate-pulse">
            Fetching {label} insights...
          </span>
        </div>
      );
    }
    
    // Check if the value is real botanical data (not generic placeholders)
    if (value && value.length > 3) {
      return (
        <p className="text-sm font-black text-[#6B0000] drop-shadow-sm leading-tight">
          {value}
        </p>
      );
    }

    return (
      <div className="flex items-center gap-1.5 py-1">
        <AlertCircle size={12} className="text-[#c62828]" />
        <p className="text-[10px] font-black italic text-[#c62828]">
          Nutrition data unavailable for this plant.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#D63434]/10 rounded-xl">
          <Heart size={18} className="text-[#D63434]" />
        </div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#D63434]">
          Botanical Nutrition Profile
        </h3>
      </div>

      <div className="space-y-3">
        {/* Vitamins Mapping */}
        <div className="bg-white/50 rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:bg-white/80">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1.5 text-[#6B0000] opacity-60">
            Identified Vitamins
          </span>
          {renderNutrientField("vitamin", nutrients?.vitamins)}
        </div>

        {/* Minerals Mapping */}
        <div className="bg-white/50 rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:bg-white/80">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1.5 text-[#6B0000] opacity-60">
            Key Minerals
          </span>
          {renderNutrientField("mineral", nutrients?.minerals)}
        </div>

        {/* Proteins Mapping */}
        <div className="bg-white/50 rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:bg-white/80">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1.5 text-[#6B0000] opacity-60">
            Protein & Amino Profile
          </span>
          {renderNutrientField("protein", nutrients?.proteins)}
        </div>
      </div>

      {!isLoading && healthHints.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#6B0000]/10">
          <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 text-[#D63434]">Verified Health Hints</h4>
          <div className="grid grid-cols-1 gap-4">
            {healthHints.map((hint, idx) => (
              <div key={idx} className="flex gap-4 items-start p-3 rounded-2xl bg-[#6B0000]/5 border border-[#6B0000]/10 transition-colors hover:bg-[#6B0000]/10">
                <div className="mt-1 w-5 h-5 rounded-full bg-[#D63434] flex items-center justify-center shrink-0 border-2 border-white/50">
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