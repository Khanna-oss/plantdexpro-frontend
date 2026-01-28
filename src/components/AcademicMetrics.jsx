import React from 'react';
import { Microscope, Zap, Database, CheckCircle, Leaf, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const AcademicMetrics = ({ modelInfo }) => {
  return (
    <div className="bg-[#1D3B23]/10 dark:bg-white/5 rounded-[2.5rem] p-8 border border-white/20">
      <div className="flex items-center gap-3 mb-8">
        <Microscope size={20} className="text-[#CCFF00]" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#CCFF00]">
          Research Metrics (MCA 2030)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 text-[#CCFF00]/60">
            <Leaf size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Architecture</span>
          </div>
          <p className="text-sm font-black text-white leading-tight">
            {modelInfo.name}
          </p>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 text-[#CCFF00]/60">
            <CheckCircle size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Validation Accuracy</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-[#CCFF00] tracking-tighter">
              {modelInfo.accuracy}%
            </p>
          </div>
        </div>

        <div className="flex flex-col relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2 text-[#CCFF00]/60">
            <Zap size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Inference Speed</span>
          </div>
          <div className="flex items-center gap-2 animate-pulse-soft">
            <p className="text-2xl font-black text-white tracking-tighter">
              {modelInfo.latency}ms
            </p>
            <Activity size={16} className="text-[#CCFF00] opacity-50" />
          </div>
          {/* Subtle Glow Pulse for Inference Speed */}
          <div className="absolute -inset-2 bg-[#CCFF00]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-full" />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={12} className="text-white/40" />
          <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Dataset: {modelInfo.dataset}</span>
        </div>
        <div className="px-3 py-1 bg-[#CCFF00] text-[#1D3B23] rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-[#CCFF00]/20">
          Peer Reviewed
        </div>
      </div>
    </div>
  );
};