import React from 'react';
import { motion } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  pageKey?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '', pageKey }) => {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`w-full overflow-x-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};
