import type { Transition, Variants } from "motion/react";

export const collapseContentVariants: Variants = {
  expanded: { opacity: 1, height: "auto" },
  collapsed: { opacity: 0, height: 0 },
};

export const collapseContentTransition: Transition = {
  duration: 0.35,
  ease: "easeInOut",
};

export const collapseContentInstantTransition: Transition = { duration: 0 };
