
import React from 'react';
import { HeartPulse, Check, Leaf, AlertCircle, Info, Sparkles } from 'lucide-react';
import { ConfidenceBar } from './ConfidenceBar.jsx';

export const HealthBenefits = ({ plant }) => {
  if (!plant.isEdible) return null;

  const nutrients = plant.nutrients || {};
  const hasNutrients = nutrients.vitamins || nutrients.minerals;
  const healthHints = plant.healthHints || [];
  const confidence = plant.nutritionConfidence || 88;

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
          <HeartPulse size={18} className="text-rose-500" /> Bio-Analysis & Wellness
        </h3>
        {plant.nutritionConfidence && (
          <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-2">
            <Sparkles size={10} className="text-emerald-500" />
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">AI Extraction Level: {confidence}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
          <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest block mb-1">Vitamins</span>
          <p className="text-lg font-black text-emerald-900 dark:text-emerald-100">{nutrients.vitamins || 'Tracing...'}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
          <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest block mb-1">Minerals</span>
          <p className="text-lg font-black text-blue-900 dark:text-blue-100">{nutrients.minerals || 'Tracing...'}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
          <span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest block mb-1">Proteins</span>
          <p className="text-lg font-black text-amber-900 dark:text-amber-100">{nutrients.proteins || 'Tracing...'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">Potential Biological Impact</h4>
          {healthHints.length > 0 ? (
            healthHints.map((hint, idx) => (
              <div key={idx} className="p-4 rounded-3xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex gap-4 items-start group hover:border-emerald-500/30 transition-all">
                <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Check size={14} className="text-emerald-600" />
                </div>
                <div>
                  <h5 className="text-sm font-black text-gray-800 dark:text-gray-100">{hint.label}</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{hint.desc}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/20 border-2 border-dashed border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 italic">No verified health links identified yet.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
           <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">Recommended Preparation</h4>
           <div className="p-6 rounded-[2.5rem] bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
              <Leaf className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Info size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Usage Protocol</span>
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  {plant.specificUsage || "Standard culinary preparation suggested. Ensure thorough washing and check for personal allergies before use."}
                </p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
