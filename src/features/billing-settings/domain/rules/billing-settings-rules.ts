import type {
  BillingDocumentType,
  DocumentNumberComponents,
} from "../entities/billing-settings";
import {
  InvalidNumberFormatError,
  BillingSettingsDomainError,
} from "../errors/billing-settings-errors";

export const DEFAULT_DOCUMENT_CONFIGS: Record<
  BillingDocumentType,
  {
    prefix: string;
    suffix: string | null;
    nextNumber: number;
    padding: number;
    defaultNotes: string | null;
    defaultTerms: string | null;
    label: string;
    description: string;
  }
> = {
  INVOICE: {
    prefix: "INV-",
    suffix: null,
    nextNumber: 1,
    padding: 4,
    defaultNotes: "Thank you for your business. Please remit payment by the due date.",
    defaultTerms: "Payment is due according to the agreed payment terms. Interest of 1.5% per month applies on overdue balances.",
    label: "Invoice",
    description: "Standard sales invoice issued to clients and customers.",
  },
  DEBIT_NOTE: {
    prefix: "DN-",
    suffix: null,
    nextNumber: 1,
    padding: 4,
    defaultNotes: "Debit note issued in accordance with GST compliance guidelines.",
    defaultTerms: "Adjustable against future billing or payable within 15 days.",
    label: "Debit Note",
    description: "Issued for additional charges or value increments on issued invoices.",
  },
  CREDIT_NOTE: {
    prefix: "CN-",
    suffix: null,
    nextNumber: 1,
    padding: 4,
    defaultNotes: "Credit note issued for returned goods or billing correction.",
    defaultTerms: "Credit amount will be adjusted against subsequent invoices or refunded upon request.",
    label: "Credit Note",
    description: "Issued for invoice adjustments, price discounts, or sales returns.",
  },
  RECURRING_INVOICE: {
    prefix: "REC-",
    suffix: null,
    nextNumber: 1,
    padding: 4,
    defaultNotes: "Recurring billing profile for ongoing subscription or retainer services.",
    defaultTerms: "Automated recurring billing schedule. Generated invoices follow active contract terms.",
    label: "Recurring Invoice",
    description: "Template numbering and defaults for automated periodic billing schedules.",
  },
};

/**
 * Pure domain formatter that renders a human-readable document number
 * based on prefix, sequence number, minimum zero-padding, and optional suffix.
 *
 * Example: { prefix: "INV-", nextNumber: 1, padding: 4 } => "INV-0001"
 * Example: { prefix: "DN-", nextNumber: 42, padding: 5, suffix: "/26" } => "DN-00042/26"
 */
export const formatDocumentNumber = (
  components: DocumentNumberComponents,
): string => {
  const prefix = (components.prefix || "").trim();
  const nextNum = Math.floor(components.nextNumber);
  const padding = Math.max(1, Math.min(10, components.padding || 4));
  const suffix = (components.suffix || "").trim();

  if (isNaN(nextNum) || nextNum < 1) {
    throw new InvalidNumberFormatError("Sequence number must be a positive integer greater than or equal to 1.");
  }

  const paddedNumber = String(nextNum).padStart(padding, "0");
  return `${prefix}${paddedNumber}${suffix ? suffix : ""}`;
};

/**
 * Validates document number prefix.
 */
export const validatePrefix = (prefix: string): string => {
  const trimmed = prefix.trim();
  if (trimmed.length === 0) {
    throw new InvalidNumberFormatError("Number prefix cannot be empty.");
  }
  if (trimmed.length > 20) {
    throw new InvalidNumberFormatError("Number prefix cannot exceed 20 characters.");
  }
  const validPattern = /^[A-Za-z0-9\-_/]+$/;
  if (!validPattern.test(trimmed)) {
    throw new InvalidNumberFormatError("Number prefix may only contain letters, numbers, hyphens, underscores, or slashes.");
  }
  return trimmed;
};

/**
 * Validates document number suffix.
 */
export const validateSuffix = (suffix?: string | null): string | null => {
  if (!suffix) return null;
  const trimmed = suffix.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > 20) {
    throw new InvalidNumberFormatError("Number suffix cannot exceed 20 characters.");
  }
  const validPattern = /^[A-Za-z0-9\-_/]+$/;
  if (!validPattern.test(trimmed)) {
    throw new InvalidNumberFormatError("Number suffix may only contain letters, numbers, hyphens, underscores, or slashes.");
  }
  return trimmed;
};

/**
 * Validates sequence next number.
 */
export const validateNextNumber = (num: number): number => {
  if (!Number.isSafeInteger(num) || num < 1 || num > 999_999_999) {
    throw new InvalidNumberFormatError("Sequence number must be a valid integer between 1 and 999,999,999.");
  }
  return num;
};

/**
 * Validates padding digits.
 */
export const validatePadding = (padding: number): number => {
  if (!Number.isInteger(padding) || padding < 1 || padding > 10) {
    throw new InvalidNumberFormatError("Number padding must be an integer between 1 and 10.");
  }
  return padding;
};

/**
 * Validates default notes length.
 */
export const validateDefaultNotes = (notes?: string | null): string | null => {
  if (!notes) return null;
  const trimmed = notes.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > 2000) {
    throw new BillingSettingsDomainError("Default notes cannot exceed 2000 characters.");
  }
  return trimmed;
};

/**
 * Validates default terms length.
 */
export const validateDefaultTerms = (terms?: string | null): string | null => {
  if (!terms) return null;
  const trimmed = terms.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > 2000) {
    throw new BillingSettingsDomainError("Default terms & conditions cannot exceed 2000 characters.");
  }
  return trimmed;
};
