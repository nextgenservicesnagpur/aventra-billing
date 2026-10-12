"use client";

import { motion } from "motion/react";
import { useReducedMotionPreference } from "@/shared/animation/useReducedMotionPreference";
import {
  brandEntranceTransition,
  noMotionTransition,
} from "../animation/authIntro";
import {
  rootEntryExitTransition,
  rootEntryVariants,
} from "../animation/rootEntry";
import { AuthBranding } from "../components/AuthBranding";
import { useRootEntrySequence } from "../hooks/useRootEntrySequence";
import type { RootEntryDestination } from "../view-models/rootEntry";

export type RootEntryTransitionProps = {
  destination: RootEntryDestination;
};

/**
 * Root entry splash for `/` with an active session.
 *
 * Centered Aventra branding only: it enters with the approved auth intro
 * entrance, holds for the intentional pause, lifts away with the approved
 * branding fade, and the sequence hook then replaces the route with a
 * single programmatic navigation. Reduced motion keeps the branding stable
 * and the routing beat identical while skipping decorative movement. No
 * Welcome UI, cards, spinners, or extra text ever renders here.
 */
export const RootEntryTransition = ({
  destination,
}: RootEntryTransitionProps) => {
  const phase = useRootEntrySequence(destination);
  const shouldReduceMotion = useReducedMotionPreference();
  const exiting = phase === "exit" || phase === "done";

  const animate = exiting && !shouldReduceMotion ? "exit" : "visible";
  const transition = shouldReduceMotion
    ? noMotionTransition
    : exiting
      ? rootEntryExitTransition
      : brandEntranceTransition;

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center overflow-x-clip bg-background px-6 text-foreground">
      <motion.div
        variants={rootEntryVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate={animate}
        transition={transition}
        className="flex flex-col items-center text-center"
      >
        <AuthBranding />
      </motion.div>
    </main>
  );
};
