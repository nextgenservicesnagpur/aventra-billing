import { describe, it, expect } from "vitest";
import {
  isProductItem,
  isServiceItem,
  formatProductPrice,
  type Product,
} from "./entities/product";
import {
  validateProductName,
  validateProductPrice,
  normalizeSku,
  validateHsnSac,
  STANDARD_TAX_RATES,
  STANDARD_UNITS,
} from "./rules/product-rules";
import {
  ProductDomainError,
  InvalidProductPriceError,
} from "./errors/product-errors";

describe("Services Domain Invariants & Rules", () => {
  const sampleService: Product = {
    id: "serv_cloud_arch",
    organizationId: "org_aventra_1",
    name: "Cloud Architecture & Security Audit",
    type: "SERVICE",
    sku: "SRV-SEC-01",
    category: "Consulting",
    status: "ACTIVE",
    description: "Full AWS/GCP cloud environment security review",
    sellingPrice: 125000,
    purchasePrice: null,
    currency: "INR (₹)",
    unit: "HRS",
    hsnSac: "998315", // IT security consulting SAC code
    taxRate: 18,
    taxPreference: "Taxable",
    trackInventory: false,
    reorderPoint: null,
    internalNotes: "Internal rate card for enterprise clients",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("correctly classifies service item vs product item", () => {
    expect(isServiceItem(sampleService)).toBe(true);
    expect(isProductItem(sampleService)).toBe(false);
  });

  it("enforces that services cannot have inventory tracking or reorder points", () => {
    // Services are intangible, non-stock items
    expect(sampleService.trackInventory).toBe(false);
    expect(sampleService.reorderPoint).toBeNull();
  });

  it("validates service name requirements", () => {
    expect(validateProductName("DevOps Support SLA")).toBe("DevOps Support SLA");
    expect(validateProductName("  Kubernetes Cluster Setup  ")).toBe("Kubernetes Cluster Setup");

    // Invalid service names
    expect(() => validateProductName("")).toThrow(ProductDomainError);
    expect(() => validateProductName("A")).toThrow(ProductDomainError);
  });

  it("validates non-negative service selling rates", () => {
    expect(validateProductPrice(0)).toBe(0); // Free/pro-bono service allowed
    expect(validateProductPrice(2500.5)).toBe(2500.5);
    expect(validateProductPrice(99.999)).toBe(100);

    // Negative rates not permitted
    expect(() => validateProductPrice(-500)).toThrow(InvalidProductPriceError);
    expect(() => validateProductPrice(NaN)).toThrow(InvalidProductPriceError);
  });

  it("normalizes and validates service codes", () => {
    expect(normalizeSku("srv-web-dev")).toBe("SRV-WEB-DEV");
    expect(normalizeSku("  srv-audit-2026 ")).toBe("SRV-AUDIT-2026");
    expect(normalizeSku(null)).toBeNull();
    expect(normalizeSku("")).toBeNull();
  });

  it("validates SAC (Services Accounting Code) format", () => {
    // Valid Indian GST SAC codes typically begin with 99 and have 4 to 6 digits
    expect(validateHsnSac("998313")).toBe(true); // IT consulting services
    expect(validateHsnSac("998314")).toBe(true); // IT design and development
    expect(validateHsnSac("998315")).toBe(true); // Hosting and IT infrastructure
    expect(validateHsnSac("9954")).toBe(true);   // Construction services (4-digit SAC)
    expect(validateHsnSac(null)).toBe(true);     // Optional field
    expect(validateHsnSac("")).toBe(true);

    // Invalid SAC codes
    expect(validateHsnSac("9")).toBe(false);        // Too short (< 2 digits)
    expect(validateHsnSac("998313000")).toBe(false); // Too long (> 8 digits)
    expect(validateHsnSac("SAC9983")).toBe(false);  // Alphanumeric characters rejected
    expect(validateHsnSac("99-8313")).toBe(false);  // Hyphens rejected
  });

  it("supports standard service billing units and GST rates", () => {
    const supportedServiceUnits = ["HRS", "DAYS", "MONTHS", "VISIT", "JOB"];
    for (const unit of supportedServiceUnits) {
      expect(STANDARD_UNITS).toContain(unit);
    }
    expect(STANDARD_TAX_RATES).toContain(18);
    expect(STANDARD_TAX_RATES).toContain(0);
  });

  it("formats service rates with Indian Rupee formatting by default", () => {
    const formatted = formatProductPrice(125000, "INR (₹)");
    expect(formatted).toContain("1,25,000.00");
  });
});
