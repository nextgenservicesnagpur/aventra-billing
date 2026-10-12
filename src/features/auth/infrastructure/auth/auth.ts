import "server-only";

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, organization } from "better-auth/plugins";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { getEnv } from "../config/env";
import { getPrisma } from "@/shared/lib/prisma";
import { sendOtpEmail } from "../services/resend-email";
import {
  platformAccessControl,
  platformSuperadminRole,
  platformUserRole,
} from "./access-control";

/**
 * Better Auth authority for Aventra. Provider configuration lives here
 * and only here: email/password with required verification, organization
 * membership (creator becomes owner), hashed email OTPs, platform
 * superadmin through the admin plugin, and Next.js cookie handling for
 * server actions. Application policy lives in domain/rules; orchestration
 * lives in data/mutations.
 */
export const auth = betterAuth({
  baseURL: getEnv().BETTER_AUTH_URL,
  secret: getEnv().BETTER_AUTH_SECRET,
  database: prismaAdapter(getPrisma(), {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
  },
  plugins: [
    organization({
      creatorRole: "owner",
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      storeOTP: "hashed",
      sendVerificationOnSignUp: false,
      overrideDefaultEmailVerification: false,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "email-verification" && type !== "forget-password") {
          return;
        }
        await sendOtpEmail({ to: email, otp });
      },
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["superadmin"],
      ac: platformAccessControl,
      roles: {
        user: platformUserRole,
        superadmin: platformSuperadminRole,
      },
    }),
    nextCookies(),
  ],
});

export type Auth = typeof auth;
