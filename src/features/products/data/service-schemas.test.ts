import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  updateProductSchema,
  productFilterSchema,
} from "./validators/product-schemas";

describe("Service Validation Schemas", () => {
  it("validates a valid service creation payload", () => {
    const input = {
      name: "Full Stack Development Sprint",
      type: "SERVICE",
      sku: "SRV-DEV-01",
      category: "Software Development",
      status: "ACTIVE",
      description: "2-week sprint dedicated to feature implementation",
      sellingPrice: 85000,
      currency: "INR (₹)",
      unit: "JOB",
      hsnSac: "998314",
      taxRate: 18,
      taxPreference: "Taxable",
      internalNotes: "Team allocation: 2 engineers",
    };

    const parsed = createProductSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Full Stack Development Sprint");
      expect(parsed.data.type).toBe("SERVICE");
      expect(parsed.data.sku).toBe("SRV-DEV-01");
      expect(parsed.data.sellingPrice).toBe(85000);
      expect(parsed.data.unit).toBe("JOB");
      expect(parsed.data.hsnSac).toBe("998314");
    }
  });

  it("rejects service creation with missing or too short name", () => {
    const input = {
      name: "S",
      type: "SERVICE",
      sellingPrice: 1000,
      unit: "HRS",
    };

    const parsed = createProductSchema.safeParse(input);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("must be at least 2 characters");
    }
  });

  it("rejects service creation with negative selling price", () => {
    const input = {
      name: "Maintenance Retainer",
      type: "SERVICE",
      sellingPrice: -2500,
      unit: "MONTHS",
    };

    const parsed = createProductSchema.safeParse(input);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("cannot be negative");
    }
  });

  it("rejects invalid SAC code in service schema", () => {
    const input = {
      name: "Legal Consulting",
      type: "SERVICE",
      sellingPrice: 5000,
      unit: "HRS",
      hsnSac: "INVALID_SAC",
    };

    const parsed = createProductSchema.safeParse(input);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("between 2 and 8 digits");
    }
  });

  it("validates partial updates on a service", () => {
    const updateInput = {
      sellingPrice: 95000,
      description: "Updated SLA response time to 2 hours",
      taxRate: 18,
    };

    const parsed = updateProductSchema.safeParse(updateInput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.sellingPrice).toBe(95000);
    }
  });

  it("validates filtering specifically by SERVICE type", () => {
    const filterInput = {
      type: "SERVICE",
      status: "ACTIVE",
      category: "Consulting",
    };

    const parsed = productFilterSchema.safeParse(filterInput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.type).toBe("SERVICE");
    }
  });
});
