import type { Transition, Variants } from "motion/react";

/**
 * Step transition definitions for the auth registration sequence
 * (create-organization → verify-otp → welcome).
 *
 * Separate from the intro sequence (authIntro.ts) and the login/forgot
 * toggle (authFormTransition.ts): those approved animations stay
 * byte-identical. This interaction lives entirely inside the settled
 * right-side content panel. Restrained opacity + small horizontal
 * translation only.
 */
const authStepEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const authStepVariants: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

export const authStepTransition: Transition = {
  duration: 0.35,
  ease: authStepEase,
};

export const authStepInstantTransition: Transition = { duration: 0 };
