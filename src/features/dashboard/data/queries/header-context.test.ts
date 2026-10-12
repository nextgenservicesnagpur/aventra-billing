import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/features/auth";

const getAuthState = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth", () => ({
  getAuthState,
}));

import { getDashboardHeaderContext } from "./header-context";

const user = {
  id: "user_1",
  name: "Javed Pathak",
  email: "javed@example.com",
  emailVerified: true,
};

const organization = {
  id: "org_1",
  name: "Nextgen Services",
  slug: "nextgen",
  role: "owner",
  onboardingStatus: "COMPLETED" as const,
};

describe("dashboard header context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the authenticated user and primary organization through", async () => {
    const state: AuthState = {
      status: "authenticated",
      user,
      organization,
    };
    getAuthState.mockResolvedValue(state);

    await expect(getDashboardHeaderContext()).resolves.toEqual({
      user,
      organization,
    });
  });

  it("keeps the user without organization for verified sessions that lack one", async () => {
    const state: AuthState = {
      status: "authenticated",
      user,
      organization: null,
    };
    getAuthState.mockResolvedValue(state);

    await expect(getDashboardHeaderContext()).resolves.toEqual({
      user,
      organization: null,
    });
  });

  it("keeps the user without organization for unverified sessions", async () => {
    const state: AuthState = { status: "unverified", user };
    getAuthState.mockResolvedValue(state);

    await expect(getDashboardHeaderContext()).resolves.toEqual({
      user,
      organization: null,
    });
  });

  it("falls back to null when unauthenticated", async () => {
    const state: AuthState = { status: "unauthenticated" };
    getAuthState.mockResolvedValue(state);

    await expect(getDashboardHeaderContext()).resolves.toBeNull();
  });

  it("falls back to null instead of throwing when resolution fails", async () => {
    getAuthState.mockRejectedValue(new Error("database unreachable"));

    await expect(getDashboardHeaderContext()).resolves.toBeNull();
  });
});
