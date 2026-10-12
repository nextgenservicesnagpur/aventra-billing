export type OnboardingErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_FAILED"
  | "ORGANIZATION_NOT_FOUND"
  | "ONBOARDING_NOT_COMPLETABLE"
  | "ONBOARDING_ERROR";

/**
 * Base application error for the onboarding feature. Carries a stable
 * machine code plus a user-safe message. Provider internals (Prisma,
 * Better Auth) are attached as `cause` for server-side context only and
 * must never be rendered.
 */
export class OnboardingError extends Error {
  readonly code: OnboardingErrorCode;

  constructor(code: OnboardingErrorCode, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = new.target.name;
    this.code = code;
  }
}

export class UnauthorizedError extends OnboardingError {
  constructor(cause?: unknown) {
    super("UNAUTHORIZED", "Please sign in to continue.", cause);
  }
}

export class ForbiddenError extends OnboardingError {
  constructor(cause?: unknown) {
    super(
      "FORBIDDEN",
      "You don't have permission to manage this organization.",
      cause,
    );
  }
}

export class OrganizationNotFoundError extends OnboardingError {
  constructor(cause?: unknown) {
    super(
      "ORGANIZATION_NOT_FOUND",
      "We couldn't find your organization. Please try signing in again.",
      cause,
    );
  }
}

export class OnboardingNotCompletableError extends OnboardingError {
  constructor(cause?: unknown) {
    super(
      "ONBOARDING_NOT_COMPLETABLE",
      "Please complete all onboarding steps before finishing setup.",
      cause,
    );
  }
}

export class ValidationError extends OnboardingError {
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    message = "Please review the highlighted fields and try again.",
    fieldErrors: Record<string, string[]> = {},
    cause?: unknown,
  ) {
    super("VALIDATION_FAILED", message, cause);
    this.fieldErrors = fieldErrors;
  }
}
