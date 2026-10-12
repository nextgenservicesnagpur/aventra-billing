import "server-only";

import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Server-side session access boundary. Server components, actions, and
 * route handlers resolve the current session through here instead of
 * duplicating Better Auth internals. Returns null when unauthenticated.
 */
export const getServerSession = async () =>
  auth.api.getSession({ headers: await headers() });
