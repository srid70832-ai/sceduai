import { useEffect, useState } from 'react';

// Reusable motion transition presets
export const transitions = {
  smooth: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  spring: { type: 'spring', stiffness: 350, damping: 25 },
  fast: { duration: 0.2, ease: 'easeOut' },
  gentle: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

// Reusable Framer Motion Variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.smooth,
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

export const fadeDown = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
};

export const staggerContainer = (staggerTime = 0.06, delayChildren = 0.02) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerTime,
      delayChildren: delayChildren,
    },
  },
});

export const cardHover = {
  rest: { y: 0 },
  hover: {
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

/**
 * Custom Hook: useCountUp
 * Smoothly animates a real numerical value from 0 to target
 */
export function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // If target is 0 or NaN, set to target immediately
    if (!target || isNaN(target)) {
      setCount(target || 0);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * target;

      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, duration]);

  return count;
}
