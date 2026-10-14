export type ProductType = "PRODUCT" | "SERVICE";

export type ProductStatus = "ACTIVE" | "INACTIVE";

export type Product = {
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
  createdAt: Date;
  updatedAt: Date;
};

export const isProductItem = (p: Product): boolean => p.type === "PRODUCT";

export const isServiceItem = (p: Product): boolean => p.type === "SERVICE";

export const formatProductPrice = (price: number, currency: string = "INR (₹)"): string => {
  const isINR = currency.includes("INR") || currency.includes("₹");
  return new Intl.NumberFormat(isINR ? "en-IN" : "en-US", {
    style: "currency",
    currency: isINR ? "INR" : "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};
