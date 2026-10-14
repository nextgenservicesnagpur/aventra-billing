import { describe, it, expect } from "vitest";
import { toDomainProduct } from "./prisma-product-mapper";
import type { Product as PrismaProduct } from "@/generated/prisma/client";

describe("PrismaProductMapper", () => {
  it("maps a Prisma product record to domain Product entity correctly", () => {
    const rawRow = {
      id: "prod_123",
      organizationId: "org_abc",
      name: "Ergonomic Keyboard",
      type: "PRODUCT",
      sku: "KB-ERG-01",
      category: "Hardware",
      status: "ACTIVE",
      description: "Split mechanical keyboard",
      sellingPrice: 12500 as unknown,
      purchasePrice: 9000 as unknown,
      currency: "INR (₹)",
      unit: "PCS",
      hsnSac: "84716060",
      taxRate: 18 as unknown,
      taxPreference: "Taxable",
      trackInventory: true,
      reorderPoint: 10 as unknown,
      internalNotes: "Vendor lead time 3 weeks",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    } as PrismaProduct;

    const domain = toDomainProduct(rawRow);

    expect(domain.id).toBe("prod_123");
    expect(domain.name).toBe("Ergonomic Keyboard");
    expect(domain.type).toBe("PRODUCT");
    expect(domain.sellingPrice).toBe(12500);
    expect(domain.purchasePrice).toBe(9000);
    expect(domain.taxRate).toBe(18);
    expect(domain.reorderPoint).toBe(10);
    expect(domain.trackInventory).toBe(true);
  });

  it("handles null purchasePrice and reorderPoint correctly", () => {
    const rawRow = {
      id: "srv_456",
      organizationId: "org_abc",
      name: "Cybersecurity Assessment",
      type: "SERVICE",
      sku: null,
      category: null,
      status: "ACTIVE",
      description: null,
      sellingPrice: 75000 as unknown,
      purchasePrice: null,
      currency: "INR (₹)",
      unit: "JOB",
      hsnSac: "998315",
      taxRate: 18 as unknown,
      taxPreference: "Taxable",
      trackInventory: false,
      reorderPoint: null,
      internalNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PrismaProduct;

    const domain = toDomainProduct(rawRow);

    expect(domain.id).toBe("srv_456");
    expect(domain.purchasePrice).toBeNull();
    expect(domain.reorderPoint).toBeNull();
    expect(domain.sku).toBeNull();
    expect(domain.trackInventory).toBe(false);
  });
});
