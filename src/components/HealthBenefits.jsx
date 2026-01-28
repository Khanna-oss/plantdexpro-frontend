import React from 'react';
import { Heart, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

export const HealthBenefits = ({ plant, isLoading }) => {
  if (!plant.isEdible && !isLoading) return null;

  const nutrients = plant.nutrients || null;
  const healthHints = plant.healthHints || [];

  const isRealData = (text) => {
    if (!text || typeof text !== 'string') return false;
    const fillerPhrases = [
      'analyzing', 'determining', 'calculating', 'searching', 
      'primary vitamins', 'composition', 'levels', 'processing'
    ];
    const lowerText = text.toLowerCase();
    return !fillerPhrases.some(phrase => lowerText.includes(phrase)) && text.length > 5;
  };

  const renderNutrientValue = (value, label) => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 py-1">
          <Loader2 size={14} className="animate-spin text-[#D63434]" />
          <p className="text-xs font-black text-[#D63434] italic animate-pulse">Fetching {label} insights...</p>
        </div>
      );
    }
    
    if (nutrients && isRealData(value)) {
      return (
        <p className="text-sm font-black leading-tight text-[#6B0000] drop-shadow-sm">
          {value}
        </p>
      );
    }

    return (
      <div className="flex items-center gap-1.5 py-1 opacity-70">
        <AlertCircle size={12} className="text-[#D63434]" />
        <p className="text-[11px] font-black italic text-[#D63434]">Nutrition data unavailable for this plant.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#D63434]/10 rounded-xl">
          <Heart size={20} className="text-[#D63434]" />
        </div>
        <h3 className="text-[13px] font-black uppercase tracking-[0.3em] text-[#D63434]">
          Nutrition Profile
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vitamins Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[1.5rem] p-5 border border-white/40 shadow-sm transition-all hover:bg-white/80 hover:shadow-md group">
          <span className="text-[9px] font-black uppercase tracking-[0.15em] block mb-2 text-[#6B0000] opacity-60 group-hover:opacity-100 transition-opacity">Vitamins</span>
          {renderNutrientValue(nutrients?.vitamins, "vitamin")}
        </div>

        {/* Minerals Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[1.5rem] p-5 border border-white/40 shadow-sm transition-all hover:bg-white/80 hover:shadow-md group">
          <span className="text-[9px] font-black uppercase tracking-[0.15em] block mb-2 text-[#6B0000] opacity-60 group-hover:opacity-100 transition-opacity">Minerals</span>
          {renderNutrientValue(nutrients?.minerals, "mineral")}
        </div>

        {/* Proteins Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[1.5rem] p-5 border border-white/40 shadow-sm transition-all hover:bg-white/80 hover:shadow-md group">
          <span className="text-[9px] font-black uppercase tracking-[0.15em] block mb-2 text-[#6B0000] opacity-60 group-hover:opacity-100 transition-opacity">Proteins</span>
          {renderNutrientValue(nutrients?.proteins, "protein")}
        </div>
      </div>

      {healthHints.length > 0 && isRealData(healthHints[0]?.label) && (
        <div className="mt-10 pt-8 border-t border-[#6B0000]/10">
          <h4 className="text-[11px] font-black uppercase tracking-[0.25em] mb-6 text-[#D63434]">Research-Backed Benefits</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {healthHints.map((hint, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#D63434] flex items-center justify-center shrink-0 border-2 border-white/50 shadow-sm">
                  <Check size={12} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="text-[13px] font-black text-[#6B0000] leading-none group-hover:text-[#D63434] transition-colors">
                      {hint.label}
                    </h5>
                    <ExternalLink size={10} className="text-[#D63434] opacity-40" />
                  </div>
                  <p className="text-[11px] leading-relaxed font-bold text-[#6B0000]/80">
                    {hint.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};