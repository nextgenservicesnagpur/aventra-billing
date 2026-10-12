"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotionPreference } from "@/shared/animation/useReducedMotionPreference";
import { headerContainerVariants, headerItemVariants } from "../animation/headerReveal";

export const DashboardHeaderReveal = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const reducedMotion = useReducedMotionPreference();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={headerContainerVariants}
    >
      {children}
    </motion.div>
  );
};

export const DashboardHeaderRevealItem = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const reducedMotion = useReducedMotionPreference();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={headerItemVariants}>
      {children}
    </motion.div>
  );
};
