import type { ReactNode } from "react";
import { DashboardHeader } from "../components/DashboardHeader";

export type DashboardLayoutProps = {
  children: ReactNode;
};

/**
 * Dashboard shell: the sticky header plus a single constrained content
 * region. Deliberately sidebar-free for now — the wrapper shape leaves
 * room for future navigation beside the header without changing the
 * content contract. Loading and error boundaries render inside the
 * content region, so header dimensions never shift.
 */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
    <DashboardHeader />
    <main className="flex w-full flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </div>
    </main>
  </div>
);
