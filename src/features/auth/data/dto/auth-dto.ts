import type { AuthErrorCode } from "../../domain/errors/auth-errors";

/**
 * Serializable result envelope for auth server operations. Success carries
 * minimal safe data; failure carries a stable machine code, a user-safe
 * message, and optional per-field messages. Never contains passwords,
 * tokens, hashes, or provider internals.
 */
export type AuthActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: AuthErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

export type SafeOrganization = {
  id: string;
  name: string;
  slug: string;
  role: string;
  onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
};

export type AuthState =
  | { status: "unauthenticated" }
  | { status: "unverified"; user: SafeUser }
  | {
      status: "authenticated";
      user: SafeUser;
      organization: SafeOrganization | null;
    };

export type RegistrationResult = {
  organizationEmail: string;
  organizationName: string;
  slug: string;
  otpDelivery: "sent" | "failed";
};
