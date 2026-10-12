import type { Transition, Variants } from "motion/react";

/**
 * Login ↔ forgot-password toggle definitions.
 *
 * Separate from the intro sequence (authIntro.ts): this interaction lives
 * entirely inside the settled right-side form panel. Restrained
 * opacity + small horizontal translation only.
 */
const formToggleEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const loginFormToggleVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export const forgotFormToggleVariants: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

export const authFormToggleTransition: Transition = {
  duration: 0.35,
  ease: formToggleEase,
};

export const authFormToggleInstantTransition: Transition = { duration: 0 };
