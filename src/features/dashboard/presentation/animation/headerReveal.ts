import type { Transition, Variants } from "motion/react";

/**
 * Dashboard header initial reveal motion.
 * A very subtle vertical reveal designed to feel natural and premium.
 */
const revealEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const headerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05, // 50ms stagger
    },
  },
};

export const headerItemVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55, // 550ms
      ease: revealEase,
    },
  },
};

export const headerItemReducedTransition: Transition = { duration: 0 };
