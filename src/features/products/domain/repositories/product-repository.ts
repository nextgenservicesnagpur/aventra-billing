import type { Product, ProductType, ProductStatus } from "../entities/product";

export type ProductListFilter = {
  type?: ProductType | "ALL";
  status?: ProductStatus | "ALL";
  category?: string | "ALL";
  query?: string;
  limit?: number;
  offset?: number;
};

export type ProductListResult = {
  products: Product[];
  totalCount: number;
};

export interface IProductRepository {
  findById(organizationId: string, id: string): Promise<Product | null>;
  list(organizationId: string, filter?: ProductListFilter): Promise<ProductListResult>;
  create(product: Product): Promise<Product>;
  update(organizationId: string, id: string, patch: Partial<Product>): Promise<Product>;
  delete(organizationId: string, id: string): Promise<void>;
  findBySku(organizationId: string, sku: string): Promise<Product | null>;
}
