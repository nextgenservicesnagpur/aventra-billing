import { describe, expect, it } from "vitest";
import {
  canAdministerOrganization,
  isOrganizationAdmin,
  isOrganizationOwner,
  isPlatformSuperadmin,
} from "./authorization";

describe("organization membership roles", () => {
  it("grants owner the owner and admin capabilities", () => {
    expect(isOrganizationOwner("owner")).toBe(true);
    expect(isOrganizationAdmin("owner")).toBe(true);
    expect(canAdministerOrganization("owner")).toBe(true);
  });

  it("grants admin the admin capability but not ownership", () => {
    expect(isOrganizationOwner("admin")).toBe(false);
    expect(isOrganizationAdmin("admin")).toBe(true);
    expect(canAdministerOrganization("admin")).toBe(false);
  });

  it("denies members, unknown roles, and missing roles", () => {
    for (const role of ["member", "superadmin", "", null, undefined]) {
      expect(isOrganizationOwner(role)).toBe(false);
      expect(isOrganizationAdmin(role)).toBe(false);
      expect(canAdministerOrganization(role)).toBe(false);
    }
  });
});

describe("platform superadmin scope separation", () => {
  it("recognizes only the superadmin global role", () => {
    expect(isPlatformSuperadmin("superadmin")).toBe(true);
    for (const role of ["owner", "admin", "member", "user", "", null, undefined]) {
      expect(isPlatformSuperadmin(role)).toBe(false);
    }
  });

  it("never confers organization ownership through platform scope", () => {
    expect(canAdministerOrganization("superadmin")).toBe(false);
    expect(isOrganizationOwner("superadmin")).toBe(false);
  });

  it("never confers platform power through organization scope", () => {
    expect(isPlatformSuperadmin("owner")).toBe(false);
    expect(isPlatformSuperadmin("admin")).toBe(false);
  });
});
