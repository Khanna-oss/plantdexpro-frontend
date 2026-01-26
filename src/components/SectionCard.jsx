import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const SectionCard = ({ title, icon: Icon, children, preview, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-6 rounded-[1.2rem] transition-all duration-300 border ${
          isOpen 
            ? 'bg-white dark:bg-gray-800 border-[#8b5a2b]/30 shadow-xl' 
            : 'bg-[#fffcf7]/50 dark:bg-[#251e18]/50 border-transparent hover:bg-white dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isOpen ? 'bg-[#4a3728] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            }`}>
              <Icon size={20} />
            </div>
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                isOpen ? 'text-[#8b5a2b]' : 'text-gray-500'
              }`}>
                {title}
              </h4>
              {!isOpen && preview && (
                <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                  {preview}
                </p>
              )}
            </div>
          </div>
          <motion.div 
            animate={{ rotate: isOpen ? 180 : 0 }}
            className={`p-1.5 rounded-lg ${isOpen ? 'bg-[#f4f1ea] dark:bg-gray-700' : 'bg-transparent'}`}
          >
            <ChevronDown size={16} className={isOpen ? 'text-[#8b5a2b]' : 'text-gray-300'} />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700 mt-5">
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium space-y-3">
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};