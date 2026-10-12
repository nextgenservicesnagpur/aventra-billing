import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseUrl } from "../config/env";

declare global {
  // Single shared client across hot reloads in development.
  var aventraPrismaClient: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
  return new PrismaClient({ adapter });
};

/**
 * Single reusable Prisma client for the whole application. The database
 * connection is feature-agnostic infrastructure, so the client lives in
 * shared — never instantiate PrismaClient per request or per feature.
 */
export const getPrisma = (): PrismaClient => {
  if (globalThis.aventraPrismaClient === undefined) {
    globalThis.aventraPrismaClient = createPrismaClient();
  }
  return globalThis.aventraPrismaClient;
};
