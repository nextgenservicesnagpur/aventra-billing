import { z } from "zod";
import { normalizeEmail } from "../../domain/value-objects/email-address";
import { ValidationError } from "../../domain/errors/auth-errors";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const OTP_CODE_LENGTH = 6;
export const MAX_NAME_LENGTH = 100;

/**
 * Trust-boundary input contracts. Every server operation validates its
 * input here first; TypeScript types alone are never trusted. Email values
 * must already be normalized (trim + lowercase) before validation.
 * NOTE: OTP_CODE_LENGTH intentionally mirrors the presentation slot count
 * as an independent server-side rule — the server never trusts the client.
 */
const emailSchema = z.email().min(5).max(320);

const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Enter the 6-digit verification code.");

export const createOrganizationSchema = z.object({
  adminName: z.string().trim().min(1, "Admin name is required.").max(100),
  organizationName: z
    .string()
    .trim()
    .min(1, "Organization name is required.")
    .max(100),
  organizationEmail: emailSchema,
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    )
    .max(PASSWORD_MAX_LENGTH),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean(),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});

export const resendOtpSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  newPassword: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    )
    .max(PASSWORD_MAX_LENGTH),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type ForgotPasswordRequestInput = z.infer<
  typeof forgotPasswordRequestSchema
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const isUnknownRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Normalizes a single email field on untrusted input before validation,
 * so every layer checks the same trimmed lowercase value. Non-object
 * payloads and non-string fields pass through for Zod to reject.
 */
export const withNormalizedEmail = (
  rawInput: unknown,
  field: string,
): unknown => {
  if (!isUnknownRecord(rawInput)) {
    return rawInput;
  }
  const current = rawInput[field];
  if (typeof current !== "string") {
    return rawInput;
  }
  return { ...rawInput, [field]: normalizeEmail(current) };
};

const toFieldErrors = (error: z.ZodError): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(
    error.flatten().fieldErrors,
  )) {
    if (Array.isArray(messages)) {
      fieldErrors[key] = messages;
    }
  }
  return fieldErrors;
};

/**
 * Validates untrusted input against a schema, throwing a domain
 * ValidationError (with per-field messages) instead of leaking Zod
 * internals to callers.
 */
export const parseAuthInput = <S extends z.ZodType>(
  schema: S,
  input: unknown,
): z.infer<S> => {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      "Please review the highlighted fields and try again.",
      toFieldErrors(parsed.error),
    );
  }
  return parsed.data;
};
