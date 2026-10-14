import { describe, expect, it } from "vitest";
import {
  calculateCreditAvailability,
  isInvoiceEligibleForCredit,
  validateCreditNoteLineItems,
} from "./credit-calculation-rules";
import type { CreditNoteLineItem } from "../credit-note";

describe("invoice credit eligibility rules", () => {
  it("permits issued, partially paid, paid, and overdue invoices", () => {
    expect(isInvoiceEligibleForCredit("Issued")).toBe(true);
    expect(isInvoiceEligibleForCredit("ISSUED")).toBe(true);
    expect(isInvoiceEligibleForCredit("Partially Paid")).toBe(true);
    expect(isInvoiceEligibleForCredit("PARTIALLY_PAID")).toBe(true);
    expect(isInvoiceEligibleForCredit("Paid")).toBe(true);
    expect(isInvoiceEligibleForCredit("PAID")).toBe(true);
    expect(isInvoiceEligibleForCredit("Overdue")).toBe(true);
    expect(isInvoiceEligibleForCredit("OVERDUE")).toBe(true);
  });

  it("rejects draft and cancelled invoices", () => {
    expect(isInvoiceEligibleForCredit("Draft")).toBe(false);
    expect(isInvoiceEligibleForCredit("DRAFT")).toBe(false);
    expect(isInvoiceEligibleForCredit("Cancelled")).toBe(false);
    expect(isInvoiceEligibleForCredit("CANCELLED")).toBe(false);
    expect(isInvoiceEligibleForCredit("Unknown")).toBe(false);
  });
});

describe("credit availability calculations", () => {
  it("allows a full credit when no prior credit notes exist", () => {
    const result = calculateCreditAvailability({
      invoiceTotal: 10000,
      previouslyCreditedTotal: 0,
      newCreditTotal: 10000,
    });

    expect(result.isAllowed).toBe(true);
    expect(result.remainingAvailableCredit).toBe(10000);
    expect(result.error).toBeUndefined();
  });

  it("allows a partial credit within remaining available limit", () => {
    const result = calculateCreditAvailability({
      invoiceTotal: 10000,
      previouslyCreditedTotal: 4000,
      newCreditTotal: 3000,
    });

    expect(result.isAllowed).toBe(true);
    expect(result.remainingAvailableCredit).toBe(6000);
    expect(result.error).toBeUndefined();
  });

  it("allows an exact remaining credit up to the available penny", () => {
    const result = calculateCreditAvailability({
      invoiceTotal: 10000.5,
      previouslyCreditedTotal: 6000.25,
      newCreditTotal: 4000.25,
    });

    expect(result.isAllowed).toBe(true);
    expect(result.remainingAvailableCredit).toBe(4000.25);
  });

  it("rejects when credit total exceeds remaining available invoice limit", () => {
    const result = calculateCreditAvailability({
      invoiceTotal: 10000,
      previouslyCreditedTotal: 7000,
      newCreditTotal: 3500,
    });

    expect(result.isAllowed).toBe(false);
    expect(result.remainingAvailableCredit).toBe(3000);
    expect(result.error).toContain("exceeds remaining available invoice credit");
  });

  it("rejects non-positive credit note amounts", () => {
    const result = calculateCreditAvailability({
      invoiceTotal: 10000,
      previouslyCreditedTotal: 0,
      newCreditTotal: 0,
    });

    expect(result.isAllowed).toBe(false);
    expect(result.error).toBe("Credit note total must be greater than zero.");
  });
});

describe("credit line items validation", () => {
  const validItem: CreditNoteLineItem = {
    id: "1",
    item: "Product A",
    description: "",
    quantity: 1,
    unitPrice: 100,
    discount: 5,
    taxRate: 18,
  };

  it("passes valid line items", () => {
    const errors = validateCreditNoteLineItems([validItem]);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("flags empty item list", () => {
    const errors = validateCreditNoteLineItems([]);
    expect(errors.items).toBeTruthy();
  });

  it("flags invalid line items fields", () => {
    const invalidItem: CreditNoteLineItem = {
      id: "2",
      item: "",
      description: "",
      quantity: -1,
      unitPrice: -50,
      discount: 150,
      taxRate: -10,
    };

    const errors = validateCreditNoteLineItems([invalidItem]);
    expect(errors["item-0"]).toBeTruthy();
    expect(errors["quantity-0"]).toBeTruthy();
    expect(errors["price-0"]).toBeTruthy();
    expect(errors["discount-0"]).toBeTruthy();
    expect(errors["tax-0"]).toBeTruthy();
  });
});
