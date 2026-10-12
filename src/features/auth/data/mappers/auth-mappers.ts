import type {
  SafeOrganization,
  SafeUser,
} from "../dto/auth-dto";

type ProviderUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

type ProviderOrganization = {
  id: string;
  name: string;
  slug: string;
  onboarding?: { status: "IN_PROGRESS" | "COMPLETED" } | null;
};

/**
 * Converts provider records into minimal safe DTOs. Only explicitly
 * listed scalar fields cross into presentation; passwords, hashes,
 * tokens, and metadata never leave the server boundary.
 */
export const toSafeUser = (user: ProviderUser): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
});

export const toSafeOrganization = (
  organization: ProviderOrganization,
  role: string,
): SafeOrganization => ({
  id: organization.id,
  name: organization.name,
  slug: organization.slug,
  role,
  onboardingStatus: organization.onboarding?.status ?? "NOT_STARTED",
});
