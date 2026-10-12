import {
  getAuthState,
  type SafeOrganization,
  type SafeUser,
} from "@/features/auth";

/**
 * Resolved identity context for the dashboard header. Built exclusively
 * from the server-side session through the auth feature's public API;
 * `null` is the safe fallback when session/profile resolution fails or no
 * session exists, so the header degrades instead of crashing the shell.
 */
export type DashboardHeaderContext = {
  user: SafeUser;
  organization: SafeOrganization | null;
} | null;

/**
 * Loads the header's user/organization context server-side. Never throws:
 * a failed resolution collapses to the fallback context rather than
 * taking down the dashboard route. The (app) layout remains the
 * authentication gate; this query only shapes presentation data.
 */
export const getDashboardHeaderContext =
  async (): Promise<DashboardHeaderContext> => {
    try {
      const state = await getAuthState();
      if (state.status === "authenticated") {
        return { user: state.user, organization: state.organization };
      }
      if (state.status === "unverified") {
        return { user: state.user, organization: null };
      }
      return null;
    } catch {
      return null;
    }
  };
