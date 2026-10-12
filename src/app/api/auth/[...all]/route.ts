import { auth } from "@/features/auth/infrastructure/auth/auth";

/**
 * Better Auth App Router handler. Thin by design: every auth endpoint is
 * served here and all behavior lives in the Better Auth configuration
 * and the application mutations.
 */
export const GET = async (request: Request) => auth.handler(request);

export const POST = async (request: Request) => auth.handler(request);
