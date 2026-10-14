import type { BillingDocumentType } from "../../domain/entities/billing-settings";

export type BillingSettingsDto = {
  id: string;
  organizationId: string;
  documentType: BillingDocumentType;
  prefix: string;
  suffix: string | null;
  nextNumber: number;
  padding: number;
  defaultNotes: string | null;
  defaultTerms: string | null;
  previewNumber: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateBillingSettingsInput = {
  documentType: BillingDocumentType;
  prefix: string;
  suffix?: string | null;
  nextNumber?: number;
  padding: number;
  defaultNotes?: string | null;
  defaultTerms?: string | null;
};

export type BillingSettingsActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
