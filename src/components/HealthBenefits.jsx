import React from 'react';
import { HeartPulse, Check, Leaf, AlertCircle } from 'lucide-react';

export const HealthBenefits = ({ plant }) => {
  if (!plant.isEdible) return null;

  // Check if specific data exists
  const hasNutrients = plant.nutrients && (plant.nutrients.vitamins || plant.nutrients.minerals);
  const hasHints = plant.healthHints && plant.healthHints.length > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-900/30 shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
        <HeartPulse className="text-emerald-600 dark:text-emerald-400" size={20} />
        <h3 className="font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide text-sm">
          Health & Nutrition Profile
        </h3>
      </div>

      <div className="p-6">
        {/* Nutrients Grid */}
        {hasNutrients ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Vitamins</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{plant.nutrients.vitamins || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Minerals</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{plant.nutrients.minerals || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Proteins</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{plant.nutrients.proteins || 'N/A'}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 px-4 mb-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
             <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">
               Specific nutritional profile not available for this plant.
             </p>
          </div>
        )}

        {/* Suggestions */}
        <div className="space-y-3 mb-6">
           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Potential Benefits</h4>
           
           {hasHints ? (
             plant.healthHints.map((item, idx) => (
               <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                     <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.label}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
               </div>
             ))
           ) : (
             <div className="flex items-start gap-3">
               <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <AlertCircle size={12} className="text-blue-600 dark:text-blue-400" />
               </div>
               <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                 No specific health benefits listed. Consult a professional.
               </p>
             </div>
           )}
        </div>

        {/* Usage Tip */}
        <div className="flex gap-3 items-start bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <Leaf className="text-blue-500 shrink-0 mt-0.5" size={16} />
            <div>
                <h4 className="font-bold text-blue-800 dark:text-blue-200 text-xs uppercase tracking-wide mb-1">How to Use</h4>
                <p className="text-blue-900 dark:text-blue-100 text-xs">
                  For edible varieties, ensure thorough washing. Can often be used in salads, teas, or garnishes. Consult a local expert before consuming.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};