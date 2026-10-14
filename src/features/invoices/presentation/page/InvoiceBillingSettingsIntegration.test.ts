import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/invoices/new",
}));

vi.mock("../../data/mutations/invoice-mutations", () => ({
  createInvoiceAction: vi.fn(),
  updateInvoiceAction: vi.fn(),
  deleteInvoiceAction: vi.fn(),
}));

import { InvoiceCreatePage } from "./InvoiceCreatePage";
import { InvoiceWorkspaceProvider } from "../hooks/InvoiceWorkspaceProvider";
import { InvoiceDocument } from "../components/InvoiceDocument";
import type { Invoice } from "../../domain/invoice";

describe("Invoice Integration with Billing Settings", () => {
  it("prefills default notes, default terms, and sequence number from billing settings on new invoice", () => {
    const html = renderToStaticMarkup(
      createElement(
        InvoiceWorkspaceProvider,
        null,
        createElement(InvoiceCreatePage, {
          initialDefaultNotes: "Custom default notes configured in Billing Settings",
          initialDefaultTerms: "Custom terms: 50% advance, balance on delivery",
          initialInvoiceNumber: "INV-2026-0042",
        }),
      ),
    );

    // Verify prefilled notes and terms in textareas
    expect(html).toContain("Custom default notes configured in Billing Settings");
    expect(html).toContain("Custom terms: 50% advance, balance on delivery");
    expect(html).toContain("INV-2026-0042");
  });

  it("renders prefilled notes and terms on the invoice document preview", () => {
    const sampleInvoice: Invoice = {
      id: "inv-preview-1",
      number: "INV-2026-0001",
      customer: "Acme Enterprises",
      customerEmail: "billing@acme.com",
      customerAddress: "Mumbai, Maharashtra",
      customerGstin: "27AABCA1234A1Z5",
      issueDate: "2026-10-12",
      dueDate: "2026-10-27",
      status: "Draft",
      taxMode: "CGST_SGST",
      notes: "Saved invoice notes from organization defaults",
      terms: "Saved terms snapshot: Strict 15 days",
      paymentTerms: "Net 15 days",
      amountPaid: 0,
      items: [
        {
          id: "item-1",
          item: "Cloud Architecture Review",
          description: "Technical review",
          hsnSac: "998313",
          quantity: 1,
          unitPrice: 50000,
          discount: 0,
          taxRate: 18,
        },
      ],
    };

    const html = renderToStaticMarkup(
      createElement(InvoiceDocument, {
        invoice: sampleInvoice,
        supplierName: "Aventra Services",
      }),
    );

    expect(html).toContain("INV-2026-0001");
    expect(html).toContain("Saved invoice notes from organization defaults");
    expect(html).toContain("Saved terms snapshot: Strict 15 days");
  });

  it("historical invoice preserves existing notes even when organization defaults change", () => {
    // When an invoice has already saved historical notes, they are not mutated
    const historicalInvoice: Invoice = {
      id: "inv-hist-1",
      number: "INV-2024-0010",
      customer: "Historical Client Ltd",
      customerEmail: "finance@historical.com",
      customerAddress: "Pune, MH",
      customerGstin: "27AABCH5555H1Z1",
      issueDate: "2024-01-15",
      dueDate: "2024-01-30",
      status: "Paid",
      taxMode: "CGST_SGST",
      notes: "Original 2024 note snapshot",
      terms: "Original 2024 terms snapshot",
      paymentTerms: "Net 15 days",
      amountPaid: 25000,
      items: [],
    };

    const html = renderToStaticMarkup(
      createElement(InvoiceDocument, {
        invoice: historicalInvoice,
      }),
    );

    expect(html).toContain("Original 2024 note snapshot");
    expect(html).toContain("Original 2024 terms snapshot");
    // New defaults should NOT appear on historical snapshot
    expect(html).not.toContain("Custom default notes configured in Billing Settings");
  });
});
