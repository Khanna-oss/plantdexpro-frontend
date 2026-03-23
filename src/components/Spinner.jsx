import React from 'react';
import { Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MILESTONES = [
  'Extracting botanical features...',
  'Verifying species profile...',
  'Enriching with research data...',
];

export const Spinner = ({ message }) => {
  const activePhase = MILESTONES.indexOf(message);
  const phase = activePhase === -1 ? 0 : activePhase;

  return (
    <div className="soil-shell flex flex-col items-center justify-center gap-5 px-10 py-8 text-center max-w-sm mx-auto relative overflow-hidden">
      <div className="texture-overlay" />

      {/* Orbital leaf icon */}
      <div className="relative z-10 w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--golden-soil)]/15 animate-ping" style={{ animationDuration: '2s' }} />
        <div
          className="absolute inset-1 rounded-full border border-[var(--golden-soil)]/35 animate-spin"
          style={{ animationDuration: '2.8s', borderTopColor: 'var(--golden-soil)' }}
        />
        <Leaf size={22} className="text-[var(--golden-soil)] relative z-10" />
      </div>

      {/* Milestone message */}
      <div className="relative z-10 min-h-[2.5rem] flex flex-col items-center gap-1.5">
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-semibold text-[var(--cream)] leading-relaxed"
          >
            {message || MILESTONES[0]}
          </motion.p>
        </AnimatePresence>

        {/* Milestone progress dots */}
        <div className="flex items-center gap-2 mt-1">
          {MILESTONES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === phase ? [1, 1.3, 1] : 1,
                opacity: i <= phase ? 1 : 0.25,
              }}
              transition={{ duration: 0.6, repeat: i === phase ? Infinity : 0, repeatDelay: 0.8 }}
              className="rounded-full"
              style={{
                width: i === phase ? 7 : 5,
                height: i === phase ? 7 : 5,
                background: i <= phase ? 'var(--golden-soil)' : 'rgba(245,245,220,0.2)',
                transition: 'width 0.3s, height 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      <p className="relative z-10 text-[8px] font-black uppercase tracking-[0.35em] text-[var(--golden-soil)]/40">
        Save Soil Research Engine
      </p>
    </div>
  );
};