export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED"
  | "EMAIL_ALREADY_IN_USE"
  | "ORGANIZATION_CREATION_FAILED"
  | "INVALID_OTP"
  | "OTP_EXPIRED"
  | "OTP_RATE_LIMITED"
  | "EMAIL_DELIVERY_FAILED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_FAILED"
  | "AUTH_ERROR";

/**
 * Base application error for the auth feature. Carries a stable machine
 * code plus a user-safe message. Provider internals (Prisma, Better Auth,
 * Resend) are attached as `cause` for server-side context only and must
 * never be rendered.
 */
export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = new.target.name;
    this.code = code;
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(cause?: unknown) {
    super(
      "INVALID_CREDENTIALS",
      "Your email or password is incorrect.",
      cause,
    );
  }
}

export class EmailNotVerifiedError extends AuthError {
  constructor(cause?: unknown) {
    super(
      "EMAIL_NOT_VERIFIED",
      "Please verify your email address to continue.",
      cause,
    );
  }
}

export class EmailAlreadyInUseError extends AuthError {
  constructor(cause?: unknown) {
    super(
      "EMAIL_ALREADY_IN_USE",
      "An account with this email already exists. Try signing in instead.",
      cause,
    );
  }
}

export class OrganizationCreationError extends AuthError {
  constructor(cause?: unknown) {
    super(
      "ORGANIZATION_CREATION_FAILED",
      "We couldn't create your organization. Please try again.",
      cause,
    );
  }
}

export class InvalidOtpError extends AuthError {
  constructor(cause?: unknown) {
    super("INVALID_OTP", "Your verification code is invalid.", cause);
  }
}

export class OtpExpiredError extends AuthError {
  constructor(cause?: unknown) {
    super(
      "OTP_EXPIRED",
      "Your verification code has expired. Please request a new code.",
      cause,
    );
  }
}

export class OtpRateLimitedError extends AuthError {
  constructor(cause?: unknown) {
    super(
      "OTP_RATE_LIMITED",
      "Too many verification attempts. Please request a new code.",
      cause,
    );
  }
}

export class EmailDeliveryError extends AuthError {
  constructor(cause?: unknown) {
    super(
      "EMAIL_DELIVERY_FAILED",
      "We couldn't send the email right now. Please try again.",
      cause,
    );
  }
}

export class UnauthorizedError extends AuthError {
  constructor(cause?: unknown) {
    super("UNAUTHORIZED", "Please sign in to continue.", cause);
  }
}

export class ForbiddenError extends AuthError {
  constructor(cause?: unknown) {
    super(
      "FORBIDDEN",
      "You don't have permission to perform this action.",
      cause,
    );
  }
}

export class ValidationError extends AuthError {
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
