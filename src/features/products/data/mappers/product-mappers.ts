import type { Product } from "../../domain/entities/product";
import type { ProductDto } from "../dto/product-dto";

export const toProductDto = (p: Product): ProductDto => ({
  id: p.id,
  organizationId: p.organizationId,
  name: p.name,
  type: p.type,
  sku: p.sku ?? null,
  category: p.category ?? null,
  status: p.status,
  description: p.description ?? null,
  sellingPrice: p.sellingPrice,
  purchasePrice: p.purchasePrice ?? null,
  currency: p.currency,
  unit: p.unit,
  hsnSac: p.hsnSac ?? null,
  taxRate: p.taxRate,
  taxPreference: p.taxPreference,
  trackInventory: p.trackInventory,
  reorderPoint: p.reorderPoint ?? null,
  internalNotes: p.internalNotes ?? null,
  createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
});
