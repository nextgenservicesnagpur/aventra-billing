/**
 * Onboarding authorization policy. Completing onboarding writes
 * organization setup, address, tax, and subscription state, so only
 * administrative members may run it. Enforced at every server mutation
 * boundary; any client-side check is presentation-only.
 */
export const canManageOnboarding = (
  memberRole: string | null | undefined,
): boolean => memberRole === "owner" || memberRole === "admin";
