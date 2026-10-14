import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { CreditNote } from "../domain/credit-note";
import { CreditNoteSummaryCards } from "./components/CreditNoteSummaryCards";
import { CreditNoteFilterBar } from "./components/CreditNoteFilterBar";
import { CreditNoteTable } from "./components/CreditNoteTable";
import { CreditNoteStatusBadge } from "./components/CreditNoteStatusBadge";
import { CreditNoteDocument } from "./components/CreditNoteDocument";
import { CreditNotePagination } from "./components/CreditNotePagination";

const mockCreditNotes: CreditNote[] = [
  {
    id: "cn-1",
    creditNoteNumber: "CN-2026-0001",
    invoiceId: "inv-1",
    invoiceNumber: "INV-2026-0001",
    customerId: "cust-1",
    customerName: "Acme Enterprises",
    customerEmail: "billing@acme.com",
    customerAddress: "Mumbai, Maharashtra",
    customerGstin: "27ABCDE1234F1Z5",
    customerPlaceOfSupply: "27-Maharashtra",
    issueDate: "2026-10-15",
    status: "Issued",
    reason: "Defective hardware returned",
    taxMode: "CGST_SGST",
    currency: "INR (₹)",
    subtotal: 10000,
    lineDiscountTotal: 0,
    taxableAmount: 10000,
    cgst: 900,
    sgst: 900,
    igst: 0,
    totalTax: 1800,
    total: 11800,
    notes: "Adjustment against upcoming invoice",
    terms: "Valid for 90 days",
    items: [
      {
        id: "item-1",
        item: "IoT Sensor Gateway",
        description: "Hardware unit",
        quantity: 1,
        unitPrice: 10000,
        discount: 0,
        taxRate: 18,
      },
    ],
    createdAt: "2026-10-15T10:00:00.000Z",
    updatedAt: "2026-10-15T10:00:00.000Z",
  },
  {
    id: "cn-2",
    creditNoteNumber: "CN-2026-0002",
    invoiceId: "inv-2",
    invoiceNumber: "INV-2026-0002",
    customerName: "TechSol Pvt Ltd",
    customerEmail: "accounts@techsol.com",
    customerAddress: "Bangalore, Karnataka",
    customerGstin: "29ABCDE1234F1Z5",
    issueDate: "2026-10-16",
    status: "Draft",
    reason: "Billing calculation correction",
    taxMode: "IGST",
    currency: "INR (₹)",
    subtotal: 5000,
    lineDiscountTotal: 0,
    taxableAmount: 5000,
    cgst: 0,
    sgst: 0,
    igst: 900,
    totalTax: 900,
    total: 5900,
    notes: "",
    terms: "",
    items: [
      {
        id: "item-2",
        item: "Cloud Hosting Credit",
        description: "",
        quantity: 1,
        unitPrice: 5000,
        discount: 0,
        taxRate: 18,
      },
    ],
    createdAt: "2026-10-16T10:00:00.000Z",
    updatedAt: "2026-10-16T10:00:00.000Z",
  },
];

describe("Credit Note Presentation Components", () => {
  describe("CreditNoteSummaryCards", () => {
    it("renders the 4 summary metric tiles correctly", () => {
      const summary = {
        totalCreditNotes: 2,
        totalCreditedAmount: 11800,
        issuedCount: 1,
        issuedAmount: 11800,
        draftCount: 1,
        draftAmount: 5900,
        cancelledCount: 0,
        cancelledAmount: 0,
      };

      const html = renderToStaticMarkup(createElement(CreditNoteSummaryCards, { summary }));

      expect(html).toContain("Total Credit Notes");
      expect(html).toContain("Total Credited Value");
      expect(html).toContain("Issued Notes");
      expect(html).toContain("Draft Notes");
      expect(html).toContain("2");
      expect(html).toContain("1");
      expect(html).toContain("11,800");
    });
  });

  describe("CreditNoteFilterBar", () => {
    it("renders search input and dropdown selectors", () => {
      const html = renderToStaticMarkup(
        createElement(CreditNoteFilterBar, {
          query: "Acme",
          onQueryChange: () => {},
          status: "Draft",
          onStatusChange: () => {},
          customer: "All",
          onCustomerChange: () => {},
          amountRange: "all",
          onAmountRangeChange: () => {},
          sortBy: "issueDate-desc",
          onSortByChange: () => {},
          customersList: ["Acme Enterprises", "TechSol Pvt Ltd"],
          onClear: () => {},
        }),
      );

      expect(html).toContain("Search credit note #, customer, invoice #, reason...");
      expect(html).toContain("All Statuses");
      expect(html).toContain("All Customers");
      expect(html).toContain("Acme Enterprises");
      expect(html).toContain("TechSol Pvt Ltd");
      expect(html).toContain("Reset");
    });
  });

  describe("CreditNoteTable", () => {
    it("renders table header and credit note row items with links", () => {
      const html = renderToStaticMarkup(
        createElement(CreditNoteTable, {
          creditNotes: mockCreditNotes,
          selectedIds: new Set(["cn-1"]),
          onToggleSelect: () => {},
          onToggleSelectAll: () => {},
          allOnPageSelected: false,
        }),
      );

      expect(html).toContain("Credit Note No.");
      expect(html).toContain("Original Invoice");
      expect(html).toContain("Customer");
      expect(html).toContain("Issue Date");
      expect(html).toContain("Amount");
      expect(html).toContain("Status");
      expect(html).toContain("Actions");

      expect(html).toContain("CN-2026-0001");
      expect(html).toContain("INV-2026-0001");
      expect(html).toContain("Acme Enterprises");
      expect(html).toContain("11,800");

      expect(html).toContain("CN-2026-0002");
      expect(html).toContain("INV-2026-0002");
      expect(html).toContain("TechSol Pvt Ltd");
      expect(html).toContain("5,900");
    });

    it("renders accessible action buttons for each row", () => {
      const html = renderToStaticMarkup(
        createElement(CreditNoteTable, {
          creditNotes: mockCreditNotes,
          selectedIds: new Set<string>(),
          onToggleSelect: () => {},
          onToggleSelectAll: () => {},
          allOnPageSelected: false,
        }),
      );

      expect(html).toContain('aria-label="View credit note CN-2026-0001"');
      expect(html).toContain('aria-label="Edit draft credit note CN-2026-0002"');
    });
  });

  describe("CreditNoteStatusBadge", () => {
    it("renders semantic indicator and accessible labels for all statuses", () => {
      const statuses = ["Draft", "Issued", "Cancelled"] as const;
      statuses.forEach((status) => {
        const html = renderToStaticMarkup(createElement(CreditNoteStatusBadge, { status }));
        expect(html).toContain(status);
        expect(html).toContain('aria-hidden="true"');
      });
    });
  });

  describe("CreditNoteDocument", () => {
    it("renders complete document preview with original invoice reference and tax breakdowns", () => {
      const html = renderToStaticMarkup(
        createElement(CreditNoteDocument, {
          creditNote: mockCreditNotes[0],
          supplierName: "Aventra Billing Corp",
        }),
      );

      expect(html).toContain("Credit Note · Issued");
      expect(html).toContain("CN-2026-0001");
      expect(html).toContain("INV-2026-0001");
      expect(html).toContain("Aventra Billing");
      expect(html).toContain("Acme Enterprises");
      expect(html).toContain("IoT Sensor Gateway");
      expect(html).toContain("Defective hardware returned");
      expect(html).toContain("CGST");
      expect(html).toContain("SGST");
      expect(html).toContain("Total Credit");
      expect(html).toContain("11,800");
    });
  });

  describe("CreditNotePagination", () => {
    it("renders pagination range and accessible buttons", () => {
      const html = renderToStaticMarkup(
        createElement(CreditNotePagination, {
          currentPage: 1,
          totalPages: 2,
          totalCount: 15,
          pageSize: 8,
          onPageChange: () => {},
        }),
      );

      expect(html).toContain("Showing");
      expect(html).toContain("1");
      expect(html).toContain("8");
      expect(html).toContain("15");
      expect(html).toContain("credit notes");
      expect(html).toContain('aria-label="Previous page"');
      expect(html).toContain('aria-label="Next page"');
    });
  });
});
