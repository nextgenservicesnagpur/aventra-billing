import { describe, expect, it } from "vitest";
import {
  derivePanFromGstin,
  isGstinRequired,
  isValidEmailFormat,
  isValidGstinFormat,
  isValidGstStateCode,
  isValidPanFormat,
  isValidPhoneFormat,
  validateCustomerInvariants,
} from "./customer-rules";

describe("Customer Domain Rules", () => {
  describe("Tax Identification Checks", () => {
    it("identifies when GSTIN is required based on registration type", () => {
      expect(isGstinRequired("REGISTERED_BUSINESS_REGULAR")).toBe(true);
      expect(isGstinRequired("SPECIAL_ECONOMIC_ZONE")).toBe(true);
      expect(isGstinRequired("COMPOSITION_SCHEME")).toBe(true);
      expect(isGstinRequired("CONSUMER_UNREGISTERED")).toBe(false);
      expect(isGstinRequired("OVERSEAS_EXPORT")).toBe(false);
    });

    it("validates 15-character GSTIN structure accurately with valid state codes", () => {
      expect(isValidGstinFormat("27AABCG9912D1Z9")).toBe(true);
      expect(isValidGstinFormat("29AABCA1234F1Z5")).toBe(true);
      expect(isValidGstinFormat("06AAACT5678B1Z2")).toBe(true);
      // TAN-based TDS Deductor GSTIN (Maharashtra: 27, TAN: NGPI00837E, Entity: 1, Type: D, Checksum: 7)
      expect(isValidGstinFormat("27NGPI00837E1D7")).toBe(true);
      expect(isValidGstinFormat("12345")).toBe(false);
      expect(isValidGstinFormat("INVALIDGSTIN123")).toBe(false);
      // Invalid state code 00 or 98
      expect(isValidGstinFormat("00AABCG9912D1Z9")).toBe(false);
      expect(isValidGstinFormat("98AABCG9912D1Z9")).toBe(false);
    });

    it("validates Indian GST state codes", () => {
      expect(isValidGstStateCode("27")).toBe(true); // Maharashtra
      expect(isValidGstStateCode("29")).toBe(true); // Karnataka
      expect(isValidGstStateCode("07")).toBe(true); // Delhi
      expect(isValidGstStateCode("99")).toBe(true); // Center
      expect(isValidGstStateCode("00")).toBe(false);
      expect(isValidGstStateCode("98")).toBe(false);
    });

    it("auto-extracts PAN from valid or partial GSTIN", () => {
      expect(derivePanFromGstin("27AABCG9912D1Z9")).toBe("AABCG9912D");
      expect(derivePanFromGstin("29AABCA1234F1Z5")).toBe("AABCA1234F");
      expect(derivePanFromGstin("06AAACT5678B1Z2")).toBe("AAACT5678B");
      // Partial GSTIN with at least 12 chars containing a valid PAN
      expect(derivePanFromGstin("27AABCG9912D")).toBe("AABCG9912D");
      // TAN-based GSTIN extracts the 10-character TAN (tax identifier)
      expect(derivePanFromGstin("27NGPI00837E1D7")).toBe("NGPI00837E");
      expect(derivePanFromGstin("27NGPI00837E")).toBe("NGPI00837E");
      // Invalid candidates
      expect(derivePanFromGstin("271234567890")).toBe(null);
      expect(derivePanFromGstin("123")).toBe(null);
    });

    it("validates 10-character PAN structure accurately", () => {
      expect(isValidPanFormat("AABCG9912D")).toBe(true);
      expect(isValidPanFormat("ABCDE1234F")).toBe(true);
      expect(isValidPanFormat("NGPI00837E")).toBe(true);
      expect(isValidPanFormat("NOTAPAN")).toBe(false);
      expect(isValidPanFormat("12345ABCDE")).toBe(false);
    });
  });

  describe("Contact Format Checks", () => {
    it("validates email formats", () => {
      expect(isValidEmailFormat("test@domain.com")).toBe(true);
      expect(isValidEmailFormat("billing.support@company.co.in")).toBe(true);
      expect(isValidEmailFormat("not-an-email")).toBe(false);
      expect(isValidEmailFormat("@domain.com")).toBe(false);
    });

    it("validates phone number formats", () => {
      expect(isValidPhoneFormat("+91 98220 54321")).toBe(true);
      expect(isValidPhoneFormat("9822054321")).toBe(true);
      expect(isValidPhoneFormat("123")).toBe(false);
    });
  });

  describe("validateCustomerInvariants", () => {
    it("requires customer name with at least 2 characters", () => {
      expect(validateCustomerInvariants({ name: "" }).isValid).toBe(false);
      expect(validateCustomerInvariants({ name: "A" }).isValid).toBe(false);
      expect(validateCustomerInvariants({ name: "Acme Corp" }).isValid).toBe(true);
    });

    it("enforces GSTIN requirement when treatment is REGISTERED_BUSINESS_REGULAR", () => {
      const res = validateCustomerInvariants({
        name: "Acme Corp",
        gstTreatment: "REGISTERED_BUSINESS_REGULAR",
        gstin: "",
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.gstin).toBe("GSTIN is required for registered businesses.");
    });

    it("validates that PAN matches the PAN embedded in the GSTIN if both are present", () => {
      const mismatch = validateCustomerInvariants({
        name: "Acme Corp",
        gstTreatment: "REGISTERED_BUSINESS_REGULAR",
        gstin: "27AABCG9912D1Z9",
        pan: "ZZZZZ9999Z",
      });
      expect(mismatch.isValid).toBe(false);
      expect(mismatch.errors.pan).toContain("does not match");

      const match = validateCustomerInvariants({
        name: "Acme Corp",
        gstTreatment: "REGISTERED_BUSINESS_REGULAR",
        gstin: "27AABCG9912D1Z9",
        pan: "AABCG9912D",
      });
      expect(match.isValid).toBe(true);
    });

    it("rejects negative credit limits", () => {
      const res = validateCustomerInvariants({
        name: "Acme Corp",
        creditLimit: -100,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.creditLimit).toBe("Credit limit cannot be negative.");
    });

    it("rejects discounts outside 0-100%", () => {
      const under = validateCustomerInvariants({
        name: "Acme Corp",
        defaultDiscount: -5,
      });
      expect(under.isValid).toBe(false);
      expect(under.errors.defaultDiscount).toBe("Default discount must be between 0% and 100%.");

      const over = validateCustomerInvariants({
        name: "Acme Corp",
        defaultDiscount: 105,
      });
      expect(over.isValid).toBe(false);
      expect(over.errors.defaultDiscount).toBe("Default discount must be between 0% and 100%.");
    });
  });
});
