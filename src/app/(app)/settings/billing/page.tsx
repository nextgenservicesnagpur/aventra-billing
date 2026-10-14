import { getAllBillingSettings } from "@/features/billing-settings/data/queries/get-billing-settings";
import { BillingSettingsPage } from "@/features/billing-settings/presentation/page/BillingSettingsPage";

export const dynamic = "force-dynamic";

export default async function BillingSettingsRoutePage() {
  const settings = await getAllBillingSettings();

  return <BillingSettingsPage initialSettings={settings} />;
}
