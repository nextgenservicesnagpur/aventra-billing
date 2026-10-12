import type { Transition, Variants } from "motion/react";

const onboardingEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const onboardingEntranceVariants: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
};
export const onboardingEntranceTransition: Transition = { duration: 0.45, ease: onboardingEase };
export const onboardingExitTransition: Transition = { duration: 0.25, ease: onboardingEase };
export const welcomeCompletionTransition: Transition = { duration: 0.55, ease: onboardingEase };
export const onboardingStepVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};
export const onboardingStepTransition: Transition = { duration: 0.18, ease: onboardingEase };
export const onboardingInstantTransition: Transition = { duration: 0 };
