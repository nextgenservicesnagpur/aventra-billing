import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CreditNoteCreatePage } from "./CreditNoteCreatePage";
import type { EligibleInvoiceSummaryDto } from "../../data/dto/credit-note-dto";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("../../data/mutations/credit-note-mutations", () => ({
  createCreditNoteAction: vi.fn(),
  updateCreditNoteAction: vi.fn(),
}));

const mockEligibleInvoices: EligibleInvoiceSummaryDto[] = [
  {
    id: "inv-alpha",
    invoiceNumber: "INV-2026-0001",
    customerName: "Acme Corp",
    customerEmail: "billing@acme.com",
    customerAddress: "Mumbai, Maharashtra",
    customerGstin: "27AABCB1234F1Z1",
    customerPlaceOfSupply: "27-Maharashtra",
    issueDate: "2026-10-10",
    dueDate: "2026-10-25",
    total: 100000,
    creditedTotal: 0,
    remainingCreditableAmount: 100000,
    status: "Issued",
    taxMode: "CGST_SGST",
    items: [
      {
        id: "inv-item-1",
        productId: "prod-1",
        item: "Software Engineering Retainer",
        description: "Monthly subscription",
        hsnSac: "998314",
        quantity: 1,
        unitPrice: 84745.76,
        discount: 0,
        taxRate: 18,
        lineTotal: 84745.76,
      },
    ],
  },
  {
    id: "inv-beta",
    invoiceNumber: "INV-2026-0002",
    customerName: "Beta Logistics",
    customerEmail: "accounts@beta.com",
    customerAddress: "Pune, Maharashtra",
    customerGstin: "27AABCB9999F1Z9",
    customerPlaceOfSupply: "27-Maharashtra",
    issueDate: "2026-10-11",
    dueDate: "2026-10-26",
    total: 50000,
    creditedTotal: 0,
    remainingCreditableAmount: 50000,
    status: "Partially Paid",
    taxMode: "CGST_SGST",
    items: [
      {
        id: "inv-item-2",
        productId: "prod-2",
        item: "Fleet Telematics Module",
        description: "Hardware unit",
        hsnSac: "8523",
        quantity: 1,
        unitPrice: 42372.88,
        discount: 0,
        taxRate: 18,
        lineTotal: 42372.88,
      },
    ],
  },
];

describe("CreditNoteCreatePage Preselection & UI Regression Tests", () => {
  it("opens with no invoice preselected by default when navigated generally", () => {
    const html = renderToStaticMarkup(
      createElement(CreditNoteCreatePage, {
        eligibleInvoices: mockEligibleInvoices,
        initialInvoiceId: "",
        previewCreditNoteNumber: "CN-2026-0001",
        supplierName: "Aventra Billing",
      }),
    );

    // 1. Selector shows the required placeholder
    expect(html).toContain("Select original invoice");

    // 2. Unselected helper banner is displayed
    expect(html).toContain(
      "Select an original invoice above to load invoice details, line items, and creditable balance.",
    );

    // 3. No invoice is preselected; items table shows empty state
    expect(html).toContain("No line items added. Select an original invoice");

    // 4. First invoice is not automatically preselected
    expect(html).not.toContain("Available Credit Limit");
  });

  it("preselects the designated invoice when opened from a valid contextual flow", () => {
    const html = renderToStaticMarkup(
      createElement(CreditNoteCreatePage, {
        eligibleInvoices: mockEligibleInvoices,
        initialInvoiceId: "inv-beta",
        previewCreditNoteNumber: "CN-2026-0001",
        supplierName: "Aventra Billing",
      }),
    );

    // Contextual invoice details are loaded
    expect(html).toContain("Beta Logistics");
    expect(html).toContain('value="Fleet Telematics Module"');
    expect(html).toContain("Available Credit Limit");
    expect(html).toContain("50,000");

    // Does not show the unselected placeholder banner
    expect(html).not.toContain(
      "Select an original invoice above to load invoice details, line items, and creditable balance.",
    );
  });

  it("ignores an invalid or foreign initialInvoiceId and renders unselected default state", () => {
    const html = renderToStaticMarkup(
      createElement(CreditNoteCreatePage, {
        eligibleInvoices: mockEligibleInvoices,
        initialInvoiceId: "inv-non-existent-or-other-tenant",
        previewCreditNoteNumber: "CN-2026-0001",
        supplierName: "Aventra Billing",
      }),
    );

    expect(html).toContain("Select original invoice");
    expect(html).toContain("No line items added. Select an original invoice");
    expect(html).not.toContain("Available Credit Limit");
  });

  it("renders credit note number as read-only preview so sequence allocation is deferred to server", () => {
    const html = renderToStaticMarkup(
      createElement(CreditNoteCreatePage, {
        eligibleInvoices: mockEligibleInvoices,
        initialInvoiceId: "",
        previewCreditNoteNumber: "CN-2026-0001",
        supplierName: "Aventra Billing",
      }),
    );

    // Input has disabled attribute and placeholder
    expect(html).toContain('placeholder="CN-2026-0001"');
    expect(html).toContain('disabled=""');
    expect(html).toContain("Allocated automatically on save from Billing Settings sequence.");
  });

  it("displays empty state when no eligible invoices exist in the organization", () => {
    const html = renderToStaticMarkup(
      createElement(CreditNoteCreatePage, {
        eligibleInvoices: [],
        initialInvoiceId: "",
        previewCreditNoteNumber: "CN-2026-0001",
        supplierName: "Aventra Billing",
      }),
    );

    expect(html).toContain("No eligible invoices found");
    expect(html).toContain("Credit notes can only be issued against issued, partially paid, or paid invoices.");
    expect(html).toContain("View Invoices");
  });
});
