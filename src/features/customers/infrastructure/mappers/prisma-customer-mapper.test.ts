import { describe, expect, it } from "vitest";
import { toDomainCustomer } from "./prisma-customer-mapper";
import type { Customer as PrismaCustomer } from "@/generated/prisma/client";

describe("PrismaCustomerMapper", () => {
  it("correctly maps a Prisma database customer record to a domain Customer entity", () => {
    const now = new Date();
    const row = {
      id: "cust-123",
      organizationId: "org-456",
      name: "Nagpur Logistics Pvt Ltd",
      customerType: "BUSINESS",
      gstTreatment: "REGISTERED_BUSINESS_REGULAR",
      status: "ACTIVE",
      contactPerson: "Santosh Deshmukh",
      email: "accounts@nagpurlogistics.com",
      phone: "+91 712 2555666",
      alternatePhone: null,
      billingAddressLine1: "Plot 42 MIDC Hingna",
      billingAddressLine2: null,
      billingCity: "Nagpur",
      billingState: "Maharashtra",
      billingPinCode: "440016",
      billingCountry: "India",
      sameAsBillingAddress: true,
      shippingAddressLine1: "Plot 42 MIDC Hingna",
      shippingAddressLine2: null,
      shippingCity: "Nagpur",
      shippingState: "Maharashtra",
      shippingPinCode: "440016",
      shippingCountry: "India",
      gstin: "27AABCN1234D1Z8",
      pan: "AABCN1234D",
      currency: "INR (₹)",
      placeOfSupply: "27-Maharashtra",
      paymentTerms: "Net 30 days",
      creditLimit: 500000,
      defaultDiscount: 10,
      defaultTaxPreference: "18% (IGST)",
      priceList: "Default Price List",
      internalNotes: "Key enterprise client.",
      tags: ["Enterprise", "Logistics"],
      createdAt: now,
      updatedAt: now,
    } as unknown as PrismaCustomer;

    const entity = toDomainCustomer(row);

    expect(entity.id).toBe("cust-123");
    expect(entity.organizationId).toBe("org-456");
    expect(entity.name).toBe("Nagpur Logistics Pvt Ltd");
    expect(entity.customerType).toBe("BUSINESS");
    expect(entity.billingAddress.city).toBe("Nagpur");
    expect(entity.billingAddress.pinCode).toBe("440016");
    expect(entity.sameAsBillingAddress).toBe(true);
    expect(entity.creditLimit).toBe(500000);
    expect(entity.tags).toEqual(["Enterprise", "Logistics"]);
  });
});
