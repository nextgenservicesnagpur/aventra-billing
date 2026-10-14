import { describe, expect, it } from "vitest";
import {
  calculateDueDate,
  calculateInvoiceTotals,
  canEditInvoice,
  getTodayDateString,
  parsePaymentTermsDays,
  validateInvoice,
  type Invoice,
} from "./invoice";

const base: Invoice = { id: "x", number: "X", customer: "Customer", customerEmail: "", customerAddress: "", customerGstin: "", issueDate: "2026-01-01", dueDate: "2026-01-31", status: "Draft", taxMode: "IGST", notes: "", paymentTerms: "", terms: "", amountPaid: 0, items: [{ id: "1", item: "Service", description: "", quantity: 2, unitPrice: 1000, discount: 10, taxRate: 18 }] };
describe("invoice calculations", () => { it("calculates discount, tax, total, and balance", () => expect(calculateInvoiceTotals(base)).toEqual({ subtotal: 2000, discount: 200, taxable: 1800, tax: 324, cgst: 0, sgst: 0, igst: 324, total: 2124, balance: 2124 })); it("never reports a negative balance", () => expect(calculateInvoiceTotals({ ...base, amountPaid: 3000 }).balance).toBe(0)); });
describe("invoice validation", () => { it("reports missing customer and invalid dates", () => { const errors = validateInvoice({ ...base, customer: "", dueDate: "2025-12-01" }); expect(errors.customer).toBeTruthy(); expect(errors.dueDate).toBeTruthy(); }); it("accepts a complete draft", () => expect(validateInvoice(base)).toEqual({})); });
describe("draft restrictions", () => { it("only allows draft invoices to be edited", () => { expect(canEditInvoice(base)).toBe(true); expect(canEditInvoice({ status: "Paid" })).toBe(false); }); });

describe("payment terms and date calculations", () => {
  it("returns current date in YYYY-MM-DD format", () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("parses payment terms into days accurately", () => {
    expect(parsePaymentTermsDays("Net 15 days")).toBe(15);
    expect(parsePaymentTermsDays("Net 30 days")).toBe(30);
    expect(parsePaymentTermsDays("Net 45 days")).toBe(45);
    expect(parsePaymentTermsDays("Net 60 days")).toBe(60);
    expect(parsePaymentTermsDays("Due on receipt")).toBe(0);
    expect(parsePaymentTermsDays("Due on Receipt")).toBe(0);
    expect(parsePaymentTermsDays("Net 7 days")).toBe(7);
    expect(parsePaymentTermsDays(null)).toBe(15);
    expect(parsePaymentTermsDays("")).toBe(15);
  });

  it("calculates due date from issue date and payment terms", () => {
    expect(calculateDueDate("2026-10-12", "Net 15 days")).toBe("2026-10-27");
    expect(calculateDueDate("2026-10-12", "Net 30 days")).toBe("2026-11-11");
    expect(calculateDueDate("2026-10-12", "Due on receipt")).toBe("2026-10-12");
    expect(calculateDueDate("2026-10-12", "Due on Receipt")).toBe("2026-10-12");
    expect(calculateDueDate("2026-01-20", "Net 15 days")).toBe("2026-02-04");
    expect(calculateDueDate("2025-12-25", "Net 10 days")).toBe("2026-01-04");
  });
});
