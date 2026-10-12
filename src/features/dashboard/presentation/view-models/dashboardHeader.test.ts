import { describe, expect, it } from "vitest";
import type { DashboardHeaderContext } from "../../data/queries/header-context";
import { toDashboardHeaderModel } from "./dashboardHeader";

const authenticatedContext = (
  overrides: {
    name?: string;
    email?: string;
    organization?: { id: string; name: string; slug: string; role: string; onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" } | null;
  } = {},
): DashboardHeaderContext => ({
  user: {
    id: "user_1",
    name: overrides.name ?? "Javed Pathak",
    email: overrides.email ?? "javed@example.com",
    emailVerified: true,
  },
  organization:
    overrides.organization === undefined
      ? { id: "org_1", name: "Nextgen Services", slug: "nextgen", role: "owner", onboardingStatus: "COMPLETED" as const }
      : overrides.organization,
});

describe("dashboard header view-model", () => {
  it("maps the session into workspace and account display data", () => {
    expect(toDashboardHeaderModel(authenticatedContext())).toEqual({
      workspace: { name: "Nextgen Services" },
      account: {
        displayName: "Javed Pathak",
        email: "javed@example.com",
        initials: "JP",
        organizationName: "Nextgen Services",
        roleLabel: "Owner",
      },
    });
  });

  it("derives initials from a single-word display name", () => {
    const model = toDashboardHeaderModel(
      authenticatedContext({ name: "Javed", organization: null }),
    );
    expect(model.account?.initials).toBe("J");
  });

  it("falls back to the email when the display name is blank", () => {
    const model = toDashboardHeaderModel(
      authenticatedContext({ name: "   ", email: "ops@nextgen.test" }),
    );
    expect(model.account).toMatchObject({
      displayName: "ops@nextgen.test",
      initials: "O",
      email: "ops@nextgen.test",
    });
  });

  it("keeps workspace absent when the session has no organization", () => {
    expect(
      toDashboardHeaderModel(authenticatedContext({ organization: null })),
    ).toEqual({
      workspace: null,
      account: {
        displayName: "Javed Pathak",
        email: "javed@example.com",
        initials: "JP",
        organizationName: null,
        roleLabel: null,
      },
    });
  });

  it("resolves known roles to labels and unknown roles to null", () => {
    expect(
      toDashboardHeaderModel(
        authenticatedContext({
          organization: {
            id: "org_1",
            name: "Nextgen Services",
            slug: "nextgen",
            role: "superadmin",
            onboardingStatus: "COMPLETED",
          },
        }),
      ).account?.roleLabel,
    ).toBe("Super Admin");
    expect(
      toDashboardHeaderModel(
        authenticatedContext({
          organization: {
            id: "org_1",
            name: "Nextgen Services",
            slug: "nextgen",
            role: "auditor",
            onboardingStatus: "COMPLETED",
          },
        }),
      ).account?.roleLabel,
    ).toBeNull();
  });

  it("returns the stable fallback model when context resolution failed", () => {
    expect(toDashboardHeaderModel(null)).toEqual({
      workspace: null,
      account: null,
    });
  });
});
