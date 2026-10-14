import type { BillingSettingsDto } from "../../data/dto/billing-settings-dto";
import { DocumentSettingsForm } from "./DocumentSettingsForm";

export type CreditNoteSettingsFormProps = {
  initialSettings: BillingSettingsDto;
};

export const CreditNoteSettingsForm = ({
  initialSettings,
}: CreditNoteSettingsFormProps) => {
  return (
    <DocumentSettingsForm
      documentType="CREDIT_NOTE"
      initialSettings={initialSettings}
    />
  );
};
