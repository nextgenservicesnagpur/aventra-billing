"use client";

import { Button } from "@/shared/components/form/Button";

export type AuthErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Auth route error boundary. Renders a safe recovery state in the
 * Aventra visual language: no stack traces, no provider internals,
 * with a retry action that re-attempts the failed segment.
 */
const AuthError = ({ reset }: AuthErrorProps) => (
  <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 text-center text-foreground">
    <h1 className="font-heading text-2xl font-bold text-text-primary">
      Something went wrong
    </h1>
    <p className="mt-3 max-w-sm text-text-secondary">
      The sign-in experience hit an unexpected problem. Please try again.
    </p>
    <div className="mt-8 w-full max-w-sm">
      <Button type="button" variant="primary" className="h-12 w-full" onClick={reset}>
        Try again
      </Button>
    </div>
  </main>
);

export default AuthError;
