import "server-only";

import type { BillingDocumentType } from "../../domain/entities/billing-settings";
import { resolveBillingSettingsContext } from "../context/billing-settings-context";
import { billingSettingsRepository } from "../../infrastructure/repositories/prisma-billing-settings-repository";
import { toBillingSettingsDto } from "../mappers/billing-settings-mappers";
import type { BillingSettingsDto } from "../dto/billing-settings-dto";

export const getBillingSettings = async (
  documentType: BillingDocumentType,
): Promise<BillingSettingsDto> => {
  const { organizationId } = await resolveBillingSettingsContext();
  const settings = await billingSettingsRepository.getSettings(
    organizationId,
    documentType,
  );
  return toBillingSettingsDto(settings);
};

export const getAllBillingSettings = async (): Promise<
  Record<BillingDocumentType, BillingSettingsDto>
> => {
  const { organizationId } = await resolveBillingSettingsContext();
  const allSettings = await billingSettingsRepository.getAllSettings(
    organizationId,
  );

  return {
    INVOICE: toBillingSettingsDto(allSettings.INVOICE),
    DEBIT_NOTE: toBillingSettingsDto(allSettings.DEBIT_NOTE),
    CREDIT_NOTE: toBillingSettingsDto(allSettings.CREDIT_NOTE),
    RECURRING_INVOICE: toBillingSettingsDto(allSettings.RECURRING_INVOICE),
  };
};
