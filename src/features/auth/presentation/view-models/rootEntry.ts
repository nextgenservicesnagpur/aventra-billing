import type { AuthState } from "../../data/dto/auth-dto";

export type RootEntryDestination = "/auth" | "/dashboard" | "/onboarding";

/**
 * Resolves where `/` sends each session state. Only a verified,
 * authenticated session with completed onboarding earns the root splash toward the dashboard.
 */
export const rootEntryDestination = (
  state: AuthState,
): RootEntryDestination => {
  if (state.status === "authenticated" && state.organization) {
    if (state.organization.onboardingStatus === "COMPLETED") {
      return "/dashboard";
    }
    if (state.organization.onboardingStatus === "IN_PROGRESS") {
      return "/onboarding";
    }
  }
  return "/auth";
};
