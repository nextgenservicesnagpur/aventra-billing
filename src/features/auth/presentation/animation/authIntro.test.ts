import { describe, expect, it } from "vitest";
import {
  AUTH_INTRO_PAUSE_MS,
  brandEntranceTransition,
  brandEntranceVariants,
  brandRelocateTransition,
  loginFormTransition,
  loginFormVariants,
  noMotionTransition,
} from "./authIntro";

/**
 * Regression lock for the approved auth intro (centered branding → pause →
 * split layout). Timing, easing, and positioning must stay identical.
 */
describe("approved auth intro transition", () => {
  it("keeps the intentional pause and restrained entrance physics", () => {
    expect(AUTH_INTRO_PAUSE_MS).toBe(2000);
    expect(brandEntranceVariants).toEqual({
      hidden: { opacity: 0, scale: 0.96 },
      visible: { opacity: 1, scale: 1 },
    });
    expect(brandEntranceTransition).toEqual({
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    });
  });

  it("keeps the branding relocation and login form choreography unchanged", () => {
    expect(brandRelocateTransition).toEqual({
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    });
    expect(loginFormVariants).toEqual({
      hidden: { opacity: 0, x: 56 },
      visible: { opacity: 1, x: 0 },
    });
    expect(loginFormTransition).toEqual({
      duration: 0.7,
      delay: 0.15,
      ease: [0.22, 1, 0.36, 1],
    });
    expect(noMotionTransition).toEqual({ duration: 0 });
  });
});
