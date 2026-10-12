export const ORGANIZATION_MEMBER_ROLES = [
  "owner",
  "admin",
  "member",
] as const;

export type OrganizationMemberRole =
  (typeof ORGANIZATION_MEMBER_ROLES)[number];

export const PLATFORM_SUPERADMIN_ROLE = "superadmin";

/**
 * Central authorization policies. Pure functions over plain role values:
 * organization membership roles (owner/admin/member) and the platform
 * global role. Scopes never mix — an organization role can never confer
 * platform power and vice versa. Server-enforced; client use is
 * presentation-only.
 */
export const isOrganizationOwner = (
  memberRole: string | null | undefined,
): boolean => memberRole === "owner";

export const isOrganizationAdmin = (
  memberRole: string | null | undefined,
): boolean => memberRole === "owner" || memberRole === "admin";

export const isPlatformSuperadmin = (
  globalRole: string | null | undefined,
): boolean => globalRole === PLATFORM_SUPERADMIN_ROLE;

export const canAdministerOrganization = (
  memberRole: string | null | undefined,
): boolean => isOrganizationOwner(memberRole);
