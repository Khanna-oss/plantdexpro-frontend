import React from 'react';
import { Microscope, Zap, Database, CheckCircle, Leaf, Activity, Trees } from 'lucide-react';
import { motion } from 'framer-motion';

export const AcademicMetrics = ({ modelInfo }) => {
  return (
    <div className="bg-black/30 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-scan">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#CCFF00]/10 rounded-xl">
          <Microscope size={20} className="text-[#CCFF00]" />
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#F5F5DC]">
          Research Metrics (MCA 2030)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
          <div className="flex items-center gap-2 mb-3 text-[#CCFF00]/60">
            <Leaf size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Morphology</span>
          </div>
          <p className="text-sm font-bold text-[#F5F5DC] leading-tight group-hover:text-white transition-colors">
            {modelInfo.name}
          </p>
        </div>

        <div className="flex flex-col p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
          <div className="flex items-center gap-2 mb-3 text-[#CCFF00]/60">
            <Trees size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Growth Habit</span>
          </div>
          <p className="text-3xl font-black text-[#CCFF00] tracking-tighter">
            {modelInfo.accuracy}%
          </p>
        </div>

        <div className="flex flex-col p-5 bg-[#CCFF00]/5 rounded-2xl border border-[#CCFF00]/20 animate-pulse-soft">
          <div className="flex items-center gap-2 mb-3 text-[#CCFF00]">
            <Zap size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Inference Speed</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-[#F5F5DC] tracking-tighter">
              {modelInfo.latency}ms
            </p>
            <Activity size={16} className="text-[#CCFF00] opacity-50" />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={12} className="text-[#F5F5DC]/40" />
          <span className="text-[8px] font-black uppercase text-[#F5F5DC]/40 tracking-widest">Dataset: {modelInfo.dataset}</span>
        </div>
        <div className="px-4 py-1.5 bg-[#CCFF00] text-[#1D3B23] rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
          Peer Verified
        </div>
      </div>
    </div>
  );
};