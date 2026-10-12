import { AuthBranding } from "@/features/auth/presentation/components/AuthBranding";

/**
 * Auth route loading state. Minimal branded placeholder shown while the
 * route segment loads; no spinners, no layout shift.
 */
const AuthLoading = () => (
  <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 text-foreground">
    <AuthBranding />
    <p className="mt-8 text-sm text-text-muted">Loading Aventra…</p>
  </main>
);

export default AuthLoading;
