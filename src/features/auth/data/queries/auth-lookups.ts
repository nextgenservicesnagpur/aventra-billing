import { getPrisma } from "@/shared/lib/prisma";

/**
 * Read-oriented auth data access. Small indexed lookups used by
 * orchestrating mutations; results are plain data, never raw records
 * beyond the selected scalars.
 */
export const findUserIdByEmail = async (
  email: string,
): Promise<string | null> => {
  const user = await getPrisma().user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
};

export const isOrganizationSlugTaken = async (
  slug: string,
): Promise<boolean> => {
  const organization = await getPrisma().organization.findUnique({
    where: { slug },
    select: { id: true },
  });
  return organization !== null;
};

export type MembershipRecord = {
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    onboarding?: { status: "IN_PROGRESS" | "COMPLETED" } | null;
  };
};

export const listMembershipsByUserId = async (
  userId: string,
): Promise<MembershipRecord[]> => {
  const members = await getPrisma().member.findMany({
    where: { userId },
    select: {
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          onboarding: { select: { status: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return members;
};

export const findMemberRole = async (
  organizationId: string,
  userId: string,
): Promise<string | null> => {
  const member = await getPrisma().member.findFirst({
    where: { organizationId, userId },
    select: { role: true },
  });
  return member?.role ?? null;
};
