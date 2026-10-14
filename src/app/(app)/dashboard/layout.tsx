import type { ReactNode } from "react";

export type DashboardRouteLayoutProps = {
  children: ReactNode;
};

/**
 * Dashboard route layout. Access and the persistent shared header shell
 * are owned by the parent (app) layout.
 */
const DashboardRouteLayout = ({ children }: DashboardRouteLayoutProps) => (
  <>{children}</>
);
export default DashboardRouteLayout;
