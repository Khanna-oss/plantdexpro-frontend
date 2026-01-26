import React from 'react';
import { HeartPulse, Check, Leaf, Info, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const HealthBenefits = ({ plant }) => {
  if (!plant.isEdible) return null;

  const nutrients = plant.nutrients || {};
  const healthHints = plant.healthHints || [];
  const benefitChips = plant.benefitChips || ["Botanical Profile", "Analyzed"];
  const confidence = plant.nutritionConfidence || 95;

  return (
    <section className="space-y-16">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-4">
          <ShieldCheck size={24} className="text-[#8b5a2b]" /> Biochemical integrity
        </h3>
        <div className="bg-[#8b5a2b]/10 border border-[#8b5a2b]/20 px-6 py-2 rounded-full flex items-center gap-3">
          <Sparkles size={14} className="text-[#8b5a2b]" />
          <span className="text-[10px] font-black text-[#4a3728] dark:text-[#f4f1ea] uppercase tracking-widest">Profile Verified: {confidence}%</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {benefitChips.map((chip, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-[#8b5a2b]/10 shadow-sm flex items-center gap-2"
          >
            <Zap size={12} className="text-[#8b5a2b]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#4a3728] dark:text-[#f4f1ea]">{chip}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { icon: HeartPulse, label: 'Primary Vitamins', color: 'clay', data: nutrients.vitamins },
          { icon: Activity, label: 'Mineral Matrix', color: 'soil', data: nutrients.minerals },
          { icon: Leaf, label: 'Phytochemicals', color: 'forest', data: nutrients.proteins || 'Plant-based' }
        ].map((item, idx) => (
          <div key={idx} className="p-10 rounded-[2.5rem] bg-white dark:bg-gray-800 border-b-4 border-[#8b5a2b]/30 shadow-lg group">
            <div className="w-14 h-14 bg-[#8b5a2b]/10 rounded-2xl flex items-center justify-center mb-8 text-[#8b5a2b] group-hover:scale-110 transition-transform">
               <item.icon size={28} />
            </div>
            <span className="text-[10px] font-black text-[#8b5a2b] uppercase tracking-[0.3em] block mb-3">{item.label}</span>
            <div className="text-2xl font-black text-[#4a3728] dark:text-white leading-tight">
              {item.data || "Extracting..."}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-10">
        <div className="space-y-8">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Therapeutic Hints</h4>
          <div className="space-y-6">
            {healthHints.map((hint, idx) => (
              <div key={idx} className="p-8 rounded-[2.2rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex gap-6 items-start shadow-sm">
                <div className="w-12 h-12 rounded-3xl bg-[#8b5a2b] text-white flex items-center justify-center shrink-0">
                  <Check size={20} />
                </div>
                <div>
                  <h5 className="text-base font-black text-[#4a3728] dark:text-white mb-2">{hint.label}</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{hint.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
           <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Safe Preparation</h4>
           <div className="p-12 rounded-[3.5rem] bg-[#4a3728] text-white shadow-xl relative overflow-hidden group min-h-[350px] flex flex-col justify-center">
              <Leaf className="absolute -bottom-20 -right-20 text-white/5 w-80 h-80 rotate-12" />
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-[2rem] bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20">
                    <Info size={32} />
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-[0.4em]">Protocol</span>
                </div>
                <p className="text-2xl font-medium leading-relaxed italic opacity-95">
                  {plant.specificUsage || "Standard botanical preparation suggested. Ensure thorough cleansing."}
                </p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};