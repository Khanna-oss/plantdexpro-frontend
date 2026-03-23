import React from 'react';
import { Leaf } from 'lucide-react';

export const Spinner = ({ message }) => {
  return (
    <div className="soil-shell flex flex-col items-center justify-center gap-5 px-10 py-8 text-center max-w-sm mx-auto relative overflow-hidden">
      <div className="texture-overlay" />
      <div className="relative z-10 w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--golden-soil)]/20 animate-ping" style={{ animationDuration: '1.8s' }} />
        <div className="absolute inset-1 rounded-full border border-[var(--golden-soil)]/40 animate-spin" style={{ animationDuration: '2.5s', borderTopColor: 'var(--golden-soil)' }} />
        <Leaf size={24} className="text-[var(--golden-soil)] relative z-10" />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-semibold text-[var(--cream)] leading-relaxed">
          {message || 'Analyzing Botanical Specimen...'}
        </p>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--golden-soil)]/50 mt-1.5">
          Save Soil Research Engine
        </p>
      </div>
    </div>
  );
};