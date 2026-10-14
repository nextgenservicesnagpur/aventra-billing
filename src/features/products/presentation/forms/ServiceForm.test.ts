import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/services/new",
}));

vi.mock("../../data/mutations/product-mutations", () => ({
  createProductAction: vi.fn(),
  updateProductAction: vi.fn(),
  deleteProductAction: vi.fn(),
}));

import { ProductForm } from "./ProductForm";
import { ProductBasicInformationSection } from "./ProductBasicInformationSection";
import { ProductPricingSection } from "./ProductPricingSection";
import { ProductTaxSection } from "./ProductTaxSection";
import { ProductNotesSection } from "./ProductNotesSection";
import type { ProductDto } from "../../data/dto/product-dto";

const sampleServiceDto: ProductDto = {
  id: "srv-2026-01",
  organizationId: "org-1",
  name: "DevOps Infrastructure Automation",
  type: "SERVICE",
  sku: "SRV-OPS-01",
  category: "DevOps",
  status: "ACTIVE",
  description: "Terraform and Kubernetes infrastructure provisioning",
  sellingPrice: 150000,
  purchasePrice: null,
  currency: "INR (₹)",
  unit: "PROJECT",
  hsnSac: "998313",
  taxRate: 18,
  taxPreference: "Taxable",
  trackInventory: false,
  reorderPoint: null,
  internalNotes: "Requires 1 Senior Cloud Architect",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("Service Form Presentation & Isolation", () => {
  it("renders Service Create form with service labels and NO inventory section", () => {
    const html = renderToStaticMarkup(
      createElement(ProductForm, {
        defaultType: "SERVICE",
        lockType: true,
        isEdit: false,
      }),
    );

    // Checks service-specific labels
    expect(html).toContain("Service Name");
    expect(html).toContain("Service Code");
    expect(html).toContain("SAC Code");
    expect(html).toContain("Create Service");

    // Strictly verifies NO inventory tracking fields exist for services
    expect(html).not.toContain("Inventory Tracking");
    expect(html).not.toContain("Low Stock Threshold");
    expect(html).not.toContain("track-inventory");
    expect(html).not.toContain("reorder-point");

    // Internal notes notice
    expect(html).toContain("Not visible on customer invoices");
  });

  it("renders Service Edit form with Update Service action and existing values", () => {
    const html = renderToStaticMarkup(
      createElement(ProductForm, {
        initialData: sampleServiceDto,
        defaultType: "SERVICE",
        lockType: true,
        isEdit: true,
      }),
    );

    expect(html).toContain("DevOps Infrastructure Automation");
    expect(html).toContain("SRV-OPS-01");
    expect(html).toContain("998313");
    expect(html).toContain("Update Service");

    // Ensure inventory is still completely absent
    expect(html).not.toContain("Inventory Tracking");
  });

  it("renders ProductBasicInformationSection with service context", () => {
    const html = renderToStaticMarkup(
      createElement(ProductBasicInformationSection, {
        name: "Cloud Support",
        onNameChange: vi.fn(),
        type: "SERVICE",
        onTypeChange: vi.fn(),
        sku: "SRV-SUP-01",
        onSkuChange: vi.fn(),
        category: "Support",
        onCategoryChange: vi.fn(),
        status: "ACTIVE",
        onStatusChange: vi.fn(),
        description: "24/7 on-call tier 3 support",
        onDescriptionChange: vi.fn(),
        lockType: true,
      }),
    );

    expect(html).toContain("Service Name");
    expect(html).toContain("Service Code");
    expect(html).toContain("Cloud Support");
  });

  it("renders ProductPricingSection with Internal Cost Rate for services", () => {
    const html = renderToStaticMarkup(
      createElement(ProductPricingSection, {
        type: "SERVICE",
        sellingPrice: "75000",
        onSellingPriceChange: vi.fn(),
        purchasePrice: "40000",
        onPurchasePriceChange: vi.fn(),
        currency: "INR (₹)",
        onCurrencyChange: vi.fn(),
        unit: "HRS",
        onUnitChange: vi.fn(),
      }),
    );

    expect(html).toContain("Internal Cost Rate");
    expect(html).toContain("Selling Price / Rate");
    expect(html).toContain("Unit of Measurement");
  });

  it("renders ProductTaxSection with SAC Code for services", () => {
    const html = renderToStaticMarkup(
      createElement(ProductTaxSection, {
        type: "SERVICE",
        hsnSac: "998314",
        onHsnSacChange: vi.fn(),
        taxRate: "18",
        onTaxRateChange: vi.fn(),
        taxPreference: "Taxable",
        onTaxPreferenceChange: vi.fn(),
      }),
    );

    expect(html).toContain("SAC Code");
    expect(html).not.toContain("HSN Code");
    expect(html).toContain("998314");
    expect(html).toContain("Applicable GST Rate");
  });

  it("renders ProductNotesSection with internal notice", () => {
    const html = renderToStaticMarkup(
      createElement(ProductNotesSection, {
        internalNotes: "Internal contractor rate is $50/hr",
        onInternalNotesChange: vi.fn(),
      }),
    );

    expect(html).toContain("Internal Notes (Not visible on customer invoices)");
    expect(html).toContain("Internal contractor rate is $50/hr");
  });
});
