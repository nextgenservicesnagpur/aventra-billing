import type { BillingSettingsDto } from "../../data/dto/billing-settings-dto";
import { DocumentSettingsForm } from "./DocumentSettingsForm";

export type DebitNoteSettingsFormProps = {
  initialSettings: BillingSettingsDto;
};

export const DebitNoteSettingsForm = ({
  initialSettings,
}: DebitNoteSettingsFormProps) => {
  return (
    <DocumentSettingsForm
      documentType="DEBIT_NOTE"
      initialSettings={initialSettings}
    />
  );
};
