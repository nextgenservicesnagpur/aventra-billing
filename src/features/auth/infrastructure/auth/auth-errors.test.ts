import { APIError } from "better-auth/api";
import { Prisma } from "@/generated/prisma/client";
import { describe, expect, it } from "vitest";
import {
  AuthError,
  EmailAlreadyInUseError,
  EmailNotVerifiedError,
  ForbiddenError,
  InvalidCredentialsError,
  InvalidOtpError,
  OrganizationCreationError,
  OtpExpiredError,
  OtpRateLimitedError,
  UnauthorizedError,
} from "../../domain/errors/auth-errors";
import { mapAuthError } from "./auth-errors";

const apiError = (code: string) =>
  APIError.from("BAD_REQUEST", { code, message: "provider internals" });

describe("mapAuthError", () => {
  it("passes domain errors through untouched", () => {
    const original = new InvalidOtpError();
    expect(mapAuthError(original)).toBe(original);
  });

  it("maps credential, verification, and OTP codes", () => {
    expect(mapAuthError(apiError("INVALID_EMAIL_OR_PASSWORD"))).toBeInstanceOf(
      InvalidCredentialsError,
    );
    expect(mapAuthError(apiError("EMAIL_NOT_VERIFIED"))).toBeInstanceOf(
      EmailNotVerifiedError,
    );
    expect(
      mapAuthError(apiError("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL")),
    ).toBeInstanceOf(EmailAlreadyInUseError);
    expect(mapAuthError(apiError("INVALID_OTP"))).toBeInstanceOf(
      InvalidOtpError,
    );
    expect(mapAuthError(apiError("OTP_EXPIRED"))).toBeInstanceOf(
      OtpExpiredError,
    );
    expect(mapAuthError(apiError("TOO_MANY_ATTEMPTS"))).toBeInstanceOf(
      OtpRateLimitedError,
    );
  });

  it("falls back to status codes for unknown provider codes", () => {
    const unauthorized = APIError.from("UNAUTHORIZED", {
      code: "SOME_UNKNOWN_CODE",
      message: "provider internals",
    });
    expect(mapAuthError(unauthorized)).toBeInstanceOf(UnauthorizedError);
    const forbidden = APIError.from("FORBIDDEN", {
      code: "SOME_UNKNOWN_CODE",
      message: "provider internals",
    });
    expect(mapAuthError(forbidden)).toBeInstanceOf(ForbiddenError);
  });

  it("maps unique-constraint races by field", () => {
    const emailConflict = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "test", meta: { target: ["User_email"] } },
    );
    expect(mapAuthError(emailConflict)).toBeInstanceOf(EmailAlreadyInUseError);
    const slugConflict = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["Organization_slug"] },
      },
    );
    expect(mapAuthError(slugConflict)).toBeInstanceOf(
      OrganizationCreationError,
    );
  });

  it("converts unknown failures to a generic safe error", () => {
    const mapped = mapAuthError(new Error("sql: relation does not exist"));
    expect(mapped).toBeInstanceOf(AuthError);
    expect(mapped.code).toBe("AUTH_ERROR");
    expect(mapped.message).toBe("Something went wrong. Please try again.");
    expect(mapped.message).not.toContain("sql");
  });
});
