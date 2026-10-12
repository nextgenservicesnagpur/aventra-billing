import { describe, expect, it } from "vitest";
import {
  canAccessStep,
  firstIncompleteStep,
  isOnboardingComplete,
  resumeStep,
  type OnboardingProgress,
} from "./onboarding-completion";

const none: OnboardingProgress = {
  organization: false,
  address: false,
  tax: false,
  subscription: false,
};

const partial: OnboardingProgress = {
  organization: true,
  address: true,
  tax: false,
  subscription: false,
};

const all: OnboardingProgress = {
  organization: true,
  address: true,
  tax: true,
  subscription: true,
};

describe("onboarding completion rules", () => {
  it("requires every section for completion", () => {
    expect(isOnboardingComplete(none)).toBe(false);
    expect(isOnboardingComplete(partial)).toBe(false);
    expect(isOnboardingComplete(all)).toBe(true);
  });

  it("resolves the first incomplete step for resume and gating", () => {
    expect(firstIncompleteStep(none)).toBe(0);
    expect(firstIncompleteStep(partial)).toBe(2);
    expect(firstIncompleteStep(all)).toBe(4);
  });

  it("always allows the first step and completed prefixes", () => {
    expect(canAccessStep(none, 0)).toBe(true);
    expect(canAccessStep(partial, 0)).toBe(true);
    expect(canAccessStep(partial, 1)).toBe(true);
    expect(canAccessStep(partial, 2)).toBe(true);
  });

  it("blocks skipping ahead and out-of-range steps", () => {
    expect(canAccessStep(none, 1)).toBe(false);
    expect(canAccessStep(none, 3)).toBe(false);
    expect(canAccessStep(partial, 3)).toBe(false);
    expect(canAccessStep(all, 4)).toBe(false);
    expect(canAccessStep(all, -1)).toBe(false);
  });

  it("resumes at the first incomplete step and never past the last step", () => {
    expect(resumeStep(none)).toBe(0);
    expect(resumeStep(partial)).toBe(2);
    expect(resumeStep(all)).toBe(3);
  });
});
