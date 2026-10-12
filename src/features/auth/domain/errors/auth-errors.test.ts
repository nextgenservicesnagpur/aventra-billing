import { describe, expect, it } from "vitest";
import {
  AuthError,
  EmailNotVerifiedError,
  InvalidOtpError,
  ValidationError,
} from "./auth-errors";

describe("auth errors", () => {
  it("carry stable codes with user-safe messages", () => {
    const error = new InvalidOtpError();
    expect(error).toBeInstanceOf(AuthError);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("INVALID_OTP");
    expect(error.message).toBe("Your verification code is invalid.");
  });

  it("preserve provider causes without exposing them", () => {
    const cause = new Error("prisma internals");
    const error = new EmailNotVerifiedError(cause);
    expect(error.code).toBe("EMAIL_NOT_VERIFIED");
    expect(error.message).not.toContain("prisma");
  });

  it("validation errors carry per-field messages", () => {
    const error = new ValidationError("Fix this.", {
      email: ["Enter a valid email address."],
    });
    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.fieldErrors).toEqual({
      email: ["Enter a valid email address."],
    });
    expect(new ValidationError().fieldErrors).toEqual({});
  });
});
