import "server-only";

import { z } from "zod";

/**
 * Single definition of the database connection contract. Owned by shared
 * configuration because the database connection is feature-agnostic;
 * auth's environment schema composes this rule instead of restating it.
 */
export const databaseUrlSchema = z
  .string()
  .min(1, "DATABASE_URL is required.")
  .refine(
    (value) =>
      value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "DATABASE_URL must be a PostgreSQL connection string.",
  );

const databaseEnvSchema = z.object({ DATABASE_URL: databaseUrlSchema });

/**
 * Validates and returns the database connection string. Server-only
 * configuration flows through here; never read process.env directly and
 * never include the value itself in an error or log.
 */
export const getDatabaseUrl = (): string => {
  const parsed = databaseEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      "Invalid server configuration for: DATABASE_URL. Compare .env against .env.example.",
    );
  }
  return parsed.data.DATABASE_URL;
};
