import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const AICondensedSummary = ({ description }) => {
  if (!description) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#4a3728]/5 dark:bg-[#f4f1ea]/5 border-l-2 border-[#8b5a2b] p-5 rounded-r-2xl mb-8 relative overflow-hidden"
    >
      <h5 className="text-[9px] font-black text-[#8b5a2b] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        <Sparkles size={10} /> AI Synthesis
      </h5>
      <p className="text-sm font-medium text-[#4a3728] dark:text-[#f4f1ea] leading-snug">
        {description.length > 150 ? description.substring(0, 147) + "..." : description}
      </p>
    </motion.div>
  );
};