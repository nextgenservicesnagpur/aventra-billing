import type { Transition, Variants } from "motion/react";
import {
  AUTH_INTRO_PAUSE_MS,
  brandEntranceVariants,
} from "./authIntro";
import { brandingExitTransition } from "./welcomeTransition";

/**
 * Root entry splash tokens for `/` with an active session.
 *
 * The entrance reuses the approved auth intro branding entrance (same
 * restraint, same curve, same 0.7s duration), the exit rides the approved
 * branding fade physics, and the pause shares the intentional 2s beat the
 * auth intro uses. The sequence controller mirrors these durations, which
 * the root entry tests lock together so they cannot drift apart.
 */
export const ROOT_ENTRY_PAUSE_MS = AUTH_INTRO_PAUSE_MS;

export const ROOT_ENTRY_ENTER_MS = 700;

export const ROOT_ENTRY_EXIT_MS = 500;

export const rootEntryVariants: Variants = {
  ...brandEntranceVariants,
  exit: { opacity: 0, y: -8 },
};

export const rootEntryExitTransition: Transition = brandingExitTransition;
