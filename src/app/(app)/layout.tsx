import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthState } from "@/features/auth";
import { DashboardHeader } from "@/features/dashboard/presentation/components/DashboardHeader";

export type AppLayoutProps = {
  children: ReactNode;
};

/**
 * Authenticated application boundary. Verifies a server-side session for
 * everything under (app) and sends unauthenticated visitors to sign in.
 * Owns the persistent shared header and authenticated layout shell across
 * all authenticated routes.
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

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
      <DashboardHeader />
      <main className="flex w-full flex-1 flex-col">
        <div className="w-full flex-1 px-4 py-8 md:px-6 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
