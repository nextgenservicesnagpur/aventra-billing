import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  updateProductSchema,
} from "./product-schemas";

describe("Product Zod Schemas Validation", () => {
  it("validates a complete valid product input", () => {
    const input = {
      name: "Dell PowerEdge Server",
      type: "PRODUCT",
      sku: "DELL-PE-R750",
      category: "Hardware",
      status: "ACTIVE",
      description: "2U Rack Server",
      sellingPrice: 350000,
      purchasePrice: 280000,
      currency: "INR (₹)",
      unit: "PCS",
      hsnSac: "84715000",
      taxRate: 18,
      taxPreference: "Taxable",
      trackInventory: true,
      reorderPoint: 2,
      internalNotes: "Tier 1 supplier partner",
    };

    const result = createProductSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sku).toBe("DELL-PE-R750");
      expect(result.data.sellingPrice).toBe(350000);
      expect(result.data.trackInventory).toBe(true);
    }
  });

  it("validates a complete valid service input", () => {
    const input = {
      name: "Software Consulting",
      type: "SERVICE",
      sku: "SRV-CONSULT",
      unit: "HRS",
      sellingPrice: 4500,
      hsnSac: "998313",
      taxRate: 18,
    };

    const result = createProductSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("SERVICE");
      expect(result.data.unit).toBe("HRS");
      expect(result.data.sellingPrice).toBe(4500);
    }
  });

  it("fails when name is less than 2 characters", () => {
    const input = {
      name: "X",
      sellingPrice: 100,
    };

    const result = createProductSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("name"));
      expect(issue).toBeDefined();
      expect(issue?.message).toContain("at least 2 characters");
    }
  });

  it("fails when sellingPrice is negative", () => {
    const input = {
      name: "Network Cable",
      sellingPrice: -50,
    };

    const result = createProductSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("sellingPrice"));
      expect(issue).toBeDefined();
      expect(issue?.message).toContain("cannot be negative");
    }
  });

  it("fails when HSN/SAC format is invalid", () => {
    const input = {
      name: "Office Chair",
      sellingPrice: 4500,
      hsnSac: "ABC1234",
    };

    const result = createProductSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("hsnSac"));
      expect(issue).toBeDefined();
    }
  });

  it("allows partial updates via updateProductSchema", () => {
    const updateInput = {
      sellingPrice: 4999,
      status: "INACTIVE" as const,
    };

    const result = updateProductSchema.safeParse(updateInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sellingPrice).toBe(4999);
      expect(result.data.status).toBe("INACTIVE");
    }
  });
});
