"use client";

import { Button } from "@/shared/components/form/Button";

export type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Dashboard route error boundary. Safe recovery state in the Aventra
 * visual language: no stack traces, with a retry action. Renders inside
 * the dashboard shell's content region so the header stays in place.
 */
const DashboardError = ({ reset }: DashboardErrorProps) => (
  <div className="flex w-full min-h-[50dvh] flex-col items-center justify-center text-center text-foreground">
    <h1 className="font-heading text-2xl font-bold text-text-primary">
      Something went wrong
    </h1>
    <p className="mt-3 max-w-sm text-text-secondary">
      The dashboard hit an unexpected problem. Please try again.
    </p>
    <div className="mt-8 w-full max-w-sm">
      <Button type="button" variant="primary" className="h-12 w-full" onClick={reset}>
        Try again
      </Button>
    </div>
  </div>
);

export default DashboardError;
