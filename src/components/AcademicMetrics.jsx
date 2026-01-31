import React from 'react';
import { Microscope, Zap, Database, Leaf, Trees } from 'lucide-react';

export const AcademicMetrics = ({ modelInfo }) => {
  return (
    <div className="bg-black/30 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 shadow-xl animate-scan">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#CCFF00]/10 rounded-xl">
          <Microscope size={18} className="text-[#CCFF00]" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5F5DC]">
          Research Parameters (MCA 2026)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
          <span className="text-[8px] font-black uppercase text-[#CCFF00]/60 tracking-widest mb-2">Model Architecture</span>
          <p className="text-[11px] font-bold text-[#F5F5DC] leading-tight">{modelInfo.name}</p>
        </div>

        <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
          <span className="text-[8px] font-black uppercase text-[#CCFF00]/60 tracking-widest mb-2">Confidence Accuracy</span>
          <p className="text-2xl font-black text-[#CCFF00] tracking-tighter">{modelInfo.accuracy}%</p>
        </div>

        <div className="flex flex-col p-4 bg-[#CCFF00]/5 rounded-2xl border border-[#CCFF00]/20">
          <span className="text-[8px] font-black uppercase text-[#CCFF00] tracking-widest mb-2">Network Latency</span>
          <p className="text-2xl font-black text-[#F5F5DC] tracking-tighter">{modelInfo.latency}ms</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={10} className="text-[#F5F5DC]/40" />
          <span className="text-[8px] font-black uppercase text-[#F5F5DC]/40 tracking-widest">Dataset: {modelInfo.dataset}</span>
        </div>
        <div className="px-3 py-1 bg-[#CCFF00] text-[#1D3B23] rounded-full text-[8px] font-black uppercase tracking-widest">
          Verified Fact
        </div>
      </div>
    </div>
  );
};