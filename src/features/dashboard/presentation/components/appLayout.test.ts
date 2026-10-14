import { describe, expect, it, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  usePathname: vi.fn(() => "/invoices"),
}));

// Mock auth state
const mockGetAuthState = vi.fn();
vi.mock("@/features/auth", () => ({
  getAuthState: () => mockGetAuthState(),
  signOutSession: vi.fn(),
}));

// Mock DashboardHeader to verify it gets rendered by AppLayout
vi.mock("@/features/dashboard/presentation/components/DashboardHeader", () => ({
  DashboardHeader: () =>
    createElement("header", { "data-testid": "shared-dashboard-header" }, "Header Content"),
}));

import AppLayout from "@/app/(app)/layout";
import DashboardRouteLayout from "@/app/(app)/dashboard/layout";
import InvoicesLayout from "@/app/(app)/invoices/layout";

describe("AppLayout and Shared Header Ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication and onboarding guards", () => {
    it("redirects unauthenticated users to /auth", async () => {
      mockGetAuthState.mockResolvedValueOnce({
        status: "unauthenticated",
        organization: null,
      });

      await expect(
        AppLayout({ children: createElement("div", null, "Child Content") }),
      ).rejects.toThrow("REDIRECT:/auth");
    });

    it("redirects users with NOT_STARTED onboarding to /auth", async () => {
      mockGetAuthState.mockResolvedValueOnce({
        status: "authenticated",
        organization: { onboardingStatus: "NOT_STARTED" },
      });

      await expect(
        AppLayout({ children: createElement("div", null, "Child Content") }),
      ).rejects.toThrow("REDIRECT:/auth");
    });

    it("redirects users with IN_PROGRESS onboarding to /onboarding", async () => {
      mockGetAuthState.mockResolvedValueOnce({
        status: "authenticated",
        organization: { onboardingStatus: "IN_PROGRESS" },
      });

      await expect(
        AppLayout({ children: createElement("div", null, "Child Content") }),
      ).rejects.toThrow("REDIRECT:/onboarding");
    });
  });

  describe("Persistent Shared Header and Shell", () => {
    it("renders the shared DashboardHeader once and children inside the shared shell", async () => {
      mockGetAuthState.mockResolvedValueOnce({
        status: "authenticated",
        organization: { onboardingStatus: "COMPLETED" },
      });

      const element = await AppLayout({
        children: createElement("div", { "data-testid": "test-route-content" }, "Invoice Content"),
      });

      const html = renderToStaticMarkup(element);

      // Verify DashboardHeader is present
      expect(html).toContain('data-testid="shared-dashboard-header"');
      expect(html).toContain("Header Content");

      // Verify route content is rendered
      expect(html).toContain('data-testid="test-route-content"');
      expect(html).toContain("Invoice Content");

      // Verify the shared responsive shell container classes
      expect(html).toContain("w-full flex-1 px-4 py-8 md:px-6 md:py-10");
      expect(html).not.toContain("max-w-7xl");
    });

    it("ensures nested DashboardRouteLayout does not duplicate the header", () => {
      const element = DashboardRouteLayout({
        children: createElement("div", { "data-testid": "dashboard-content" }, "Dashboard"),
      });

      const html = renderToStaticMarkup(element);

      expect(html).not.toContain('data-testid="shared-dashboard-header"');
      expect(html).toContain('data-testid="dashboard-content"');
    });

    it("ensures nested InvoicesLayout does not duplicate the header and provides workspace context", () => {
      const element = InvoicesLayout({
        children: createElement("div", { "data-testid": "invoices-content" }, "Invoices"),
      });

      const html = renderToStaticMarkup(element);

      expect(html).not.toContain('data-testid="shared-dashboard-header"');
      expect(html).toContain('data-testid="invoices-content"');
    });
  });
});
