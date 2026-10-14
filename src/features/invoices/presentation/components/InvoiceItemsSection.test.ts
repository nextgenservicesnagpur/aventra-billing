import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { InvoiceItemsSection } from "./InvoiceItemsSection";
import type { InvoiceLineItem } from "../../domain/invoice";
import type { ProductDto } from "@/features/products/data/dto/product-dto";

const testLineItems: InvoiceLineItem[] = [
  {
    id: "line-1",
    item: "Cloud Consultation",
    description: "Architecture review",
    hsnSac: "998313",
    quantity: 2,
    unitPrice: 5000,
    discount: 0,
    taxRate: 18,
  },
];

const liveProducts: ProductDto[] = [
  {
    id: "prod-101",
    organizationId: "org-1",
    name: "Enterprise Database License",
    type: "PRODUCT",
    sku: "DB-LIC-01",
    category: "Software",
    status: "ACTIVE",
    description: "Annual per-core license",
    sellingPrice: 120000,
    purchasePrice: 90000,
    currency: "INR (₹)",
    unit: "PCS",
    hsnSac: "997331",
    taxRate: 18,
    taxPreference: "Taxable",
    trackInventory: false,
    reorderPoint: null,
    internalNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "srv-202",
    organizationId: "org-1",
    name: "DevOps Pipeline Implementation",
    type: "SERVICE",
    sku: "SRV-DEVOPS",
    category: "Consulting",
    status: "ACTIVE",
    description: "CI/CD setup and hardening",
    sellingPrice: 85000,
    purchasePrice: null,
    currency: "INR (₹)",
    unit: "JOB",
    hsnSac: "998313",
    taxRate: 18,
    taxPreference: "Taxable",
    trackInventory: false,
    reorderPoint: null,
    internalNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("InvoiceItemsSection Integration", () => {
  it("renders live catalogue options when availableProducts are provided", () => {
    const html = renderToStaticMarkup(
      createElement(InvoiceItemsSection, {
        items: testLineItems,
        onUpdateLine: vi.fn(),
        onAddLine: vi.fn(),
        onRemoveLine: vi.fn(),
        availableProducts: liveProducts,
      }),
    );

    expect(html).toContain("Enterprise Database License");
    expect(html).toContain("[Product]");
    expect(html).toContain("DevOps Pipeline Implementation");
    expect(html).toContain("[Service]");
    expect(html).toContain("SRV-DEVOPS");
    expect(html).toContain("85000");
    expect(html).toContain("JOB");
    expect(html).toContain("120000");
  });

  it("falls back to sampleProducts when availableProducts is omitted", () => {
    const html = renderToStaticMarkup(
      createElement(InvoiceItemsSection, {
        items: testLineItems,
        onUpdateLine: vi.fn(),
        onAddLine: vi.fn(),
        onRemoveLine: vi.fn(),
      }),
    );

    expect(html).toContain("Enterprise cloud integration");
    expect(html).toContain("Custom software maintenance");
  });

  it("shows honest empty state without fake products when availableProducts is an empty array", () => {
    const html = renderToStaticMarkup(
      createElement(InvoiceItemsSection, {
        items: testLineItems,
        onUpdateLine: vi.fn(),
        onAddLine: vi.fn(),
        onRemoveLine: vi.fn(),
        availableProducts: [],
      }),
    );

    expect(html).toContain("No products or services in catalogue");
    expect(html).not.toContain("Enterprise cloud integration");
    expect(html).not.toContain("Custom software maintenance");
  });
});
