import { ProductDomainError, InvalidProductPriceError } from "../errors/product-errors";

export const STANDARD_TAX_RATES = [0, 5, 12, 18, 28] as const;

export const STANDARD_UNITS = [
  "PCS",
  "NOS",
  "KGS",
  "MTR",
  "BOX",
  "SET",
  "HRS",
  "DAYS",
  "MONTHS",
  "VISIT",
  "JOB",
] as const;

export const STANDARD_CATEGORIES = [
  "General",
  "Hardware",
  "Software",
  "Consulting",
  "Maintenance",
  "Subscription",
  "Logistics",
  "Office Supplies",
] as const;

export const validateProductName = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw new ProductDomainError("Product name must be at least 2 characters.");
  }
  if (trimmed.length > 255) {
    throw new ProductDomainError("Product name cannot exceed 255 characters.");
  }
  return trimmed;
};

export const validateProductPrice = (price: number): number => {
  if (Number.isNaN(price) || price < 0) {
    throw new InvalidProductPriceError("Price must be a valid non-negative number.");
  }
  return Math.round(price * 100) / 100;
};

export const normalizeSku = (sku?: string | null): string | null => {
  if (!sku) return null;
  const trimmed = sku.trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : null;
};

export const validateHsnSac = (code?: string | null): boolean => {
  if (!code || code.trim().length === 0) return true;
  const digitsOnly = code.trim().replace(/\s+/g, "");
  return /^\d{2,8}$/.test(digitsOnly);
};
