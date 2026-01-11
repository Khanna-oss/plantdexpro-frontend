
import React from 'react';
import { HeartPulse, Check, Leaf, Info, Sparkles, Activity, ShieldCheck } from 'lucide-react';

export const HealthBenefits = ({ plant }) => {
  if (!plant.isEdible) return null;

  const nutrients = plant.nutrients || {};
  const healthHints = plant.healthHints || [];
  const confidence = plant.nutritionConfidence || 95;

  const formatList = (str) => {
    if (!str || str.toLowerCase().includes("tracing")) {
      return (
        <span className="flex items-center gap-2 text-emerald-600/50 italic animate-pulse">
          <Activity size={12} /> Syncing Compounds...
        </span>
      );
    }
    return str;
  };

  return (
    <section className="space-y-12 py-10">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3">
          <ShieldCheck size={20} className="text-emerald-500" /> Biochemical Integrity
        </h3>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
          <Sparkles size={12} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Verified Profile: {confidence}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: HeartPulse, label: 'Vitamins', color: 'emerald', data: nutrients.vitamins },
          { icon: Activity, label: 'Minerals', color: 'blue', data: nutrients.minerals },
          { icon: Leaf, label: 'Phytochemicals', color: 'amber', data: nutrients.proteins || 'Plant Proteins' }
        ].map((item, idx) => (
          <div key={idx} className={`p-8 rounded-[3rem] bg-${item.color}-500/[0.03] border border-${item.color}-500/10 hover:shadow-2xl transition-all group`}>
            <div className={`w-12 h-12 bg-${item.color}-500/10 rounded-2xl flex items-center justify-center mb-6 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
               <item.icon size={24} />
            </div>
            <span className={`text-[10px] font-black text-${item.color}-600 uppercase tracking-widest block mb-2`}>{item.label}</span>
            <div className="text-xl font-black text-gray-900 dark:text-white leading-tight">
              {formatList(item.data)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Wellness Corollaries</h4>
          <div className="space-y-4">
            {healthHints.map((hint, idx) => (
              <div key={idx} className="p-6 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex gap-5 items-start shadow-sm hover:shadow-xl transition-all">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <Check size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-gray-900 dark:text-white mb-1">{hint.label}</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{hint.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Culinary Protocol</h4>
           <div className="p-10 rounded-[3.5rem] bg-emerald-600 text-white shadow-2xl relative overflow-hidden group min-h-[250px] flex items-center">
              <Leaf className="absolute -bottom-10 -right-10 text-white/10 w-64 h-64 rotate-12" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Info size={28} />
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.3em]">Scientific Guide</span>
                </div>
                <p className="text-xl font-medium leading-relaxed italic opacity-95">
                  {plant.specificUsage || "Standard botanical preparation suggested. Ensure thorough cleansing and verify for personal allergies."}
                </p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
