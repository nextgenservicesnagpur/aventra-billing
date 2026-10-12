import type { Transition, Variants } from "motion/react";

/**
 * Coordinated transition physics for the Welcome → Onboarding route transition.
 *
 * The Welcome section travels ~50vw (right column → left column), which is
 * double the distance the Aventra branding relocation covers (~25vw) during
 * the auth intro. To maintain the same perceived speed, the duration is
 * proportionally longer (1.1s vs 0.85s) and the easing curve distributes
 * motion evenly: a gentle start, steady mid-glide, and soft deceleration
 * into the resting position. No abrupt speed changes at any point.
 */
const welcomeEase: [number, number, number, number] = [0.33, 0, 0.2, 1];

export const brandingExitVariants: Variants = {
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const brandingExitTransition: Transition = {
  duration: 0.5,
  ease: welcomeEase,
};

export const welcomeTranslateVariants = (isDesktop: boolean): Variants => ({
  visible: { x: 0, y: 0 },
  exit: isDesktop ? { x: "-100%", y: 0 } : { x: 0, y: "-80%" },
});

export const welcomeTranslateTransition: Transition = {
  duration: 1.1,
  ease: welcomeEase,
};
