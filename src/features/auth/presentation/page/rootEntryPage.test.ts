import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthState, SafeUser } from "../../data/dto/auth-dto";

const getAuthStateMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() =>
  vi.fn((href: string) => {
    throw new Error(`NEXT_REDIRECT:${href}`);
  }),
);

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("../../data/queries/session-state", () => ({
  getAuthState: getAuthStateMock,
}));

vi.mock("./RootEntryTransition", () => ({
  RootEntryTransition: () => null,
}));

import { RootEntryPage } from "./RootEntryPage";

const safeUser: SafeUser = {
  id: "user_1",
  name: "Owner",
  email: "owner@acme.test",
  emailVerified: true,
};

const authenticatedState: AuthState = {
  status: "authenticated",
  user: safeUser,
  organization: {
    id: "org_1",
    name: "Acme",
    slug: "acme",
    role: "owner",
    onboardingStatus: "COMPLETED",
  },
};

describe("root entry gate", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  it("sends an authenticated session into the splash toward the dashboard", async () => {
    getAuthStateMock.mockResolvedValue(authenticatedState);

    const element = await RootEntryPage();

    expect(redirectMock).not.toHaveBeenCalled();
    expect(element.props.destination).toBe("/dashboard");
  });

  it("redirects unauthenticated visitors to the existing auth experience", async () => {
    getAuthStateMock.mockResolvedValue({
      status: "unauthenticated",
    } satisfies AuthState);

    await expect(RootEntryPage()).rejects.toThrow("NEXT_REDIRECT:/auth");
    expect(redirectMock).toHaveBeenCalledWith("/auth");
  });

  it("redirects unverified sessions to auth for verification", async () => {
    getAuthStateMock.mockResolvedValue({
      status: "unverified",
      user: safeUser,
    } satisfies AuthState);

    await expect(RootEntryPage()).rejects.toThrow("NEXT_REDIRECT:/auth");
    expect(redirectMock).toHaveBeenCalledWith("/auth");
  });
});
