"use server";

import { revalidatePath } from "next/cache";
import type { BillingDocumentType } from "../../domain/entities/billing-settings";
import type { AllocatedDocumentNumber } from "../../domain/repositories/billing-settings-repository";
import { resolveBillingSettingsContext } from "../context/billing-settings-context";
import { billingSettingsRepository } from "../../infrastructure/repositories/prisma-billing-settings-repository";
import { updateBillingSettingsSchema } from "../validators/billing-settings-schemas";
import { toBillingSettingsDto } from "../mappers/billing-settings-mappers";
import type {
  BillingSettingsActionResult,
  BillingSettingsDto,
  UpdateBillingSettingsInput,
} from "../dto/billing-settings-dto";

export const updateBillingSettingsAction = async (
  input: UpdateBillingSettingsInput,
): Promise<BillingSettingsActionResult<BillingSettingsDto>> => {
  try {
    const parseResult = updateBillingSettingsSchema.safeParse(input);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const pathKey = issue.path.join(".");
        fieldErrors[pathKey] = issue.message;
      }
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors,
      };
    }

    const { organizationId } = await resolveBillingSettingsContext();
    const data = parseResult.data;

    const saved = await billingSettingsRepository.saveSettings(organizationId, {
      documentType: data.documentType,
      prefix: data.prefix,
      suffix: data.suffix,
      nextNumber: data.nextNumber,
      padding: data.padding,
      defaultNotes: data.defaultNotes,
      defaultTerms: data.defaultTerms,
    });

    revalidatePath("/settings/billing");
    revalidatePath("/invoices/new");
    revalidatePath("/invoices");

    return {
      success: true,
      data: toBillingSettingsDto(saved),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};

export const allocateDocumentNumberAction = async (
  documentType: BillingDocumentType,
): Promise<BillingSettingsActionResult<AllocatedDocumentNumber>> => {
  try {
    const { organizationId } = await resolveBillingSettingsContext();
    const result = await billingSettingsRepository.allocateNextNumber(
      organizationId,
      documentType,
    );

    revalidatePath("/settings/billing");
    revalidatePath("/invoices/new");
    revalidatePath("/invoices");

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};
