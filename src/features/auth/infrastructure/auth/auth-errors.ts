import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { isAPIError } from "better-auth/api";
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

const readApiErrorCode = (error: unknown): string | null => {
  if (!isAPIError(error)) {
    return null;
  }
  const body: unknown = error.body;
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const code: unknown = (body as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
};

const readPrismaTarget = (error: unknown): string => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return "";
  }
  const target: unknown = error.meta?.target;
  if (typeof target === "string") {
    return target;
  }
  if (Array.isArray(target)) {
    return target.filter((part) => typeof part === "string").join(",");
  }
  return "";
};

const mapApiCode = (code: string, cause: unknown): AuthError | null => {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      return new InvalidCredentialsError(cause);
    case "EMAIL_NOT_VERIFIED":
      return new EmailNotVerifiedError(cause);
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return new EmailAlreadyInUseError(cause);
    case "INVALID_OTP":
      return new InvalidOtpError(cause);
    case "OTP_EXPIRED":
      return new OtpExpiredError(cause);
    case "TOO_MANY_ATTEMPTS":
      return new OtpRateLimitedError(cause);
    default:
      return null;
  }
};

const readApiStatusCode = (error: unknown): number | null => {
  if (!isAPIError(error)) {
    return null;
  }
  return typeof error.statusCode === "number" ? error.statusCode : null;
};

/**
 * Maps provider/infrastructure failures to typed application errors with
 * user-safe messages. Unknown failures become a generic error; provider
 * details travel only as `cause` for server-side context and are never
 * rendered.
 */
export const mapAuthError = (error: unknown): AuthError => {
  if (error instanceof AuthError) {
    return error;
  }
  const apiCode = readApiErrorCode(error);
  if (apiCode !== null) {
    const mapped = mapApiCode(apiCode, error);
    if (mapped !== null) {
      return mapped;
    }
  }
  const apiStatus = readApiStatusCode(error);
  if (apiStatus === 401) {
    return new UnauthorizedError(error);
  }
  if (apiStatus === 403) {
    return new ForbiddenError(error);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = readPrismaTarget(error);
      if (target.includes("email")) {
        return new EmailAlreadyInUseError(error);
      }
      return new OrganizationCreationError(error);
    }
    if (error.code === "P2025") {
      return new UnauthorizedError(error);
    }
    return new AuthError(
      "AUTH_ERROR",
      "Something went wrong. Please try again.",
      error,
    );
  }
  return new AuthError(
    "AUTH_ERROR",
    "Something went wrong. Please try again.",
    error,
  );
};
