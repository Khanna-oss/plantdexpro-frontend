
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react';

export const ConfidenceBar = ({ score, label = "AI Accuracy" }) => {
  const isLow = score < 60;
  const isMedium = score >= 60 && score < 85;
  
  let colorClass = "bg-emerald-500";
  let textColor = "text-emerald-600 dark:text-emerald-400";
  let borderClass = "border-emerald-100 dark:border-emerald-900/30";
  let Icon = ShieldCheck;

  if (isLow) {
    colorClass = "bg-rose-500";
    textColor = "text-rose-600 dark:text-rose-400";
    borderClass = "border-rose-100 dark:border-rose-900/30";
    Icon = AlertTriangle;
  } else if (isMedium) {
    colorClass = "bg-amber-500";
    textColor = "text-amber-600 dark:text-amber-400";
    borderClass = "border-amber-100 dark:border-amber-900/30";
    Icon = Info;
  }

  return (
    <div className={`p-4 rounded-2xl border ${borderClass} bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm shadow-sm`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${textColor}`}>
          <Icon size={14} /> {label}
        </span>
        <span className={`text-sm font-black ${textColor}`}>{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colorClass} rounded-full`}
        />
      </div>
    </div>
  );
};
