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

describe("Product Domain Entity & Helpers", () => {
  const dummyProduct: Product = {
    id: "prod_1",
    organizationId: "org_1",
    name: "Logitech MX Master 3S",
    type: "PRODUCT",
    sku: "LOGI-MX3S",
    category: "Hardware",
    status: "ACTIVE",
    description: "Ergonomic wireless mouse",
    sellingPrice: 8999,
    purchasePrice: 6500,
    currency: "INR (₹)",
    unit: "PCS",
    hsnSac: "84716060",
    taxRate: 18,
    taxPreference: "Taxable",
    trackInventory: true,
    reorderPoint: 5,
    internalNotes: "Official Logitech distributor",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummyService: Product = {
    ...dummyProduct,
    id: "serv_1",
    name: "Cloud Architecture Audit",
    type: "SERVICE",
    sku: "SRV-CLOUD-01",
    unit: "HRS",
    hsnSac: "998313",
    trackInventory: false,
    reorderPoint: null,
  };

  it("identifies product vs service item correctly", () => {
    expect(isProductItem(dummyProduct)).toBe(true);
    expect(isServiceItem(dummyProduct)).toBe(false);

    expect(isProductItem(dummyService)).toBe(false);
    expect(isServiceItem(dummyService)).toBe(true);
  });

  it("formats price with Indian Rupee formatting by default", () => {
    const formatted = formatProductPrice(8999, "INR (₹)");
    expect(formatted).toContain("8,999.00");
  });

  it("formats USD currency when requested", () => {
    const formatted = formatProductPrice(120, "USD ($)");
    expect(formatted).toContain("120.00");
  });
});

describe("Product Domain Rules", () => {
  it("validates valid product names", () => {
    expect(validateProductName("Accounting Software")).toBe("Accounting Software");
    expect(validateProductName("  Trimmed Name  ")).toBe("Trimmed Name");
  });

  it("throws for names shorter than 2 characters", () => {
    expect(() => validateProductName("A")).toThrow(ProductDomainError);
    expect(() => validateProductName("   ")).toThrow(ProductDomainError);
  });

  it("validates non-negative product prices", () => {
    expect(validateProductPrice(0)).toBe(0);
    expect(validateProductPrice(199.99)).toBe(199.99);
    expect(validateProductPrice(199.999)).toBe(200);
  });

  it("rejects negative or NaN prices", () => {
    expect(() => validateProductPrice(-10)).toThrow(InvalidProductPriceError);
    expect(() => validateProductPrice(NaN)).toThrow(InvalidProductPriceError);
  });

  it("normalizes SKU codes to uppercase and trims whitespace", () => {
    expect(normalizeSku("  sku-1234  ")).toBe("SKU-1234");
    expect(normalizeSku(null)).toBeNull();
    expect(normalizeSku("")).toBeNull();
  });

  it("validates HSN/SAC codes (2 to 8 digits)", () => {
    expect(validateHsnSac("8471")).toBe(true);
    expect(validateHsnSac("84713010")).toBe(true);
    expect(validateHsnSac("998313")).toBe(true);
    expect(validateHsnSac(null)).toBe(true); // optional
    expect(validateHsnSac("")).toBe(true);

    expect(validateHsnSac("1")).toBe(false); // too short
    expect(validateHsnSac("123456789")).toBe(false); // too long
    expect(validateHsnSac("ABC1234")).toBe(false); // letters not allowed
  });

  it("exports standard tax rates and units", () => {
    expect(STANDARD_TAX_RATES).toContain(18);
    expect(STANDARD_TAX_RATES).toContain(0);
    expect(STANDARD_UNITS).toContain("PCS");
    expect(STANDARD_UNITS).toContain("HRS");
  });
});
