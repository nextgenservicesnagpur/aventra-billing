import "server-only";

import { getPrisma } from "@/shared/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Product } from "../../domain/entities/product";
import type { IProductRepository, ProductListFilter, ProductListResult } from "../../domain/repositories/product-repository";
import { toDomainProduct } from "../mappers/prisma-product-mapper";
import { DuplicateSkuError, ProductNotFoundError } from "../../domain/errors/product-errors";

export class PrismaProductRepository implements IProductRepository {
  async findById(organizationId: string, id: string): Promise<Product | null> {
    const prisma = getPrisma();
    const row = await prisma.product.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!row) return null;
    return toDomainProduct(row);
  }

  async findBySku(organizationId: string, sku: string): Promise<Product | null> {
    const prisma = getPrisma();
    const row = await prisma.product.findFirst({
      where: {
        organizationId,
        sku: {
          equals: sku,
          mode: "insensitive",
        },
      },
    });

    if (!row) return null;
    return toDomainProduct(row);
  }

  async list(organizationId: string, filter?: ProductListFilter): Promise<ProductListResult> {
    const prisma = getPrisma();
    const where: Prisma.ProductWhereInput = {
      organizationId,
    };

    if (filter?.type && filter.type !== "ALL") {
      where.type = filter.type;
    }

    if (filter?.status && filter.status !== "ALL") {
      where.status = filter.status;
    }

    if (filter?.category && filter.category !== "ALL") {
      where.category = filter.category;
    }

    if (filter?.query && filter.query.trim().length > 0) {
      const q = filter.query.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { hsnSac: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [rows, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: filter?.offset ?? 0,
        take: filter?.limit ?? 50,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: rows.map(toDomainProduct),
      totalCount,
    };
  }

  async create(product: Product): Promise<Product> {
    const prisma = getPrisma();

    if (product.sku) {
      const existing = await this.findBySku(product.organizationId, product.sku);
      if (existing) {
        throw new DuplicateSkuError(product.sku);
      }
    }

    try {
      const row = await prisma.product.create({
        data: {
          id: product.id,
          organizationId: product.organizationId,
          name: product.name,
          type: product.type,
          sku: product.sku,
          category: product.category,
          status: product.status,
          description: product.description,
          sellingPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice ?? null,
          currency: product.currency,
          unit: product.unit,
          hsnSac: product.hsnSac,
          taxRate: product.taxRate,
          taxPreference: product.taxPreference,
          trackInventory: product.trackInventory,
          reorderPoint: product.reorderPoint ?? null,
          internalNotes: product.internalNotes,
        },
      });

      return toDomainProduct(row);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        throw new DuplicateSkuError(product.sku ?? "");
      }
      throw err;
    }
  }

  async update(organizationId: string, id: string, patch: Partial<Product>): Promise<Product> {
    const prisma = getPrisma();

    const existing = await this.findById(organizationId, id);
    if (!existing) {
      throw new ProductNotFoundError(id);
    }

    if (patch.sku && patch.sku !== existing.sku) {
      const duplicate = await this.findBySku(organizationId, patch.sku);
      if (duplicate && duplicate.id !== id) {
        throw new DuplicateSkuError(patch.sku);
      }
    }

    try {
      const data: Prisma.ProductUpdateInput = {};

      if (patch.name !== undefined) data.name = patch.name;
      if (patch.type !== undefined) data.type = patch.type;
      if (patch.sku !== undefined) data.sku = patch.sku;
      if (patch.category !== undefined) data.category = patch.category;
      if (patch.status !== undefined) data.status = patch.status;
      if (patch.description !== undefined) data.description = patch.description;
      if (patch.sellingPrice !== undefined) data.sellingPrice = patch.sellingPrice;
      if (patch.purchasePrice !== undefined) data.purchasePrice = patch.purchasePrice ?? null;
      if (patch.currency !== undefined) data.currency = patch.currency;
      if (patch.unit !== undefined) data.unit = patch.unit;
      if (patch.hsnSac !== undefined) data.hsnSac = patch.hsnSac;
      if (patch.taxRate !== undefined) data.taxRate = patch.taxRate;
      if (patch.taxPreference !== undefined) data.taxPreference = patch.taxPreference;
      if (patch.trackInventory !== undefined) data.trackInventory = patch.trackInventory;
      if (patch.reorderPoint !== undefined) data.reorderPoint = patch.reorderPoint ?? null;
      if (patch.internalNotes !== undefined) data.internalNotes = patch.internalNotes;

      const row = await prisma.product.update({
        where: { id },
        data,
      });

      return toDomainProduct(row);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        throw new DuplicateSkuError(patch.sku ?? "");
      }
      throw err;
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const prisma = getPrisma();
    const existing = await this.findById(organizationId, id);
    if (!existing) {
      throw new ProductNotFoundError(id);
    }

    await prisma.product.delete({
      where: { id },
    });
  }
}

export const productRepository = new PrismaProductRepository();

