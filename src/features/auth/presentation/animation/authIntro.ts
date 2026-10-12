import type { Transition, Variants } from "motion/react";

/**
 * Auth intro sequence timing.
 *
 * CENTERED BRANDING → 2s PAUSE → BRANDING MOVES LEFT + LOGIN FORM ENTERS RIGHT.
 * Restrained ease-out curves only: no springs, bounce, or elastic effects.
 */
export const AUTH_INTRO_PAUSE_MS = 2000;

const restrainedEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const brandEntranceVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const brandEntranceTransition: Transition = {
  duration: 0.7,
  ease: restrainedEase,
};

export const brandRelocateTransition: Transition = {
  duration: 0.85,
  ease: restrainedEase,
};

export const loginFormVariants: Variants = {
  hidden: { opacity: 0, x: 56 },
  visible: { opacity: 1, x: 0 },
};

export const loginFormTransition: Transition = {
  duration: 0.7,
  delay: 0.15,
  ease: restrainedEase,
};

export const noMotionTransition: Transition = { duration: 0 };
