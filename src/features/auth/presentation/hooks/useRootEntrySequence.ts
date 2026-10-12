"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useReducedMotionPreference } from "@/shared/animation/useReducedMotionPreference";
import {
  runRootEntrySequence,
  type RootEntryPhase,
} from "../animation/rootEntrySequence";
import type { RootEntryDestination } from "../view-models/rootEntry";

/**
 * Runs the root entry splash once per mount and exposes the current phase
 * for the branding animation. The exit callback performs a single
 * programmatic `replace` to the destination: the controller guarantees one
 * navigation, and the effect cleanup cancels every pending timer on
 * unmount, so Strict Mode, re-renders, and fast refresh cannot double
 * navigate. Reduced motion keeps the intentional pause but skips
 * decorative movement.
 */
export const useRootEntrySequence = (
  destination: RootEntryDestination,
): RootEntryPhase => {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotionPreference();
  const [phase, setPhase] = useState<RootEntryPhase>("enter");

  useEffect(() => {
    const sequence = runRootEntrySequence({
      reducedMotion: shouldReduceMotion,
      onPhase: setPhase,
      onExit: () => {
        router.replace(destination);
      },
    });
    return () => {
      sequence.cancel();
    };
  }, [destination, router, shouldReduceMotion]);

  return phase;
};
