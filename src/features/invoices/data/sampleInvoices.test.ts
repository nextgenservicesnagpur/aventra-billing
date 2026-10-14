import { describe, expect, it } from "vitest";
import { filterInvoices, sampleInvoices, summarizeInvoices } from "./sampleInvoices";
import { formatInvoiceDate } from "../domain/invoice";

describe("invoice demo data", () => {
  it("contains varied statuses", () =>
    expect(new Set(sampleInvoices.map((invoice) => invoice.status))).toEqual(
      new Set(["Draft", "Issued", "Partially Paid", "Paid", "Overdue"]),
    ));

  it("filters by customer and status", () =>
    expect(filterInvoices(sampleInvoices, "cedar", "Partially Paid").map((invoice) => invoice.number)).toEqual(["INV-1002"]));

  it("filters by customer field directly", () =>
    expect(filterInvoices(sampleInvoices, { customer: "Acme Enterprises" }).map((invoice) => invoice.number)).toEqual(["INV-2025-0012"]));

  it("filters by amount range", () => {
    const under50k = filterInvoices(sampleInvoices, { amountRange: "under-50k" });
    expect(under50k.length).toBeGreaterThan(0);
    expect(under50k.every((inv) => inv.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) < 50000)).toBe(true);
  });

  it("filters by issue date range and due date range", () => {
    const jan2025 = filterInvoices(sampleInvoices, {
      issueDateFrom: "2025-01-01",
      issueDateTo: "2025-01-31",
    });
    expect(jan2025.length).toBe(7);
  });

  it("sorts by amount descending and ascending", () => {
    const desc = filterInvoices(sampleInvoices, { sortBy: "amount-desc" });
    expect(desc[0].number).toBe("INV-2025-0006"); // 3,10,000

    const asc = filterInvoices(sampleInvoices, { sortBy: "amount-asc" });
    expect(asc[0].number).toBe("INV-2024-0006"); // 4,500
  });

  it("summarizes shared dataset fields correctly", () => {
    const summary = summarizeInvoices(sampleInvoices);
    expect(summary).toMatchObject({
      totalInvoices: 24,
      drafts: 6,
      outstandingCount: 8,
      paidCount: 10,
    });
  });

  it("formats dates for people", () =>
    expect(formatInvoiceDate("2026-02-03")).toBe("03 Feb 2026"));
});
