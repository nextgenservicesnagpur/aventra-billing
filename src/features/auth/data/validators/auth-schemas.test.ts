import { describe, expect, it } from "vitest";
import { ValidationError } from "../../domain/errors/auth-errors";
import {
  createOrganizationSchema,
  forgotPasswordRequestSchema,
  loginSchema,
  parseAuthInput,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  withNormalizedEmail,
} from "./auth-schemas";

describe("createOrganizationSchema", () => {
  it("accepts a complete valid payload", () => {
    const result = createOrganizationSchema.safeParse({
      adminName: "John Doe",
      organizationName: "Acme Corporation",
      organizationEmail: "owner@acme.test",
      password: "s3cure-passphrase",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields with per-field messages", () => {
    expect(() => parseAuthInput(createOrganizationSchema, {})).toThrowError(
      ValidationError,
    );
    try {
      parseAuthInput(createOrganizationSchema, {});
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const fieldErrors = (error as ValidationError).fieldErrors;
      expect(Object.keys(fieldErrors).sort()).toEqual([
        "adminName",
        "organizationEmail",
        "organizationName",
        "password",
      ]);
    }
  });

  it("rejects malformed emails and short passwords", () => {
    const result = createOrganizationSchema.safeParse({
      adminName: "John Doe",
      organizationName: "Acme",
      organizationEmail: "not-an-email",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts email, password, and remember-me flag", () => {
    const result = loginSchema.safeParse({
      email: "user@acme.test",
      password: "anything-at-least-present",
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password without inventing policy", () => {
    const result = loginSchema.safeParse({
      email: "user@acme.test",
      password: "",
      rememberMe: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("otp contracts", () => {
  it("accepts exactly six digits", () => {
    expect(
      verifyOtpSchema.safeParse({ email: "user@acme.test", code: "123456" })
        .success,
    ).toBe(true);
  });

  it("rejects short, long, non-numeric, and empty codes", () => {
    for (const code of ["12345", "1234567", "12a456", "", " 123456 "]) {
      expect(
        verifyOtpSchema.safeParse({ email: "user@acme.test", code }).success,
      ).toBe(false);
    }
  });

  it("validates resend, forgot-request, and reset payloads", () => {
    expect(
      resendOtpSchema.safeParse({ email: "user@acme.test" }).success,
    ).toBe(true);
    expect(
      forgotPasswordRequestSchema.safeParse({ email: "user@acme.test" })
        .success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({
        email: "user@acme.test",
        code: "123456",
        newPassword: "another-secure-passphrase",
      }).success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({
        email: "user@acme.test",
        code: "123456",
        newPassword: "short",
      }).success,
    ).toBe(false);
  });
});

describe("withNormalizedEmail", () => {
  it("trims and lowercases the email field before validation", () => {
    expect(
      withNormalizedEmail(
        { organizationEmail: "  Owner@Acme.TEST  " },
        "organizationEmail",
      ),
    ).toEqual({ organizationEmail: "owner@acme.test" });
  });

  it("passes non-object payloads through for Zod to reject", () => {
    expect(withNormalizedEmail(null, "organizationEmail")).toBeNull();
    expect(withNormalizedEmail("nope", "organizationEmail")).toBe("nope");
    expect(
      withNormalizedEmail({ organizationEmail: 42 }, "organizationEmail"),
    ).toEqual({ organizationEmail: 42 });
  });
});
