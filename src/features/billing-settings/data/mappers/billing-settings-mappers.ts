import type { BillingSettings } from "../../domain/entities/billing-settings";
import { formatDocumentNumber } from "../../domain/rules/billing-settings-rules";
import type { BillingSettingsDto } from "../dto/billing-settings-dto";

export const toBillingSettingsDto = (entity: BillingSettings): BillingSettingsDto => {
  const previewNumber = formatDocumentNumber({
    prefix: entity.prefix,
    nextNumber: entity.nextNumber,
    padding: entity.padding,
    suffix: entity.suffix,
  });

  return {
    id: entity.id,
    organizationId: entity.organizationId,
    documentType: entity.documentType,
    prefix: entity.prefix,
    suffix: entity.suffix,
    nextNumber: entity.nextNumber,
    padding: entity.padding,
    defaultNotes: entity.defaultNotes,
    defaultTerms: entity.defaultTerms,
    previewNumber,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
};
