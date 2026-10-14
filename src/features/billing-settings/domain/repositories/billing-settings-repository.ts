import type {
  BillingDocumentType,
  BillingSettings,
} from "../entities/billing-settings";

export type SaveBillingSettingsInput = {
  documentType: BillingDocumentType;
  prefix?: string;
  suffix?: string | null;
  nextNumber?: number;
  padding?: number;
  defaultNotes?: string | null;
  defaultTerms?: string | null;
};

export type AllocatedDocumentNumber = {
  allocatedNumber: string;
  nextNumber: number;
};

export interface IBillingSettingsRepository {
  /**
   * Retrieves billing settings for a specific document type within an organization.
   * If no setting exists yet, returns initialized default settings.
   */
  getSettings(
    organizationId: string,
    documentType: BillingDocumentType,
    tx?: unknown,
  ): Promise<BillingSettings>;

  /**
   * Retrieves all 4 document type settings for an organization simultaneously.
   */
  getAllSettings(
    organizationId: string,
    tx?: unknown,
  ): Promise<Record<BillingDocumentType, BillingSettings>>;

  /**
   * Persists or updates billing settings for a document type.
   */
  saveSettings(
    organizationId: string,
    input: SaveBillingSettingsInput,
    tx?: unknown,
  ): Promise<BillingSettings>;

  /**
   * Concurrency-safe atomic document number allocation using database transactions.
   * Returns the allocated formatted number and advances the sequence.
   */
  allocateNextNumber(
    organizationId: string,
    documentType: BillingDocumentType,
    tx?: unknown,
  ): Promise<AllocatedDocumentNumber>;
}
