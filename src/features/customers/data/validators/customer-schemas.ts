import { z } from "zod";
import {
  isGstinRequired,
  isValidGstinFormat,
  isValidPanFormat,
  derivePanFromGstin,
} from "../../domain/rules/customer-rules";

const customerTypeSchema = z.enum(["BUSINESS", "INDIVIDUAL"]);

const gstTreatmentSchema = z.enum([
  "REGISTERED_BUSINESS_REGULAR",
  "CONSUMER_UNREGISTERED",
  "OVERSEAS_EXPORT",
  "SPECIAL_ECONOMIC_ZONE",
  "DEEMED_EXPORT",
  "COMPOSITION_SCHEME",
]);

const customerStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

const addressSchema = z.object({
  addressLine1: z.string().trim().min(1, "Address Line 1 is required.").max(255),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(1, "City is required.").max(100),
  state: z.string().trim().min(1, "State is required.").max(100),
  pinCode: z.string().trim().min(1, "PIN code is required.").max(20),
  country: z.string().trim().min(1, "Country is required.").max(100).default("India"),
});

export const baseCustomerSchema = z.object({
  name: z.string().trim().min(2, "Customer name must be at least 2 characters.").max(150),
  customerType: customerTypeSchema.default("BUSINESS"),
  gstTreatment: gstTreatmentSchema.default("REGISTERED_BUSINESS_REGULAR"),
  status: customerStatusSchema.default("ACTIVE"),
  contactPerson: z.string().trim().max(100).optional().nullable(),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(255)
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(25)
    .optional()
    .nullable()
    .or(z.literal("")),
  alternatePhone: z
    .string()
    .trim()
    .max(25)
    .optional()
    .nullable()
    .or(z.literal("")),
  billingAddress: addressSchema,
  shippingAddress: addressSchema.optional().nullable(),
  sameAsBillingAddress: z.boolean().default(true),
  gstin: z.string().trim().max(20).optional().nullable().or(z.literal("")),
  pan: z.string().trim().max(15).optional().nullable().or(z.literal("")),
  currency: z.string().trim().max(10).default("INR (₹)"),
  placeOfSupply: z.string().trim().max(100).default("27-Maharashtra"),
  paymentTerms: z.string().trim().max(50).default("Net 15 days"),
  creditLimit: z.number().min(0, "Credit limit cannot be negative.").optional().nullable(),
  defaultDiscount: z
    .number()
    .min(0, "Discount cannot be negative.")
    .max(100, "Discount cannot exceed 100%.")
    .optional()
    .nullable(),
  defaultTaxPreference: z.string().trim().max(50).default("18% (IGST)"),
  priceList: z.string().trim().max(100).default("Default Price List"),
  internalNotes: z.string().trim().max(2000).optional().nullable(),
  tags: z.array(z.string().trim().max(50)).default([]),
});

export const createCustomerSchema = baseCustomerSchema
  .refine(
    (data) => {
      const gstin = data.gstin?.replace(/\s+/g, "").toUpperCase();
      if (data.gstTreatment && isGstinRequired(data.gstTreatment)) {
        return Boolean(gstin && gstin.length > 0);
      }
      return true;
    },
    {
      message: "GSTIN is required for registered businesses.",
      path: ["gstin"],
    },
  )
  .refine(
    (data) => {
      const gstin = data.gstin?.replace(/\s+/g, "").toUpperCase();
      if (gstin && gstin.length > 0) {
        return isValidGstinFormat(gstin);
      }
      return true;
    },
    {
      message: "GSTIN must be a valid 15-character format (e.g., 27AABCG9912D1Z9).",
      path: ["gstin"],
    },
  )
  .refine(
    (data) => {
      const pan = data.pan?.replace(/\s+/g, "").toUpperCase();
      if (pan && pan.length > 0) {
        return isValidPanFormat(pan);
      }
      return true;
    },
    {
      message: "PAN must be a valid 10-character code (e.g., AABCG9912D).",
      path: ["pan"],
    },
  )
  .refine(
    (data) => {
      const gstin = data.gstin?.replace(/\s+/g, "").toUpperCase();
      const pan = data.pan?.replace(/\s+/g, "").toUpperCase();
      if (gstin && isValidGstinFormat(gstin) && pan && pan.length > 0) {
        const derived = derivePanFromGstin(gstin);
        if (derived && derived !== pan) {
          return false;
        }
      }
      return true;
    },
    {
      message: "PAN must match the PAN embedded in the GSTIN.",
      path: ["pan"],
    },
  );

export const updateCustomerSchema = baseCustomerSchema.partial();

export const customerFilterSchema = z.object({
  query: z.string().trim().max(100).optional(),
  customerType: z.enum(["ALL", "BUSINESS", "INDIVIDUAL"]).default("ALL"),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(8),
});
