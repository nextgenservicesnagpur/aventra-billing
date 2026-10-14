import { describe, expect, it } from "vitest";
import { validateCustomer } from "./customerValidation";

describe("validateCustomer", () => {
  it("requires customer name", () => {
    const res = validateCustomer({ name: "" });
    expect(res.isValid).toBe(false);
    expect(res.errors.name).toBe("Customer name is required.");
  });

  it("requires at least 2 characters for customer name", () => {
    const res = validateCustomer({ name: "A" });
    expect(res.isValid).toBe(false);
    expect(res.errors.name).toBe("Customer name must be at least 2 characters.");
  });

  it("validates email format if provided", () => {
    const invalid = validateCustomer({
      name: "Global Traders",
      email: "not-an-email",
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.email).toBe("Please enter a valid email address.");

    const valid = validateCustomer({
      name: "Global Traders",
      email: "info@globaltraders.in",
    });
    expect(valid.isValid).toBe(true);
  });

  it("validates phone number if provided", () => {
    const invalid = validateCustomer({
      name: "Global Traders",
      phone: "123",
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.phone).toBeDefined();

    const valid = validateCustomer({
      name: "Global Traders",
      phone: "+91 98220 54321",
    });
    expect(valid.isValid).toBe(true);
  });

  it("requires GSTIN for registered businesses and enforces 15-character structure", () => {
    const missing = validateCustomer({
      name: "Global Traders",
      gstTreatment: "Registered Business (Regular)",
      gstin: "",
    });
    expect(missing.isValid).toBe(false);
    expect(missing.errors.gstin).toBe(
      "GSTIN is required for registered businesses.",
    );

    const invalid = validateCustomer({
      name: "Global Traders",
      gstTreatment: "Registered Business (Regular)",
      gstin: "12345",
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.gstin).toContain("15-character format");

    const valid = validateCustomer({
      name: "Global Traders",
      gstTreatment: "Registered Business (Regular)",
      gstin: "27AABCG9912D1Z9",
    });
    expect(valid.isValid).toBe(true);

    const validTds = validateCustomer({
      name: "Nagpur Municipal Corporation",
      gstTreatment: "Registered Business (Regular)",
      gstin: "27NGPI00837E1D7",
    });
    expect(validTds.isValid).toBe(true);
  });

  it("validates PAN format if provided", () => {
    const invalid = validateCustomer({
      name: "Global Traders",
      pan: "INVALIDPAN",
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.pan).toBeDefined();

    const valid = validateCustomer({
      name: "Global Traders",
      pan: "AABCG9912D",
    });
    expect(valid.isValid).toBe(true);
  });

  it("validates credit limit and discount boundaries", () => {
    const negLimit = validateCustomer({
      name: "Global Traders",
      additionalSettings: {
        paymentTerms: "Net 15 days",
        creditLimit: -500,
        defaultTaxPreference: "18% (IGST)",
        priceList: "Default Price List",
      },
    });
    expect(negLimit.isValid).toBe(false);
    expect(negLimit.errors.creditLimit).toBe("Credit limit cannot be negative.");

    const overDiscount = validateCustomer({
      name: "Global Traders",
      additionalSettings: {
        paymentTerms: "Net 15 days",
        defaultDiscount: 150,
        defaultTaxPreference: "18% (IGST)",
        priceList: "Default Price List",
      },
    });
    expect(overDiscount.isValid).toBe(false);
    expect(overDiscount.errors.defaultDiscount).toBe(
      "Default discount must be between 0% and 100%.",
    );
  });
});
