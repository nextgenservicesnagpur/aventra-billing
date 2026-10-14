import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/products",
}));

import type { ProductDto } from "../../data/dto/product-dto";
import { ProductListPage } from "./ProductListPage";
import { ProductTable } from "../components/ProductTable";
import { ProductFilterBar } from "../components/ProductFilterBar";

const sampleProductsList: ProductDto[] = [
  {
    id: "prod-1",
    organizationId: "org-1",
    name: "Bar Inventory Scanner",
    type: "PRODUCT",
    sku: "SCAN-01",
    category: "Hardware",
    status: "ACTIVE",
    description: "2D Barcode Reader",
    sellingPrice: 15000,
    purchasePrice: 10000,
    currency: "INR (₹)",
    unit: "PCS",
    hsnSac: "84716060",
    taxRate: 18,
    taxPreference: "Taxable",
    trackInventory: true,
    reorderPoint: 5,
    internalNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "serv-1",
    organizationId: "org-1",
    name: "Annual Maintenance Contract",
    type: "SERVICE",
    sku: "AMC-2026",
    category: "Maintenance",
    status: "ACTIVE",
    description: "Full year 24/7 SLA",
    sellingPrice: 50000,
    purchasePrice: null,
    currency: "INR (₹)",
    unit: "JOB",
    hsnSac: "998314",
    taxRate: 18,
    taxPreference: "Taxable",
    trackInventory: false,
    reorderPoint: null,
    internalNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("ProductListPage Rendering", () => {
  it("renders the Products page header and Add Product action", () => {
    const html = renderToStaticMarkup(
      createElement(ProductListPage, {
        initialProducts: sampleProductsList,
        itemType: "PRODUCT",
      }),
    );

    expect(html).toContain("Products");
    expect(html).toContain("Add Product");
    expect(html).toContain("href=\"/products/new\"");
    expect(html).toContain("Bar Inventory Scanner");
  });

  it("renders the Services page header and Add Service action", () => {
    const html = renderToStaticMarkup(
      createElement(ProductListPage, {
        initialProducts: sampleProductsList,
        itemType: "SERVICE",
      }),
    );

    expect(html).toContain("Services");
    expect(html).toContain("Manage your service catalogue, billing rates, and tax details.");
    expect(html).toContain("Add Service");
    expect(html).toContain("href=\"/services/new\"");
    expect(html).toContain("Annual Maintenance Contract");
    expect(html).toContain("SAC");
  });

  it("renders empty state when there are no products", () => {
    const html = renderToStaticMarkup(
      createElement(ProductTable, {
        products: [],
        basePath: "/products",
      }),
    );

    expect(html).toContain("No products yet");
    expect(html).toContain("href=\"/products/new\"");
  });

  it("renders empty state for services", () => {
    const html = renderToStaticMarkup(
      createElement(ProductTable, {
        products: [],
        basePath: "/services",
      }),
    );

    expect(html).toContain("No services yet");
    expect(html).toContain("href=\"/services/new\"");
  });

  it("renders filtered empty state with clear filters button", () => {
    const html = renderToStaticMarkup(
      createElement(ProductTable, {
        products: [],
        isFiltered: true,
        basePath: "/products",
      }),
    );

    expect(html).toContain("No matching items");
  });

  it("renders filter bar with search input and category select", () => {
    const html = renderToStaticMarkup(
      createElement(ProductFilterBar, {
        query: "",
        onQueryChange: vi.fn(),
        category: "ALL",
        onCategoryChange: vi.fn(),
        status: "ALL",
        onStatusChange: vi.fn(),
        onReset: vi.fn(),
      }),
    );

    expect(html).toContain("Search by name, SKU/code, or HSN/SAC...");
    expect(html).toContain("All Categories");
    expect(html).toContain("All Statuses");
  });
});
