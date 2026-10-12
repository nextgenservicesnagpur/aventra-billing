import type { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard/presentation/page/DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Aventra application overview.",
};

/**
 * Dashboard route. Thin composition boundary: renders the Dashboard
 * feature page. Access is gated by the (app) layout session check.
 */
const DashboardRoutePage = () => <DashboardPage />;

export default DashboardRoutePage;
