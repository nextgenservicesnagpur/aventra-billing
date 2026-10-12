import { describe, expect, it } from "vitest";
import { canManageOnboarding } from "./onboarding-authorization";

describe("onboarding authorization policy", () => {
  it("allows owners and admins to manage onboarding", () => {
    expect(canManageOnboarding("owner")).toBe(true);
    expect(canManageOnboarding("admin")).toBe(true);
  });

  it("denies members, superadmins, unknown roles, and missing roles", () => {
    for (const role of ["member", "superadmin", "", null, undefined]) {
      expect(canManageOnboarding(role)).toBe(false);
    }
  });
});
