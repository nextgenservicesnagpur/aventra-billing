import { getServerSession } from "../../infrastructure/auth/session";
import { getPrisma } from "@/shared/lib/prisma";
import { toSafeOrganization, toSafeUser } from "../mappers/auth-mappers";
import { listMembershipsByUserId } from "./auth-lookups";
import type { AuthState } from "../dto/auth-dto";

/**
 * Resolves the current authentication state from the real server-side
 * session. Single source of truth for page reloads: unauthenticated when
 * no session exists, unverified until the email is confirmed, and
 * authenticated only for verified users. Never trusts client state.
 */
export const getAuthState = async (): Promise<AuthState> => {
  const session = await getServerSession();
  if (session === null || session.session === null) {
    return { status: "unauthenticated" };
  }

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, emailVerified: true },
  });
  if (user === null) {
    return { status: "unauthenticated" };
  }
  if (!user.emailVerified) {
    return { status: "unverified", user: toSafeUser(user) };
  }

  const memberships = await listMembershipsByUserId(user.id);
  const primary = memberships[0];

  return {
    status: "authenticated",
    user: toSafeUser(user),
    organization:
      primary === undefined
        ? null
        : toSafeOrganization(primary.organization, primary.role),
  };
};
