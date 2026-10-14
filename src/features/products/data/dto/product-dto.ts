import type { ProductType, ProductStatus } from "../../domain/entities/product";

export type ProductDto = {
  id: string;
  organizationId: string;
  name: string;
  type: ProductType;
  sku?: string | null;
  category?: string | null;
  status: ProductStatus;
  description?: string | null;
  sellingPrice: number;
  purchasePrice?: number | null;
  currency: string;
  unit: string;
  hsnSac?: string | null;
  taxRate: number;
  taxPreference: string;
  trackInventory: boolean;
  reorderPoint?: number | null;
  internalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  type: ProductType;
  sku?: string | null;
  category?: string | null;
  status?: ProductStatus;
  description?: string | null;
  sellingPrice: number;
  purchasePrice?: number | null;
  currency?: string;
  unit?: string;
  hsnSac?: string | null;
  taxRate?: number;
  taxPreference?: string;
  trackInventory?: boolean;
  reorderPoint?: number | null;
  internalNotes?: string | null;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type ProductFilterInput = {
  type?: ProductType | "ALL";
  status?: ProductStatus | "ALL";
  category?: string | "ALL";
  query?: string;
  limit?: number;
  offset?: number;
};

export type ProductActionResult<T = ProductDto> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
};

