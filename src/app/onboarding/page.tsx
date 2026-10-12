import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthState } from "@/features/auth";
import { canManageOnboarding } from "@/features/onboarding/domain/rules/onboarding-authorization";
import { loadOnboardingViewState } from "@/features/onboarding/data/queries/onboarding-state";
import { OnboardingPage } from "@/features/onboarding/presentation/page/OnboardingPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up your organization and billing preferences in Aventra.",
};

/**
 * Onboarding destination route with a server-side gate. Unauthenticated
 * and unverified sessions go to /auth (which resumes verification when
 * needed), members without setup rights and finished onboarding go to the
 * dashboard, and missing organizations go back to auth. Only an authorized
 * member with an in-progress organization sees the wizard.
 *
 * Destination for the seamless Welcome spatial transition from /auth.
 */
const OnboardingRoutePage = async () => {
  const state = await getAuthState();
  if (state.status !== "authenticated" || state.organization === null) {
    redirect("/auth");
  }
  if (state.organization.onboardingStatus === "COMPLETED") {
    redirect("/dashboard");
  }
  if (!canManageOnboarding(state.organization.role)) {
    redirect("/dashboard");
  }

  const viewState = await loadOnboardingViewState(state.organization.id);
  if (viewState.status === "COMPLETED") {
    redirect("/dashboard");
  }

  return (
    <OnboardingPage
      initialOrganizationName={state.organization.name}
      initialBusinessEmail={state.user.email}
      viewState={viewState}
    />
  );
};

export default OnboardingRoutePage;
