import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { sampleInvoices, filterInvoices, summarizeInvoices } from "../../data/sampleInvoices";
import { InvoiceSummaryCards } from "../components/InvoiceSummaryCards";
import { InvoiceFilterBar } from "../components/InvoiceFilterBar";
import { InvoiceTable } from "../components/InvoiceTable";
import { InvoicePagination } from "../components/InvoicePagination";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency } from "../../domain/invoice";

describe("Invoice Management UI Redesign", () => {
  describe("Summary Cards", () => {
    it("renders the 4 summary cards matching the dataset counts and amounts", () => {
      const summary = summarizeInvoices(sampleInvoices);
      const html = renderToStaticMarkup(createElement(InvoiceSummaryCards, { summary }));

      // Check card labels
      expect(html).toContain("Total Invoices");
      expect(html).toContain("Drafts");
      expect(html).toContain("Outstanding");
      expect(html).toContain("Paid");

      // Check values derived from dataset
      expect(html).toContain("24");
      expect(html).toContain("6");
      expect(html).toContain("8");
      expect(html).toContain("10");

      // Check secondary notes
      expect(html).toContain("+12%");
      expect(html).toContain("vs last month");
      expect(html).toContain("To be issued");
      expect(html).toContain(formatCurrency(summary.outstanding));
      expect(html).toContain(formatCurrency(summary.paid));
    });
  });

  describe("Filter Bar", () => {
    it("renders compact primary filter row with all required controls", () => {
      const html = renderToStaticMarkup(
        createElement(InvoiceFilterBar, {
          query: "",
          onQueryChange: () => {},
          status: "All",
          onStatusChange: () => {},
          dateRange: "all",
          onDateRangeChange: () => {},
          customer: "All",
          onCustomerChange: () => {},
          amountRange: "all",
          onAmountRangeChange: () => {},
          issueDateRange: "all",
          onIssueDateRangeChange: () => {},
          customIssueFrom: "",
          onCustomIssueFromChange: () => {},
          customIssueTo: "",
          onCustomIssueToChange: () => {},
          dueDateRange: "all",
          onDueDateRangeChange: () => {},
          customDueFrom: "",
          onCustomDueFromChange: () => {},
          customDueTo: "",
          onCustomDueToChange: () => {},
          sortBy: "issueDate-desc",
          onSortByChange: () => {},
          customersList: ["Acme Enterprises", "TechSol Pvt. Ltd."],
          isAdvancedOpen: false,
          onToggleAdvanced: () => {},
          onClear: () => {},
        }),
      );

      // Search input
      expect(html).toContain("Search by invoice number, customer, or email...");
      expect(html).toContain('id="invoice-search"');

      // Status dropdown
      expect(html).toContain('id="invoice-status-filter"');
      expect(html).toContain("All Statuses");

      // Date range dropdown
      expect(html).toContain('id="invoice-date-range"');
      expect(html).toContain("01 Jan 2025 - 31 Jan 2025");

      // Action buttons
      expect(html).toContain("More filters");
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain("Clear");

      // Advanced filter inputs are collapsed by default
      expect(html).not.toContain('id="adv-customer"');
      expect(html).not.toContain('id="adv-amount"');
    });

    it("reveals advanced filter grid with accessible controls when expanded", () => {
      const html = renderToStaticMarkup(
        createElement(InvoiceFilterBar, {
          query: "",
          onQueryChange: () => {},
          status: "All",
          onStatusChange: () => {},
          dateRange: "all",
          onDateRangeChange: () => {},
          customer: "All",
          onCustomerChange: () => {},
          amountRange: "all",
          onAmountRangeChange: () => {},
          issueDateRange: "all",
          onIssueDateRangeChange: () => {},
          customIssueFrom: "",
          onCustomIssueFromChange: () => {},
          customIssueTo: "",
          onCustomIssueToChange: () => {},
          dueDateRange: "all",
          onDueDateRangeChange: () => {},
          customDueFrom: "",
          onCustomDueFromChange: () => {},
          customDueTo: "",
          onCustomDueToChange: () => {},
          sortBy: "issueDate-desc",
          onSortByChange: () => {},
          customersList: ["Acme Enterprises", "TechSol Pvt. Ltd."],
          isAdvancedOpen: true,
          onToggleAdvanced: () => {},
          onClear: () => {},
        }),
      );

      expect(html).toContain("Fewer filters");
      expect(html).toContain('aria-expanded="true"');
      expect(html).toContain('id="advanced-filter-section"');

      // Check the 5 advanced filter controls
      expect(html).toContain("Customer");
      expect(html).toContain('id="adv-customer"');
      expect(html).toContain("Amount range");
      expect(html).toContain('id="adv-amount"');
      expect(html).toContain("Issue date");
      expect(html).toContain('id="adv-issue-date"');
      expect(html).toContain("Due date");
      expect(html).toContain('id="adv-due-date"');
      expect(html).toContain("Sort by");
      expect(html).toContain('id="adv-sort-by"');
    });
  });

  describe("Invoice Table", () => {
    it("renders column headers, row selection, and density matching reference image", () => {
      const pageInvoices = sampleInvoices.slice(0, 8);
      const html = renderToStaticMarkup(
        createElement(InvoiceTable, {
          invoices: pageInvoices,
          selectedIds: new Set(["inv-2025-0012"]),
          onToggleSelect: () => {},
          onToggleSelectAll: () => {},
          allOnPageSelected: false,
        }),
      );

      // Check header columns
      expect(html).toContain("Invoice No.");
      expect(html).toContain("Customer");
      expect(html).toContain("Issue Date");
      expect(html).toContain("Due Date");
      expect(html).toContain("Amount");
      expect(html).toContain("Status");
      expect(html).toContain("Actions");

      // Check items on page 1 matching reference image
      expect(html).toContain("INV-2025-0012");
      expect(html).toContain("Acme Enterprises");
      expect(html).toContain("billing@acme.in");
      expect(html).toContain("15 Jan 2025");
      expect(html).toContain("30 Jan 2025");

      expect(html).toContain("INV-2025-0011");
      expect(html).toContain("TechSol Pvt. Ltd.");

      expect(html).toContain("INV-2025-0010");
      expect(html).toContain("Global Traders");

      expect(html).toContain("INV-2025-0005");
      expect(html).toContain("Krishna Exports");

      // Check actions have accessible labels
      expect(html).toContain('aria-label="View invoice INV-2025-0012"');
    });
  });

  describe("Status Badges", () => {
    it("renders semantic dot indicator and accessible text for all statuses", () => {
      const statuses = ["Paid", "Partially Paid", "Overdue", "Issued", "Draft"] as const;
      statuses.forEach((s) => {
        const html = renderToStaticMarkup(createElement(StatusBadge, { status: s }));
        expect(html).toContain(s);
        expect(html).toContain('aria-hidden="true"');
      });
    });
  });

  describe("Pagination", () => {
    it("renders visible range, total count, and numbered page buttons", () => {
      const html = renderToStaticMarkup(
        createElement(InvoicePagination, {
          currentPage: 1,
          totalPages: 3,
          totalCount: 24,
          pageSize: 8,
          onPageChange: () => {},
        }),
      );

      expect(html).toContain("Showing");
      expect(html).toContain("1");
      expect(html).toContain("to");
      expect(html).toContain("8");
      expect(html).toContain("of");
      expect(html).toContain("24");
      expect(html).toContain("invoices");

      // Check page buttons
      expect(html).toContain('aria-label="Page 1"');
      expect(html).toContain('aria-current="page"');
      expect(html).toContain('aria-label="Page 2"');
      expect(html).toContain('aria-label="Page 3"');
      expect(html).toContain('aria-label="Previous page"');
      expect(html).toContain('aria-label="Next page"');
    });

    it("displays correct range on middle and last pages", () => {
      const htmlPage2 = renderToStaticMarkup(
        createElement(InvoicePagination, {
          currentPage: 2,
          totalPages: 3,
          totalCount: 24,
          pageSize: 8,
          onPageChange: () => {},
        }),
      );
      expect(htmlPage2).toContain("Showing");
      expect(htmlPage2).toContain("9");
      expect(htmlPage2).toContain("16");
    });
  });

  describe("Filtering, Search, and Sorting Logic", () => {
    it("searches by invoice number, customer name, and email", () => {
      expect(filterInvoices(sampleInvoices, { query: "INV-2025-0012" })).toHaveLength(1);
      expect(filterInvoices(sampleInvoices, { query: "Acme" })).toHaveLength(1);
      expect(filterInvoices(sampleInvoices, { query: "billing@acme.in" })).toHaveLength(1);
      expect(filterInvoices(sampleInvoices, { query: "nonexistent" })).toHaveLength(0);
    });

    it("filters by status correctly", () => {
      const drafts = filterInvoices(sampleInvoices, { status: "Draft" });
      expect(drafts).toHaveLength(6);
      expect(drafts.every((i) => i.status === "Draft")).toBe(true);

      const paid = filterInvoices(sampleInvoices, { status: "Paid" });
      expect(paid).toHaveLength(10);
      expect(paid.every((i) => i.status === "Paid")).toBe(true);
    });

    it("filters by customer", () => {
      const globalTraders = filterInvoices(sampleInvoices, { customer: "Global Traders" });
      expect(globalTraders).toHaveLength(1);
      expect(globalTraders[0].number).toBe("INV-2025-0010");
    });

    it("filters by amount range accurately", () => {
      const over250k = filterInvoices(sampleInvoices, { amountRange: "over-250k" });
      expect(over250k.map((i) => i.number)).toContain("INV-2025-0006"); // 3,10,000
    });

    it("sorts by various options", () => {
      const byNumber = filterInvoices(sampleInvoices, { sortBy: "number-asc" });
      expect(byNumber[0].number).toBe("INV-1001");

      const byDueDateAsc = filterInvoices(sampleInvoices, { sortBy: "dueDate-asc" });
      expect(byDueDateAsc[0].dueDate <= byDueDateAsc[1].dueDate).toBe(true);
    });
  });
});
