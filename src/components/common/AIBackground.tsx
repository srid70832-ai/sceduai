import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, Cpu, Orbit } from 'lucide-react';

export const AIBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Soft Ambient Radial Orbs with GPU Transforms */}
      <motion.div
        animate={{
          x: [0, 25, -20, 0],
          y: [0, -25, 15, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 left-1/4 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-blue-500/8 to-sky-400/5 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 25, -15, 0],
          scale: [1, 0.92, 1.06, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 -right-28 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-purple-500/8 via-indigo-500/6 to-sky-400/4 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -20, 20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-10 left-10 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-emerald-500/6 via-teal-500/5 to-indigo-500/4 blur-3xl"
      />

      {/* Subtle Floating AI Nodes with very slow micro-drift */}
      <motion.div
        animate={{
          y: [0, -14, 0],
          rotate: [0, 6, 0],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-24 right-[15%] hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/40 dark:border-indigo-800/30 text-indigo-400/60 shadow-xs backdrop-blur-xs"
      >
        <Sparkles className="w-4 h-4" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 16, 0],
          rotate: [0, -8, 0],
          opacity: [0.25, 0.55, 0.25],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[48%] left-[8%] hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/40 dark:border-sky-800/30 text-sky-400/60 shadow-xs backdrop-blur-xs"
      >
        <Brain className="w-4 h-4" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 12, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-36 right-[10%] hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/40 dark:border-purple-800/30 text-purple-400/60 shadow-xs backdrop-blur-xs"
      >
        <Cpu className="w-3.5 h-3.5" />
      </motion.div>
    </div>
  );
};
