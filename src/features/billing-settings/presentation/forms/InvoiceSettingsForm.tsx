import type { BillingSettingsDto } from "../../data/dto/billing-settings-dto";
import { DocumentSettingsForm } from "./DocumentSettingsForm";

export type InvoiceSettingsFormProps = {
  initialSettings: BillingSettingsDto;
};

export const InvoiceSettingsForm = ({
  initialSettings,
}: InvoiceSettingsFormProps) => {
  return (
    <DocumentSettingsForm
      documentType="INVOICE"
      initialSettings={initialSettings}
    />
  );
};
