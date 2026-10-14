import { describe, expect, it } from "vitest";
import {
  createCreditNoteSchema,
  updateCreditNoteSchema,
  creditNoteLineItemSchema,
} from "./credit-note-schemas";

describe("creditNoteLineItemSchema", () => {
  it("validates valid line item", () => {
    const valid = {
      item: "Solar Panel 400W",
      description: "Mono PERC",
      quantity: 5,
      unitPrice: 12000,
      discount: 5,
      taxRate: 12,
    };
    const result = creditNoteLineItemSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails on zero or negative quantity", () => {
    const invalid = {
      item: "Battery Unit",
      quantity: 0,
      unitPrice: 5000,
    };
    const result = creditNoteLineItemSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("createCreditNoteSchema", () => {
  const baseValid = {
    invoiceId: "inv-123",
    issueDate: "2026-10-13",
    reason: "Damaged during transit",
    items: [
      {
        item: "Item 1",
        quantity: 2,
        unitPrice: 500,
        discount: 0,
        taxRate: 18,
      },
    ],
  };

  it("accepts valid credit note creation payload", () => {
    const result = createCreditNoteSchema.safeParse(baseValid);
    expect(result.success).toBe(true);
  });

  it("requires original invoice reference", () => {
    const result = createCreditNoteSchema.safeParse({ ...baseValid, invoiceId: "" });
    expect(result.success).toBe(false);
  });

  it("requires valid date format", () => {
    const result = createCreditNoteSchema.safeParse({ ...baseValid, issueDate: "13/10/2026" });
    expect(result.success).toBe(false);
  });

  it("requires at least one item", () => {
    const result = createCreditNoteSchema.safeParse({ ...baseValid, items: [] });
    expect(result.success).toBe(false);
  });
});

describe("updateCreditNoteSchema", () => {
  it("requires id for update", () => {
    const result = updateCreditNoteSchema.safeParse({
      id: "",
      issueDate: "2026-10-13",
      reason: "Correction",
      items: [
        {
          item: "Item 1",
          quantity: 1,
          unitPrice: 100,
          discount: 0,
          taxRate: 18,
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
