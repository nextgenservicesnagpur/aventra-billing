import type { Metadata } from "next";
import { OrganizationPage } from "@/features/organization/presentation/page/OrganizationPage";

export const metadata: Metadata = {
  title: "Organization",
  description: "Aventra organization overview.",
};

/**
 * Organization route. Thin composition boundary: renders the Organization
 * feature page. Access is gated by the (app) layout session check.
 */
const OrganizationRoutePage = () => <OrganizationPage />;

export default OrganizationRoutePage;
