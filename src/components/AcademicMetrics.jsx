import React from 'react';
import { BarChart3, Database, Cpu } from 'lucide-react';

export const AcademicMetrics = ({ modelInfo }) => {
  return (
    <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
      <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-3">
        <Database size={16} /> Research Metrics (MCA 2026)
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Architecture</p>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-emerald-500" />
            <span className="text-sm font-bold text-white uppercase">{modelInfo.name}</span>
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Validation Accuracy</p>
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-emerald-500" />
            <span className="text-sm font-bold text-white">{modelInfo.accuracy}%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Inference Speed</p>
          <p className="text-sm font-bold text-white">{modelInfo.latency}ms</p>
        </div>
      </div>
    </div>
  );
};