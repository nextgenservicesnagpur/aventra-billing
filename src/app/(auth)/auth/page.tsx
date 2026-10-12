import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPage } from "@/features/auth/presentation/page/AuthPage";
import { getAuthState } from "@/features/auth/data/queries/session-state";
import type { AuthFormMode } from "@/features/auth/presentation/page/AuthFormSwitch";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to continue to Aventra-ERP.",
};

/**
 * Auth route. Rendered per request so a page reload reconciles the real
 * server-side session: verified sessions resume at Welcome, unverified
 * sessions resume at verification, and everyone else starts at login.
 * Welcome is never exposed without a verified session behind it.
 */
const AuthRoutePage = async () => {
  const state = await getAuthState();

  if (state.status === "authenticated" && state.organization?.onboardingStatus === "COMPLETED") {
    redirect("/dashboard");
  }

  let initialMode: AuthFormMode = "login";
  let initialEmail = "";
  let initialOrganizationName = "";
  if (state.status === "unverified") {
    initialMode = "verify-otp";
    initialEmail = state.user.email;
  } else if (state.status === "authenticated") {
    initialMode = "welcome";
    initialEmail = state.user.email;
    initialOrganizationName =
      state.organization?.name ?? "Your organization";
  }

  return (
    <AuthPage
      initialMode={initialMode}
      initialEmail={initialEmail}
      initialOrganizationName={initialOrganizationName}
    />
  );
};

export default AuthRoutePage;
