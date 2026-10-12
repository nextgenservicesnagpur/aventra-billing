import type { Transition, Variants } from "motion/react";

/**
 * User menu surface motion. Small vertical fade only — no springs, no
 * large transforms — with a zero-duration transition for reduced motion
 * so the panel appears without movement.
 */
const menuEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const userMenuVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export const userMenuTransition: Transition = {
  duration: 0.15,
  ease: menuEase,
};

export const userMenuReducedTransition: Transition = { duration: 0 };
