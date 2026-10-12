import { describe, expect, it } from "vitest";
import {
  brandingExitTransition,
  brandingExitVariants,
  welcomeTranslateTransition,
  welcomeTranslateVariants,
} from "./welcomeTransition";

/**
 * Regression lock for the approved Welcome → Onboarding transition. The
 * branding fade and the Welcome section's travel distance, duration, and
 * easing must stay identical on both layouts.
 */
describe("approved welcome to onboarding transition", () => {
  it("keeps the branding fade physics unchanged", () => {
    expect(brandingExitVariants).toEqual({
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    });
    expect(brandingExitTransition).toEqual({
      duration: 0.5,
      ease: [0.33, 0, 0.2, 1],
    });
  });

  it("keeps the welcome section travel unchanged on desktop and mobile", () => {
    expect(welcomeTranslateTransition).toEqual({
      duration: 1.1,
      ease: [0.33, 0, 0.2, 1],
    });
    expect(welcomeTranslateVariants(true)).toEqual({
      visible: { x: 0, y: 0 },
      exit: { x: "-100%", y: 0 },
    });
    expect(welcomeTranslateVariants(false)).toEqual({
      visible: { x: 0, y: 0 },
      exit: { x: 0, y: "-80%" },
    });
  });
});
