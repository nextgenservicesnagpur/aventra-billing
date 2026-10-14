import type { Product as PrismaProduct } from "@/generated/prisma/client";
import type { Product, ProductType, ProductStatus } from "../../domain/entities/product";

export const toDomainProduct = (row: PrismaProduct): Product => ({
  id: row.id,
  organizationId: row.organizationId,
  name: row.name,
  type: row.type as ProductType,
  sku: row.sku,
  category: row.category,
  status: row.status as ProductStatus,
  description: row.description,
  sellingPrice: Number(row.sellingPrice),
  purchasePrice: row.purchasePrice !== null ? Number(row.purchasePrice) : null,
  currency: row.currency,
  unit: row.unit,
  hsnSac: row.hsnSac,
  taxRate: Number(row.taxRate),
  taxPreference: row.taxPreference,
  trackInventory: row.trackInventory,
  reorderPoint: row.reorderPoint !== null ? Number(row.reorderPoint) : null,
  internalNotes: row.internalNotes,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
