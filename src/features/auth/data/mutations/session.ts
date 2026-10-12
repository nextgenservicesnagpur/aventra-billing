"use server";

import { headers } from "next/headers";
import { auth } from "../../infrastructure/auth/auth";
import {
  findUserIdByEmail,
  listMembershipsByUserId,
} from "../queries/auth-lookups";
import {
  loginSchema,
  parseAuthInput,
  withNormalizedEmail,
} from "../validators/auth-schemas";
import { runAuthAction } from "./auth-action";
import type { AuthActionResult } from "../dto/auth-dto";

export type SignInResult = {
  email: string;
  organizationName: string | null;
  organizationRole: string | null;
  onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | null;
};

/**
 * Signs in with email and password through Better Auth. Session cookies
 * are applied by the Next.js cookie integration. Returns the primary
 * organization context so the UI can continue without a second round
 * trip. Unverified accounts fail closed with EMAIL_NOT_VERIFIED.
 */
export const signInWithPassword = async (rawInput: unknown) =>
  runAuthAction(async (): Promise<SignInResult> => {
    const input = parseAuthInput(
      loginSchema,
      withNormalizedEmail(rawInput, "email"),
    );

    await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
        rememberMe: input.rememberMe,
      },
    });

    const userId = await findUserIdByEmail(input.email);
    const memberships =
      userId === null ? [] : await listMembershipsByUserId(userId);
    const primary = memberships[0];

    return {
      email: input.email,
      organizationName: primary?.organization.name ?? null,
      organizationRole: primary?.role ?? null,
      onboardingStatus: primary?.organization.onboarding?.status ?? null,
    };
  });

/**
 * Ends the current session through Better Auth: the server revokes it and
 * the cookie integration clears the session cookie. Callers only receive
 * the safe result envelope — never provider internals. The caller owns
 * post-sign-out navigation so unauthenticated entry stays centralized.
 */
export const signOutSession = async (): Promise<AuthActionResult<null>> =>
  runAuthAction(async () => {
    await auth.api.signOut({
      headers: await headers(),
    });
    return null;
  });
