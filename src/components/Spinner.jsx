import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ message }) => {
  return (
    <div className="soil-shell flex flex-col items-center justify-center gap-4 px-8 py-6 text-center max-w-2xl mx-auto relative overflow-hidden">
      <div className="texture-overlay" />
      <Loader2 className="animate-spin h-12 w-12 text-[var(--golden-soil)] relative z-10" />
      <div className="relative z-10 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--golden-soil)]">Inference Lifecycle</p>
        <p className="text-base md:text-lg font-semibold text-[var(--cream)]">{message || 'Stage 1: Feature Extraction & Scalar Value Mapping...'}</p>
      </div>
    </div>
  );
};