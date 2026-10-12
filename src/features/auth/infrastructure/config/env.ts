import "server-only";

import { z } from "zod";
import { databaseUrlSchema } from "@/shared/config/env";

const authEnvSchema = z.object({
  DATABASE_URL: databaseUrlSchema,
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL."),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters."),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required."),
  AUTH_EMAIL_FROM: z
    .string()
    .min(1, "AUTH_EMAIL_FROM is required.")
    .max(320, "AUTH_EMAIL_FROM is too long.")
    .refine(
      (value) => value.includes("@"),
      "AUTH_EMAIL_FROM must contain an email address.",
    ),
});

export type AuthEnv = z.infer<typeof authEnvSchema>;

/**
 * Centralized server environment access. All server-only configuration
 * flows through here; application code must not read process.env
 * directly. Only variable names (never values) appear in errors.
 */
export const getEnv = (): AuthEnv => {
  const parsed = authEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => issue.path.join("."));
    const uniqueKeys = [...new Set(keys)];
    throw new Error(
      `Invalid server configuration for: ${uniqueKeys.join(", ")}. Compare .env against .env.example.`,
    );
  }
  return parsed.data;
};
