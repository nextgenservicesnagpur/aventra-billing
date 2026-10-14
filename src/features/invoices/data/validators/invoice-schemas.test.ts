import { describe, expect, it } from "vitest";
import { createInvoiceSchema } from "./invoice-schemas";

describe("invoice-schemas", () => {
  const validPayload = {
    customerName: "Acme Corp",
    issueDate: "2026-10-15",
    dueDate: "2026-10-30",
    paymentTerms: "Net 15 days",
    status: "Draft",
    taxMode: "CGST_SGST",
    items: [
      {
        item: "Web Consulting",
        quantity: 2,
        unitPrice: 25000,
        discount: 10,
        taxRate: 18,
      },
    ],
  };

  it("validates a correct invoice creation payload", () => {
    const result = createInvoiceSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("fails when customer name is missing", () => {
    const result = createInvoiceSchema.safeParse({
      ...validPayload,
      customerName: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("fails when due date is before issue date", () => {
    const result = createInvoiceSchema.safeParse({
      ...validPayload,
      issueDate: "2026-10-20",
      dueDate: "2026-10-10",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Due date must be on or after issue date");
    }
  });

  it("fails when items array is empty", () => {
    const result = createInvoiceSchema.safeParse({
      ...validPayload,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("fails when item quantity is zero or negative", () => {
    const result = createInvoiceSchema.safeParse({
      ...validPayload,
      items: [
        {
          item: "Web Consulting",
          quantity: 0,
          unitPrice: 100,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("fails when percentage discount exceeds 100", () => {
    const result = createInvoiceSchema.safeParse({
      ...validPayload,
      additionalDiscount: 120,
      additionalDiscountType: "percentage",
    });
    expect(result.success).toBe(false);
  });
});
