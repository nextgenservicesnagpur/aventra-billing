import { describe, expect, it } from "vitest";
import {
  filterCreditNotes,
  summarizeCreditNotes,
} from "./credit-note-filter";
import type { CreditNote } from "../credit-note";

const makeNote = (overrides: Partial<CreditNote>): CreditNote => ({
  id: "cn-1",
  creditNoteNumber: "CN-0001",
  invoiceId: "inv-1",
  invoiceNumber: "INV-0001",
  customerName: "Acme Corp",
  customerEmail: "billing@acme.com",
  customerAddress: "Mumbai",
  customerGstin: "27AABCA1234F1Z5",
  issueDate: "2026-10-10",
  status: "Issued",
  reason: "Sales return",
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
  notes: "",
  terms: "",
  items: [],
  ...overrides,
});

describe("filterCreditNotes", () => {
  const notes: CreditNote[] = [
    makeNote({ id: "cn-1", creditNoteNumber: "CN-0001", customerName: "Acme Corp", customerEmail: "billing@acme.com", total: 10000, status: "Issued", issueDate: "2026-10-01" }),
    makeNote({ id: "cn-2", creditNoteNumber: "CN-0002", customerName: "Beta Ltd", customerEmail: "contact@beta.com", total: 30000, status: "Draft", issueDate: "2026-10-05" }),
    makeNote({ id: "cn-3", creditNoteNumber: "CN-0003", customerName: "Acme Corp", customerEmail: "billing@acme.com", total: 75000, status: "Cancelled", issueDate: "2026-10-09" }),
  ];

  it("filters by search query matching number, customer, or reason", () => {
    expect(filterCreditNotes(notes, { query: "Beta" })).toHaveLength(1);
    expect(filterCreditNotes(notes, { query: "CN-0001" })).toHaveLength(1);
    expect(filterCreditNotes(notes, { query: "Acme" })).toHaveLength(2);
    expect(filterCreditNotes(notes, { query: "nonexistent" })).toHaveLength(0);
  });

  it("filters by status", () => {
    expect(filterCreditNotes(notes, { status: "Draft" })).toHaveLength(1);
    expect(filterCreditNotes(notes, { status: "Issued" })).toHaveLength(1);
    expect(filterCreditNotes(notes, { status: "All" })).toHaveLength(3);
  });

  it("filters by customer", () => {
    expect(filterCreditNotes(notes, { customer: "Beta Ltd" })).toHaveLength(1);
    expect(filterCreditNotes(notes, { customer: "Acme Corp" })).toHaveLength(2);
  });

  it("filters by amount range", () => {
    expect(filterCreditNotes(notes, { amountRange: "under-25k" })).toHaveLength(1);
    expect(filterCreditNotes(notes, { amountRange: "25k-50k" })).toHaveLength(1);
    expect(filterCreditNotes(notes, { amountRange: "50k-100k" })).toHaveLength(1);
  });

  it("sorts by issueDate or amount", () => {
    const sortedDesc = filterCreditNotes(notes, { sortBy: "amount-desc" });
    expect(sortedDesc[0]?.total).toBe(75000);

    const sortedAsc = filterCreditNotes(notes, { sortBy: "amount-asc" });
    expect(sortedAsc[0]?.total).toBe(10000);
  });
});

describe("summarizeCreditNotes", () => {
  it("computes totals across credit note states", () => {
    const notes: CreditNote[] = [
      makeNote({ id: "cn-1", total: 10000, status: "Issued" }),
      makeNote({ id: "cn-2", total: 20000, status: "Draft" }),
      makeNote({ id: "cn-3", total: 5000, status: "Cancelled" }),
    ];

    const summary = summarizeCreditNotes(notes);

    expect(summary.totalCreditNotes).toBe(3);
    expect(summary.issuedCount).toBe(1);
    expect(summary.issuedAmount).toBe(10000);
    expect(summary.totalCreditedAmount).toBe(10000);
    expect(summary.draftCount).toBe(1);
    expect(summary.draftAmount).toBe(20000);
    expect(summary.cancelledCount).toBe(1);
  });
});
