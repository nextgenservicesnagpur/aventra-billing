import type { ReactNode } from "react";
import { DashboardLayout } from "@/features/dashboard/presentation/page/DashboardLayout";

export type DashboardRouteLayoutProps = {
  children: ReactNode;
};

/**
 * Dashboard route layout. Thin composition boundary: the shell (header +
 * content region) lives in the Dashboard feature. Access remains gated by
 * the (app) session layout above this segment.
 */
const DashboardRouteLayout = ({ children }: DashboardRouteLayoutProps) => (
  <DashboardLayout>{children}</DashboardLayout>
);

export default DashboardRouteLayout;
