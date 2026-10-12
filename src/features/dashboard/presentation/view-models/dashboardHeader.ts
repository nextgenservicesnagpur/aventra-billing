import type { DashboardHeaderContext } from "../../data/queries/header-context";

export type DashboardHeaderWorkspaceModel = {
  name: string;
};

export type DashboardHeaderAccountModel = {
  displayName: string;
  email: string;
  initials: string;
  organizationName: string | null;
  roleLabel: string | null;
};

/**
 * Presentation shape of the dashboard header. `workspace` and `account`
 * are independent so the shell keeps its layout in every state; both are
 * null only in the safe fallback. The role label is display data derived
 * from the server-resolved session — the header is never an
 * authorization layer.
 */
export type DashboardHeaderModel = {
  workspace: DashboardHeaderWorkspaceModel | null;
  account: DashboardHeaderAccountModel | null;
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  superadmin: "Super Admin",
  member: "Member",
};

const toRoleLabel = (role: string): string | null => roleLabels[role] ?? null;

const toInitials = (source: string): string => {
  const words = source.trim().split(/\s+/).filter((word) => word !== "");
  const characters = words
    .slice(0, 2)
    .map((word) => [...word][0] ?? "")
    .join("");
  return characters.toUpperCase();
};

const toDisplayName = (name: string, email: string): string => {
  const trimmed = name.trim();
  return trimmed !== "" ? trimmed : email;
};

/**
 * Maps the server-resolved header context into display-ready shapes.
 * Pure and total: every input — including the fallback null context —
 * produces a stable model so the header can render without branching on
 * infrastructure concerns.
 */
export const toDashboardHeaderModel = (
  context: DashboardHeaderContext,
): DashboardHeaderModel => {
  if (context === null) {
    return { workspace: null, account: null };
  }

  const organization = context.organization;
  const displayName = toDisplayName(context.user.name, context.user.email);

  return {
    workspace: organization === null ? null : { name: organization.name },
    account: {
      displayName,
      email: context.user.email,
      initials: toInitials(displayName),
      organizationName: organization?.name ?? null,
      roleLabel: organization === null ? null : toRoleLabel(organization.role),
    },
  };
};
