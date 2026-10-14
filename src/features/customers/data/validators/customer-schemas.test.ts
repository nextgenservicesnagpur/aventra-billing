import { describe, expect, it } from "vitest";
import {
  createCustomerSchema,
  customerFilterSchema,
} from "./customer-schemas";

describe("Customer Schemas (Zod)", () => {
  const validBaseCustomer = {
    name: "Aventra Tech Solutions",
    customerType: "BUSINESS" as const,
    gstTreatment: "REGISTERED_BUSINESS_REGULAR" as const,
    status: "ACTIVE" as const,
    contactPerson: "Javed Pathan",
    email: "javed@aventra.io",
    phone: "+91 98201 12345",
    billingAddress: {
      addressLine1: "101 Corporate Park",
      city: "Nagpur",
      state: "Maharashtra",
      pinCode: "440001",
      country: "India",
    },
    gstin: "27AABCA1234F1Z5",
    pan: "AABCA1234F",
    currency: "INR (₹)",
    placeOfSupply: "27-Maharashtra",
    paymentTerms: "Net 15 days",
    creditLimit: 150000,
    defaultDiscount: 5,
    defaultTaxPreference: "18% (IGST)",
    priceList: "Default Price List",
    sameAsBillingAddress: true,
  };

  it("successfully parses a valid customer payload with matching GSTIN and PAN", () => {
    const result = createCustomerSchema.safeParse(validBaseCustomer);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Aventra Tech Solutions");
      expect(result.data.billingAddress.city).toBe("Nagpur");
    }
  });

  it("fails when customer name has fewer than 2 characters", () => {
    const result = createCustomerSchema.safeParse({
      ...validBaseCustomer,
      name: "A",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 2 characters");
    }
  });

  it("requires GSTIN when gstTreatment is REGISTERED_BUSINESS_REGULAR", () => {
    const result = createCustomerSchema.safeParse({
      ...validBaseCustomer,
      gstTreatment: "REGISTERED_BUSINESS_REGULAR",
      gstin: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const gstinIssue = result.error.issues.find((i) => i.path.includes("gstin"));
      expect(gstinIssue?.message).toBe("GSTIN is required for registered businesses.");
    }
  });

  it("rejects invalid GSTIN formats", () => {
    const invalidFormat = createCustomerSchema.safeParse({
      ...validBaseCustomer,
      gstin: "INVALIDGSTIN",
    });
    expect(invalidFormat.success).toBe(false);

    const invalidState = createCustomerSchema.safeParse({
      ...validBaseCustomer,
      gstin: "98AABCA1234F1Z5", // 98 is not a valid Indian state code
    });
    expect(invalidState.success).toBe(false);
  });

  it("accepts valid TAN-based TDS Deductor GSTINs without requiring an embedded PAN", () => {
    const tdsCustomer = createCustomerSchema.safeParse({
      ...validBaseCustomer,
      gstin: "27NGPI00837E1D7",
      pan: "",
    });
    expect(tdsCustomer.success).toBe(true);
  });

  it("rejects PAN that does not match the PAN embedded in the GSTIN", () => {
    const mismatch = createCustomerSchema.safeParse({
      ...validBaseCustomer,
      gstin: "27AABCA1234F1Z5",
      pan: "XXXXX9999X",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      const panIssue = mismatch.error.issues.find((i) => i.path.includes("pan"));
      expect(panIssue?.message).toBe("PAN must match the PAN embedded in the GSTIN.");
    }
  });

  it("permits empty GSTIN when gstTreatment is CONSUMER_UNREGISTERED", () => {
    const result = createCustomerSchema.safeParse({
      ...validBaseCustomer,
      gstTreatment: "CONSUMER_UNREGISTERED",
      gstin: "",
      pan: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative credit limits", () => {
    const result = createCustomerSchema.safeParse({
      ...validBaseCustomer,
      creditLimit: -500,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email formats", () => {
    const result = createCustomerSchema.safeParse({
      ...validBaseCustomer,
      email: "invalid-email-address",
    });
    expect(result.success).toBe(false);
  });

  it("validates pagination defaults and boundaries in customerFilterSchema", () => {
    const parsed = customerFilterSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(8);
    expect(parsed.customerType).toBe("ALL");
  });
});
