import { describe, expect, it } from "vitest";
import { rootEntryDestination } from "./rootEntry";
import type { AuthState } from "../../data/dto/auth-dto";

describe("root entry destination", () => {
  it("resolves an authenticated session with COMPLETED onboarding toward the dashboard", () => {
    const state: AuthState = {
      status: "authenticated",
      user: { id: "1", name: "Test", email: "test@example.com", emailVerified: true },
      organization: { id: "1", name: "Org", slug: "org", role: "admin", onboardingStatus: "COMPLETED" },
    };
    expect(rootEntryDestination(state)).toBe("/dashboard");
  });

  it("resolves an authenticated session with IN_PROGRESS onboarding toward onboarding", () => {
    const state: AuthState = {
      status: "authenticated",
      user: { id: "1", name: "Test", email: "test@example.com", emailVerified: true },
      organization: { id: "1", name: "Org", slug: "org", role: "admin", onboardingStatus: "IN_PROGRESS" },
    };
    expect(rootEntryDestination(state)).toBe("/onboarding");
  });

  it("resolves unauthenticated, unverified, or NOT_STARTED sessions toward auth", () => {
    expect(rootEntryDestination({ status: "unauthenticated" })).toBe("/auth");
    
    expect(
      rootEntryDestination({
        status: "unverified",
        user: { id: "1", name: "Test", email: "test@example.com", emailVerified: false },
      })
    ).toBe("/auth");

    const stateNotStarted: AuthState = {
      status: "authenticated",
      user: { id: "1", name: "Test", email: "test@example.com", emailVerified: true },
      organization: { id: "1", name: "Org", slug: "org", role: "admin", onboardingStatus: "NOT_STARTED" },
    };
    expect(rootEntryDestination(stateNotStarted)).toBe("/auth");
  });
});
