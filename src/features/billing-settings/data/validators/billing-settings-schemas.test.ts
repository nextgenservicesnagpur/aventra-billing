import { describe, it, expect } from "vitest";
import { updateBillingSettingsSchema } from "./billing-settings-schemas";

describe("Billing Settings Zod Schemas", () => {
  it("validates valid invoice settings input", () => {
    const input = {
      documentType: "INVOICE",
      prefix: "INV-",
      suffix: "/2026",
      nextNumber: 15,
      padding: 4,
      defaultNotes: "Payment due within 15 days",
      defaultTerms: "Standard service terms",
    };

    const parsed = updateBillingSettingsSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.documentType).toBe("INVOICE");
      expect(parsed.data.prefix).toBe("INV-");
      expect(parsed.data.suffix).toBe("/2026");
      expect(parsed.data.nextNumber).toBe(15);
      expect(parsed.data.padding).toBe(4);
    }
  });

  it("fails when prefix contains illegal characters", () => {
    const input = {
      documentType: "DEBIT_NOTE",
      prefix: "DN #1",
      nextNumber: 1,
      padding: 4,
    };

    const parsed = updateBillingSettingsSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("fails when nextNumber is zero or negative", () => {
    const input = {
      documentType: "CREDIT_NOTE",
      prefix: "CN-",
      nextNumber: 0,
      padding: 4,
    };

    const parsed = updateBillingSettingsSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("fails when padding is outside 1 to 10", () => {
    const input = {
      documentType: "RECURRING_INVOICE",
      prefix: "REC-",
      nextNumber: 1,
      padding: 12,
    };

    const parsed = updateBillingSettingsSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("fails when default notes exceed 2000 characters", () => {
    const input = {
      documentType: "INVOICE",
      prefix: "INV-",
      nextNumber: 1,
      padding: 4,
      defaultNotes: "A".repeat(2001),
    };

    const parsed = updateBillingSettingsSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });
});
