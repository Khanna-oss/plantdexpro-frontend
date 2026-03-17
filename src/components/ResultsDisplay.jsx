
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Cpu, Activity, Clock } from 'lucide-react';
import { ResultCard } from './ResultCard.jsx';

export const ResultsDisplay = ({ results }) => {
  if (!results || results.length === 0) return null;

  // Assuming we take the metrics from the first result if multiple
  const mainResult = results[0];
  const { etlVerified, xaiMeta } = mainResult;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 pb-24">
      {/* XAI Metrics Panel - Academic Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#2c1e14] border border-[#4a3728] rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        {/* Decorative Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.02] font-black text-8xl pointer-events-none select-none tracking-tighter">
          XAI METRICS
        </div>

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className={`p-5 rounded-3xl shadow-inner ${etlVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                {etlVerified ? <Shield size={40} /> : <ShieldAlert size={40} />}
              </div>
              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${etlVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {etlVerified ? 'Shield: ETL Verified' : 'Inference Only'}
                </div>
                <h3 className="text-white font-black uppercase tracking-widest text-xl mb-1">
                  Ground Truth Status
                </h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  Pipeline: {xaiMeta?.source || 'Neural Engine'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-10">
              <div className="text-center">
                <div className="flex items-center gap-2 text-gray-500 mb-2 justify-center">
                  <Clock size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Latency</span>
                </div>
                <p className="text-[#CCFF00] font-black text-3xl tabular-nums">{xaiMeta?.latency || 0}<span className="text-xs ml-1">ms</span></p>
              </div>
              <div className="h-12 w-[1px] bg-white/10" />
              <div className="text-center">
                <div className="flex items-center gap-2 text-gray-500 mb-2 justify-center">
                  <Activity size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Confidence</span>
                </div>
                <p className="text-[#CCFF00] font-black text-3xl tabular-nums">{xaiMeta?.confidence || 0}<span className="text-xs ml-1">%</span></p>
              </div>
            </div>
          </div>

          {/* Confidence Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Model Confidence Index</span>
              <span className="text-white text-xs font-black tracking-widest">{xaiMeta?.confidence || 0}%</span>
            </div>
            <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xaiMeta?.confidence || 0}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#CCFF00] rounded-full shadow-[0_0_20px_rgba(204,255,0,0.3)]"
              />
            </div>
          </div>
        </div>
        
        {/* Bottom Strip */}
        <div className="bg-black/30 px-10 py-5 flex justify-between items-center border-t border-white/5">
          <div className="flex items-center gap-3 text-gray-500">
            <Cpu size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">XAI Engine: Gemini 2.5 Flash + ETL Shield</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Operational</span>
          </div>
        </div>
      </motion.div>

      {/* Result Cards */}
      <div className="space-y-16">
        {results.map((plant, index) => (
          <ResultCard 
            key={plant.id || index} 
            plant={plant} 
          />
        ))}
      </div>
    </div>
  );
};
