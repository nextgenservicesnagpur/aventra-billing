"use client";

import { Button } from "@/shared/components/form/Button";

export type OrganizationErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Organization route error boundary. Safe recovery state in the Aventra
 * visual language: no stack traces, with a retry action.
 */
const OrganizationError = ({ reset }: OrganizationErrorProps) => (
  <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 text-center text-foreground">
    <h1 className="font-heading text-2xl font-bold text-text-primary">
      Something went wrong
    </h1>
    <p className="mt-3 max-w-sm text-text-secondary">
      The organization area hit an unexpected problem. Please try again.
    </p>
    <div className="mt-8 w-full max-w-sm">
      <Button type="button" variant="primary" className="h-12 w-full" onClick={reset}>
        Try again
      </Button>
    </div>
  </main>
);

export default OrganizationError;
