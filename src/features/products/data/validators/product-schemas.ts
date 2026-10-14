import { z } from "zod";
import { normalizeSku, validateHsnSac } from "../../domain/rules/product-rules";

const productTypeSchema = z.enum(["PRODUCT", "SERVICE"]);
const productStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product/Service name must be at least 2 characters.")
    .max(255, "Name cannot exceed 255 characters."),
  type: productTypeSchema.default("PRODUCT"),
  sku: z
    .string()
    .trim()
    .max(100, "SKU cannot exceed 100 characters.")
    .optional()
    .nullable()
    .transform((val) => normalizeSku(val)),
  category: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  status: productStatusSchema.default("ACTIVE"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters.")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  sellingPrice: z
    .coerce
    .number()
    .min(0, "Selling price cannot be negative."),
  purchasePrice: z
    .coerce
    .number()
    .min(0, "Purchase price cannot be negative.")
    .optional()
    .nullable(),
  currency: z.string().trim().default("INR (₹)"),
  unit: z.string().trim().min(1, "Unit of measurement is required.").default("PCS"),
  hsnSac: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .refine((val) => validateHsnSac(val), {
      message: "HSN/SAC code must be between 2 and 8 digits.",
    })
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  taxRate: z
    .coerce
    .number()
    .min(0, "Tax rate cannot be negative.")
    .max(100, "Tax rate cannot exceed 100%.")
    .default(18),
  taxPreference: z.string().trim().default("Taxable"),
  trackInventory: z.boolean().default(false),
  reorderPoint: z
    .coerce
    .number()
    .min(0, "Reorder point cannot be negative.")
    .optional()
    .nullable(),
  internalNotes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
});

export const updateProductSchema = createProductSchema.partial();

export const productFilterSchema = z.object({
  type: z.enum(["PRODUCT", "SERVICE", "ALL"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ALL"]).optional(),
  category: z.string().optional(),
  query: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});
