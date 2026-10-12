"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { AUTH_INTRO_PAUSE_MS } from "../animation/authIntro";

export type AuthIntroPhase = "center" | "split";

/**
 * Orchestrates the auth intro sequence: centered branding, an intentional
 * pause, then the settled two-column layout. Reduced-motion users settle
 * immediately with no cinematic wait.
 */
export const useAuthIntroPhase = (): AuthIntroPhase => {
  const shouldReduceMotion = useReducedMotion();
  const [pauseElapsed, setPauseElapsed] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }
    const timer = window.setTimeout(() => {
      setPauseElapsed(true);
    }, AUTH_INTRO_PAUSE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion || pauseElapsed) {
    return "split";
  }
  return "center";
};
