import type { BillingSettingsDto } from "../../data/dto/billing-settings-dto";
import { DocumentSettingsForm } from "./DocumentSettingsForm";

export type RecurringInvoiceSettingsFormProps = {
  initialSettings: BillingSettingsDto;
};

export const RecurringInvoiceSettingsForm = ({
  initialSettings,
}: RecurringInvoiceSettingsFormProps) => {
  return (
    <DocumentSettingsForm
      documentType="RECURRING_INVOICE"
      initialSettings={initialSettings}
    />
  );
};
