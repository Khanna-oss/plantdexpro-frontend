import React from 'react';
import { Heart, Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const HealthBenefits = ({ plant }) => {
  if (!plant.isEdible) return null;

  const nutrients = plant.nutrients || {
    vitamins: "A, C, K",
    minerals: "Iron, Calcium, Potassium",
    proteins: "Low to Moderate"
  };
  
  const healthHints = plant.healthHints || [
    { label: "Digestive Health", desc: "Contains dietary fiber which may aid digestion." }
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-[#1f2937]/50 dark:bg-[#111827]/50 rounded-2xl p-6 border border-emerald-500/10">
        <div className="flex items-center gap-3 mb-6">
          <Heart size={18} className="text-emerald-400" />
          <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">
            Health & Nutrition Profile
          </h3>
        </div>

        <div className="space-y-4">
          {/* Vitamins Card */}
          <div className="bg-[#1f2937] dark:bg-[#1f2937] rounded-xl p-5 border border-white/5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Vitamins</span>
            <p className="text-lg font-bold text-white">{nutrients.vitamins}</p>
          </div>

          {/* Minerals Card */}
          <div className="bg-[#1f2937] dark:bg-[#1f2937] rounded-xl p-5 border border-white/5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Minerals</span>
            <p className="text-lg font-bold text-white">{nutrients.minerals}</p>
          </div>

          {/* Proteins Card */}
          <div className="bg-[#1f2937] dark:bg-[#1f2937] rounded-xl p-5 border border-white/5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Proteins</span>
            <p className="text-lg font-bold text-white">{nutrients.proteins}</p>
          </div>
        </div>

        {/* Potential Benefits */}
        <div className="mt-8">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Potential Benefits</h4>
          <div className="space-y-4">
            {healthHints.map((hint, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {hint.label}
                    </h5>
                    <ExternalLink size={12} className="text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mt-1">
                    {hint.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};