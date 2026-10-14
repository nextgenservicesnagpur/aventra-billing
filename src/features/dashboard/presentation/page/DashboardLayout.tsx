import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type DashboardLayoutProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Dashboard content region wrapper. The persistent header and outer
 * document shell are owned by src/app/(app)/layout.tsx.
 */
export const DashboardLayout = ({ children, className }: DashboardLayoutProps) => (
  <div className={cn("w-full", className)}>
    {children}
  </div>
);
