import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthState } from "@/features/auth";

export type AppLayoutProps = {
  children: ReactNode;
};

/**
 * Authenticated application boundary. Verifies a server-side session for
 * everything under (app) and sends unauthenticated visitors to sign in.
 * This is a floor, not the full authorization model: verified account,
 * organization context, and role checks arrive with the features that
 * need them. Route groups alone never protect anything.
 */
const AppLayout = async ({ children }: AppLayoutProps) => {
  const state = await getAuthState();
  
  if (state.status !== "authenticated" || !state.organization) {
    redirect("/auth");
  }

  if (state.organization.onboardingStatus === "NOT_STARTED") {
    redirect("/auth");
  }

  if (state.organization.onboardingStatus === "IN_PROGRESS") {
    redirect("/onboarding");
  }

  return <>{children}</>;
};

export default AppLayout;
