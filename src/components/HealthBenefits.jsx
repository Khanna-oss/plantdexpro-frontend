import React from 'react';
import { Heart, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

export const HealthBenefits = ({ plant, isLoading }) => {
  if (!plant.isEdible && !isLoading) return null;

  const nutrients = plant.nutrients || null;
  const healthHints = plant.healthHints || [];

  /**
   * Stricter filter to prevent "Analyzing..." strings from being shown
   * directly from your screenshot findings.
   */
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
        <div className="flex items-center gap-2">
          <Loader2 size={12} className="animate-spin text-[#D63434]" />
          <p className="text-xs font-black text-[#D63434]">Retrieving {label}...</p>
        </div>
      );
    }
    
    if (nutrients && isRealData(value)) {
      return <p className="text-sm font-black leading-tight text-[#D63434]">{value}</p>;
    }

    return (
      <div className="flex items-center gap-1.5 opacity-80">
        <AlertCircle size={10} className="text-[#D63434]" />
        <p className="text-[10px] font-black italic text-[#D63434]">Detailed profile unavailable</p>
      </div>
    );
  };

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex items-center gap-3 mb-2">
        <Heart size={18} className="text-[#D63434]" />
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#D63434]">
          Nutrition Profile
        </h3>
      </div>

      <div className="space-y-3">
        {/* Vitamins Card */}
        <div className="bg-white/50 rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:bg-white/70">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1 text-[#6B0000] opacity-60">SPECIFIC VITAMINS</span>
          {renderNutrientValue(nutrients?.vitamins, "vitamins")}
        </div>

        {/* Minerals Card */}
        <div className="bg-white/50 rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:bg-white/70">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1 text-[#6B0000] opacity-60">KEY MINERALS</span>
          {renderNutrientValue(nutrients?.minerals, "minerals")}
        </div>

        {/* Proteins Card */}
        <div className="bg-white/50 rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:bg-white/70">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1 text-[#6B0000] opacity-60">PROTEIN & AMINO ACIDS</span>
          {renderNutrientValue(nutrients?.proteins, "proteins")}
        </div>
      </div>

      {healthHints.length > 0 && isRealData(healthHints[0]?.label) && (
        <div className="mt-8">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-[#D63434]">BOTANICAL HEALTH HINTS</h4>
          <div className="space-y-4">
            {healthHints.map((hint, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="mt-1 w-4 h-4 rounded-full bg-[#D63434]/10 flex items-center justify-center shrink-0 border border-[#D63434]/20">
                  <Check size={10} className="text-[#D63434]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-black text-[#D63434] group-hover:underline">
                      {hint.label}
                    </h5>
                    <ExternalLink size={10} className="text-[#D63434] opacity-30" />
                  </div>
                  <p className="text-[10px] leading-relaxed mt-0.5 font-bold text-[#6B0000] opacity-80">
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