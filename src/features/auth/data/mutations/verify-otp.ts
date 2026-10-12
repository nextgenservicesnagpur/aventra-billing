"use server";

import { auth } from "../../infrastructure/auth/auth";
import {
  parseAuthInput,
  resendOtpSchema,
  verifyOtpSchema,
  withNormalizedEmail,
} from "../validators/auth-schemas";
import { runAuthAction } from "./auth-action";

export type OtpResult = {
  email: string;
};

/**
 * Verifies a 6-digit email OTP. Succeeds only when Better Auth confirms
 * the code; attempt limits and expiry are enforced server-side by the
 * plugin, never by counting in the client.
 */
export const verifyEmailOtp = async (rawInput: unknown) =>
  runAuthAction(async (): Promise<OtpResult> => {
    const input = parseAuthInput(
      verifyOtpSchema,
      withNormalizedEmail(rawInput, "email"),
    );

    await auth.api.verifyEmailOTP({
      body: { email: input.email, otp: input.code },
    });

    return { email: input.email };
  });

/**
 * Requests a fresh verification OTP. Server-side rate limits apply;
 * the UI cooldown is presentation state only.
 */
export const resendEmailOtp = async (rawInput: unknown) =>
  runAuthAction(async (): Promise<OtpResult> => {
    const input = parseAuthInput(
      resendOtpSchema,
      withNormalizedEmail(rawInput, "email"),
    );

    await auth.api.sendVerificationOTP({
      body: { email: input.email, type: "email-verification" },
    });

    return { email: input.email };
  });
