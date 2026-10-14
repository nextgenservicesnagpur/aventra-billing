import { z } from "zod";
import {
  validatePrefix,
  validateSuffix,
  validateNextNumber,
  validatePadding,
} from "../../domain/rules/billing-settings-rules";

export const billingDocumentTypeSchema = z.enum([
  "INVOICE",
  "DEBIT_NOTE",
  "CREDIT_NOTE",
  "RECURRING_INVOICE",
]);

export const updateBillingSettingsSchema = z.object({
  documentType: billingDocumentTypeSchema,
  prefix: z
    .string()
    .trim()
    .min(1, "Prefix is required.")
    .max(20, "Prefix cannot exceed 20 characters.")
    .refine(
      (val) => {
        try {
          validatePrefix(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message:
          "Prefix may only contain alphanumeric characters, hyphens, underscores, or slashes.",
      },
    ),
  suffix: z
    .string()
    .trim()
    .max(20, "Suffix cannot exceed 20 characters.")
    .optional()
    .nullable()
    .refine(
      (val) => {
        try {
          validateSuffix(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message:
          "Suffix may only contain alphanumeric characters, hyphens, underscores, or slashes.",
      },
    )
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  nextNumber: z
    .coerce
    .number()
    .int("Sequence number must be an integer.")
    .min(1, "Sequence number must be at least 1.")
    .max(999_999_999, "Sequence number cannot exceed 999,999,999.")
    .refine(
      (val) => {
        try {
          validateNextNumber(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Sequence number must be a valid positive integer." },
    )
    .optional(),
  padding: z
    .coerce
    .number()
    .int("Padding must be an integer.")
    .min(1, "Padding must be at least 1.")
    .max(10, "Padding cannot exceed 10.")
    .default(4)
    .refine(
      (val) => {
        try {
          validatePadding(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Padding must be between 1 and 10 digits." },
    ),
  defaultNotes: z
    .string()
    .trim()
    .max(2000, "Default notes cannot exceed 2000 characters.")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  defaultTerms: z
    .string()
    .trim()
    .max(2000, "Default terms cannot exceed 2000 characters.")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
});
