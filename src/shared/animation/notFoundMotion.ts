import type { Transition, Variants } from "motion/react";

export const notFoundContainerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const notFoundEntranceTransition: Transition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
};

export const notFoundInstantTransition: Transition = {
  duration: 0,
};
