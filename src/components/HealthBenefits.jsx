import React from 'react';
import { Heart, Check, ExternalLink, Loader2 } from 'lucide-react';

export const HealthBenefits = ({ plant, isLoading }) => {
  if (!plant.isEdible && !isLoading) return null;

  const nutrients = plant.nutrients || null;
  const healthHints = plant.healthHints || [];

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex items-center gap-3 mb-2">
        <Heart size={18} style={{ color: '#D63434' }} />
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em]" style={{ color: '#D63434' }}>
          Nutrition Profile
        </h3>
      </div>

      <div className="space-y-3">
        {/* Vitamins Card */}
        <div className="bg-white/40 rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:bg-white/60">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1 text-white">SPECIFIC VITAMINS</span>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" style={{ color: '#D63434' }} />
              <p className="text-sm font-bold" style={{ color: '#D63434' }}>Searching for nutrition data...</p>
            </div>
          ) : nutrients ? (
            <p className="text-md font-bold leading-tight" style={{ color: '#6B0000' }}>{nutrients.vitamins}</p>
          ) : (
            <p className="text-sm font-bold italic" style={{ color: '#D63434' }}>Nutrition data not reliably available for this plant.</p>
          )}
        </div>

        {/* Minerals Card */}
        <div className="bg-white/40 rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:bg-white/60">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1 text-white">KEY MINERALS</span>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" style={{ color: '#D63434' }} />
              <p className="text-sm font-bold" style={{ color: '#D63434' }}>Searching for nutrition data...</p>
            </div>
          ) : nutrients ? (
            <p className="text-md font-bold leading-tight" style={{ color: '#6B0000' }}>{nutrients.minerals}</p>
          ) : (
            <p className="text-sm font-bold italic" style={{ color: '#D63434' }}>Nutrition data not reliably available for this plant.</p>
          )}
        </div>

        {/* Proteins Card */}
        <div className="bg-white/40 rounded-2xl p-4 border border-black/5 shadow-sm transition-all hover:bg-white/60">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1 text-white">PROTEIN & AMINO ACIDS</span>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" style={{ color: '#D63434' }} />
              <p className="text-sm font-bold" style={{ color: '#D63434' }}>Searching for nutrition data...</p>
            </div>
          ) : nutrients ? (
            <p className="text-md font-bold leading-tight" style={{ color: '#6B0000' }}>{nutrients.proteins}</p>
          ) : (
            <p className="text-sm font-bold italic" style={{ color: '#D63434' }}>Nutrition data not reliably available for this plant.</p>
          )}
        </div>
      </div>

      {healthHints.length > 0 && (
        <div className="mt-8">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#D63434' }}>IDENTIFIED BENEFITS</h4>
          <div className="space-y-4">
            {healthHints.map((hint, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="mt-1 w-4 h-4 rounded-full bg-black/10 flex items-center justify-center shrink-0 border border-black/5">
                  <Check size={10} style={{ color: '#6B0000' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-black group-hover:underline" style={{ color: '#6B0000' }}>
                      {hint.label}
                    </h5>
                    <ExternalLink size={10} style={{ color: '#6B0000', opacity: 0.3 }} />
                  </div>
                  <p className="text-[10px] leading-relaxed mt-0.5 font-bold" style={{ color: '#6B0000', opacity: 0.8 }}>
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