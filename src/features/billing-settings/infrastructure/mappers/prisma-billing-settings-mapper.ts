import type { BillingSettings as PrismaBillingSettingsModel } from "@/generated/prisma/client";
import type { BillingSettings, BillingDocumentType } from "../../domain/entities/billing-settings";

export const toDomainBillingSettings = (
  raw: PrismaBillingSettingsModel,
): BillingSettings => {
  return {
    id: raw.id,
    organizationId: raw.organizationId,
    documentType: raw.documentType as BillingDocumentType,
    prefix: raw.prefix,
    suffix: raw.suffix,
    nextNumber: raw.nextNumber,
    padding: raw.padding,
    defaultNotes: raw.defaultNotes,
    defaultTerms: raw.defaultTerms,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};
