import { describe, expect, it } from "vitest";
import {
  ForbiddenError,
  OnboardingError,
  OnboardingNotCompletableError,
  OrganizationNotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./onboarding-errors";

describe("onboarding errors", () => {
  it("carry stable codes with user-safe messages", () => {
    const error = new ForbiddenError();
    expect(error).toBeInstanceOf(OnboardingError);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toBe(
      "You don't have permission to manage this organization.",
    );
  });

  it("keeps provider causes off the user-facing message", () => {
    const cause = new Error("relation does not exist");
    const error = new OrganizationNotFoundError(cause);
    expect(error.code).toBe("ORGANIZATION_NOT_FOUND");
    expect(error.message).not.toContain("relation");
  });

  it("covers the completion and validation cases", () => {
    expect(new OnboardingNotCompletableError().code).toBe(
      "ONBOARDING_NOT_COMPLETABLE",
    );
    expect(new UnauthorizedError().code).toBe("UNAUTHORIZED");
    const validation = new ValidationError("Fix this.", {
      city: ["City is required."],
    });
    expect(validation.code).toBe("VALIDATION_FAILED");
    expect(validation.fieldErrors).toEqual({ city: ["City is required."] });
  });
});
