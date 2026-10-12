import { describe, expect, it } from "vitest";
import {
  ForbiddenError,
  ValidationError,
} from "../../domain/errors/onboarding-errors";
import { runOnboardingAction } from "./onboarding-action";

describe("runOnboardingAction envelope", () => {
  it("wraps successful operations as ok results", async () => {
    const result = await runOnboardingAction(async () => "saved");
    expect(result).toEqual({ ok: true, data: "saved" });
  });

  it("passes domain errors through with safe messages and codes", async () => {
    const result = await runOnboardingAction(async () => {
      throw new ForbiddenError();
    });
    expect(result).toEqual({
      ok: false,
      code: "FORBIDDEN",
      message: "You don't have permission to manage this organization.",
    });
  });

  it("carries per-field messages from validation failures", async () => {
    const result = await runOnboardingAction(async () => {
      throw new ValidationError("Please review the highlighted fields and try again.", {
        city: ["City is required."],
      });
    });
    expect(result).toMatchObject({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { city: ["City is required."] },
    });
  });

  it("never leaks unexpected provider errors to the caller", async () => {
    const result = await runOnboardingAction(async () => {
      throw new Error("password authentication failed for user postgres");
    });
    expect(result).toEqual({
      ok: false,
      code: "ONBOARDING_ERROR",
      message:
        "Something went wrong while saving your onboarding details. Please try again.",
    });
    if (!result.ok) {
      expect(JSON.stringify(result)).not.toContain("postgres");
    }
  });
});
