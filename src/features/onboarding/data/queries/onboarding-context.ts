import "server-only";

import { getAuthState } from "@/features/auth";
import {
  ForbiddenError,
  OrganizationNotFoundError,
  UnauthorizedError,
} from "../../domain/errors/onboarding-errors";
import { canManageOnboarding } from "../../domain/rules/onboarding-authorization";

export type OnboardingContext = {
  organizationId: string;
};

/**
 * Resolves and authorizes the caller for every onboarding mutation.
 * Session, organization membership, and role are re-checked at this
 * server boundary on each call — nothing from the client is trusted.
 * Throws the feature's domain errors so failures surface as safe
 * messages through the result envelope.
 */
export const resolveOnboardingContext = async (): Promise<OnboardingContext> => {
  const state = await getAuthState();
  if (state.status !== "authenticated") {
    throw new UnauthorizedError();
  }
  if (state.organization === null) {
    throw new OrganizationNotFoundError();
  }
  if (!canManageOnboarding(state.organization.role)) {
    throw new ForbiddenError();
  }
  return { organizationId: state.organization.id };
};
