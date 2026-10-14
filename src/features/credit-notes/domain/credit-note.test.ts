import { describe, expect, it } from "vitest";
import {
  calculateCreditNoteTotals,
  canEditCreditNote,
  canIssueCreditNote,
  formatCreditNoteCurrency,
  formatCreditNoteDate,
  lineDiscount,
  lineSubtotal,
  lineTax,
  lineTaxable,
  roundCurrency,
  type CreditNoteLineItem,
} from "./credit-note";

const sampleLine: CreditNoteLineItem = {
  id: "cn-line-1",
  item: "Industrial Motor Unit",
  description: "3-Phase Induction",
  hsnSac: "8501",
  quantity: 2,
  unitPrice: 5000,
  discount: 10,
  taxRate: 18,
};

describe("credit note line-level calculations", () => {
  it("calculates line subtotal with correct precision", () => {
    expect(lineSubtotal(sampleLine)).toBe(10000);
    expect(lineSubtotal({ quantity: 1.5, unitPrice: 33.33 })).toBe(50);
  });

  it("calculates line discount correctly", () => {
    expect(lineDiscount(sampleLine)).toBe(1000);
    expect(lineDiscount({ quantity: 1, unitPrice: 100, discount: 0 })).toBe(0);
  });

  it("calculates line taxable amount (subtotal - discount)", () => {
    expect(lineTaxable(sampleLine)).toBe(9000);
  });

  it("calculates line tax accurately", () => {
    expect(lineTax(sampleLine)).toBe(1620);
    expect(lineTax({ quantity: 1, unitPrice: 100, discount: 0, taxRate: 18 })).toBe(18);
  });

  it("rounds currency values cleanly", () => {
    expect(roundCurrency(10.004)).toBe(10);
    expect(roundCurrency(10.005)).toBe(10.01);
  });
});

describe("credit note totals calculations", () => {
  it("calculates totals for intra-state taxMode (CGST + SGST)", () => {
    const totals = calculateCreditNoteTotals({
      items: [sampleLine],
      taxMode: "CGST_SGST",
    });

    expect(totals).toEqual({
      subtotal: 10000,
      discount: 1000,
      taxable: 9000,
      tax: 1620,
      cgst: 810,
      sgst: 810,
      igst: 0,
      total: 10620,
    });
  });

  it("calculates totals for inter-state taxMode (IGST)", () => {
    const totals = calculateCreditNoteTotals({
      items: [sampleLine],
      taxMode: "IGST",
    });

    expect(totals).toEqual({
      subtotal: 10000,
      discount: 1000,
      taxable: 9000,
      tax: 1620,
      cgst: 0,
      sgst: 0,
      igst: 1620,
      total: 10620,
    });
  });

  it("handles multi-line credits correctly", () => {
    const line2: CreditNoteLineItem = {
      id: "cn-line-2",
      item: "Installation Service",
      description: "Onsite fitting",
      quantity: 1,
      unitPrice: 2000,
      discount: 0,
      taxRate: 18,
    };

    const totals = calculateCreditNoteTotals({
      items: [sampleLine, line2],
      taxMode: "CGST_SGST",
    });

    expect(totals.subtotal).toBe(12000);
    expect(totals.discount).toBe(1000);
    expect(totals.taxable).toBe(11000);
    expect(totals.tax).toBe(1980);
    expect(totals.cgst).toBe(990);
    expect(totals.sgst).toBe(990);
    expect(totals.total).toBe(12980);
  });
});

describe("credit note status permissions", () => {
  it("only allows editing when status is Draft", () => {
    expect(canEditCreditNote("Draft")).toBe(true);
    expect(canEditCreditNote("Issued")).toBe(false);
    expect(canEditCreditNote("Cancelled")).toBe(false);
  });

  it("only allows issuing when status is Draft", () => {
    expect(canIssueCreditNote("Draft")).toBe(true);
    expect(canIssueCreditNote("Issued")).toBe(false);
    expect(canIssueCreditNote("Cancelled")).toBe(false);
  });
});

describe("credit note formatting helpers", () => {
  it("formats currency to Indian Rupees notation", () => {
    expect(formatCreditNoteCurrency(1000)).toContain("1,000");
    expect(formatCreditNoteCurrency(10620.5)).toContain("10,620.5");
  });

  it("formats dates into readable format", () => {
    expect(formatCreditNoteDate("2026-10-13")).toContain("13");
    expect(formatCreditNoteDate("2026-10-13")).toContain("Oct");
    expect(formatCreditNoteDate("2026-10-13")).toContain("2026");
    expect(formatCreditNoteDate("invalid")).toBe("Not supplied");
  });
});
