import { createAccessControl } from "better-auth/plugins/access";

/**
 * Platform access-control statement. Intentionally minimal: the only
 * platform-level capability in scope is global administration.
 * Organization capabilities (owner/admin) live in Better Auth membership,
 * never here.
 */
const platformStatement = {
  platform: ["manage"],
} as const;

export const platformAccessControl = createAccessControl(platformStatement);

export const platformUserRole = platformAccessControl.newRole({
  platform: [],
});

export const platformSuperadminRole = platformAccessControl.newRole({
  platform: ["manage"],
});
