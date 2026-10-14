import { describe, expect, it } from "vitest";
import {
  determineTaxMode,
  normalizeGstStateCode,
  getGstStateInfo,
  calculateTaxBreakdown,
  validateServerTaxDecision,
} from "./tax-rules";
import { calculateInvoiceTotals } from "../invoice";

describe("GST Tax Rules & Place of Supply Determination", () => {
  describe("normalizeGstStateCode", () => {
    it("normalizes standard 2-digit state codes directly", () => {
      expect(normalizeGstStateCode("27")).toBe("27");
      expect(normalizeGstStateCode("29")).toBe("29");
      expect(normalizeGstStateCode("07")).toBe("07");
    });

    it("normalizes composite state codes (code-name)", () => {
      expect(normalizeGstStateCode("27-Maharashtra")).toBe("27");
      expect(normalizeGstStateCode("29-Karnataka")).toBe("29");
      expect(normalizeGstStateCode("06-Haryana")).toBe("06");
      expect(normalizeGstStateCode("99-Other Territory / Export")).toBe("99");
    });

    it("normalizes state names case-insensitively", () => {
      expect(normalizeGstStateCode("Maharashtra")).toBe("27");
      expect(normalizeGstStateCode("maharashtra")).toBe("27");
      expect(normalizeGstStateCode("MAHARASHTRA")).toBe("27");
      expect(normalizeGstStateCode("Karnataka")).toBe("29");
      expect(normalizeGstStateCode("karnataka")).toBe("29");
      expect(normalizeGstStateCode("Delhi")).toBe("07");
      expect(normalizeGstStateCode("Tamil Nadu")).toBe("33");
      expect(normalizeGstStateCode("West Bengal")).toBe("19");
      expect(normalizeGstStateCode("Goa")).toBe("30");
    });

    it("normalizes state codes from GSTIN strings", () => {
      expect(normalizeGstStateCode("27NGPI00837E1D7")).toBe("27");
      expect(normalizeGstStateCode("29AABCA1234F1Z5")).toBe("29");
      expect(normalizeGstStateCode("06AAACT5678B1Z2")).toBe("06");
    });

    it("returns null for invalid or empty state representations", () => {
      expect(normalizeGstStateCode("")).toBeNull();
      expect(normalizeGstStateCode(undefined)).toBeNull();
      expect(normalizeGstStateCode(null)).toBeNull();
      expect(normalizeGstStateCode("UnknownStateXYZ")).toBeNull();
      expect(normalizeGstStateCode("999")).toBeNull();
    });
  });

  describe("getGstStateInfo", () => {
    it("returns valid state metadata for recognized state inputs", () => {
      const maharashtra = getGstStateInfo("27-Maharashtra");
      expect(maharashtra).toEqual({ code: "27", name: "Maharashtra" });

      const karnataka = getGstStateInfo("Karnataka");
      expect(karnataka).toEqual({ code: "29", name: "Karnataka" });
    });

    it("returns null for unrecognized state", () => {
      expect(getGstStateInfo("Atlantis")).toBeNull();
    });
  });

  describe("Mandatory Tax Decision Tests (Section 8)", () => {
    // 1. Supplier Maharashtra + Place of Supply Karnataka → IGST for a normal taxable supply
    it("1. Supplier Maharashtra + Place of Supply Karnataka → IGST for a normal taxable supply", () => {
      const result = determineTaxMode({
        supplierState: "27-Maharashtra",
        customerPlaceOfSupply: "29-Karnataka",
      });

      expect(result.isValid).toBe(true);
      expect(result.isInterState).toBe(true);
      expect(result.taxMode).toBe("IGST");
      expect(result.supplierStateCode).toBe("27");
      expect(result.customerStateCode).toBe("29");
      expect(result.supplierStateName).toBe("Maharashtra");
      expect(result.customerStateName).toBe("Karnataka");
    });

    // 2. Supplier Maharashtra + Place of Supply Maharashtra → CGST + SGST for a normal taxable supply
    it("2. Supplier Maharashtra + Place of Supply Maharashtra → CGST + SGST for a normal taxable supply", () => {
      const result = determineTaxMode({
        supplierState: "27-Maharashtra",
        customerPlaceOfSupply: "27-Maharashtra",
      });

      expect(result.isValid).toBe(true);
      expect(result.isInterState).toBe(false);
      expect(result.taxMode).toBe("CGST_SGST");
      expect(result.supplierStateCode).toBe("27");
      expect(result.customerStateCode).toBe("27");
    });

    // 3. Supplier Karnataka + Place of Supply Maharashtra → IGST
    it("3. Supplier Karnataka + Place of Supply Maharashtra → IGST", () => {
      const result = determineTaxMode({
        supplierState: "29-Karnataka",
        customerPlaceOfSupply: "27-Maharashtra",
      });

      expect(result.isValid).toBe(true);
      expect(result.isInterState).toBe(true);
      expect(result.taxMode).toBe("IGST");
      expect(result.supplierStateCode).toBe("29");
      expect(result.customerStateCode).toBe("27");
    });

    // 4. Equivalent state representations are normalized correctly
    it("4. Equivalent state representations are normalized correctly", () => {
      // Plain names
      const result1 = determineTaxMode({
        supplierState: "Maharashtra",
        customerPlaceOfSupply: "Karnataka",
      });
      expect(result1.taxMode).toBe("IGST");

      // Pure 2-digit codes
      const result2 = determineTaxMode({
        supplierState: "27",
        customerPlaceOfSupply: "27",
      });
      expect(result2.taxMode).toBe("CGST_SGST");

      // Mixed: Supplier GSTIN vs Customer Composite Place of Supply
      const result3 = determineTaxMode({
        supplierGstin: "27NGPI00837E1D7",
        customerPlaceOfSupply: "29-Karnataka",
      });
      expect(result3.taxMode).toBe("IGST");

      // Mixed: Supplier GSTIN vs Customer GSTIN in same state
      const result4 = determineTaxMode({
        supplierGstin: "27NGPI00837E1D7",
        customerGstin: "27AABCA1234F1Z5",
      });
      expect(result4.taxMode).toBe("CGST_SGST");
    });

    // 5. Missing supplier state → appropriate validation/error behavior
    it("5. Missing supplier state → appropriate validation/error behavior", () => {
      const result = determineTaxMode({
        supplierState: null,
        supplierGstin: null,
        customerPlaceOfSupply: "29-Karnataka",
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Supplier GST registration state is required");
      expect(result.supplierStateCode).toBeNull();
    });

    // 6. Missing Place of Supply → appropriate validation/error behavior
    it("6. Missing Place of Supply → appropriate validation/error behavior", () => {
      const result = determineTaxMode({
        supplierState: "27-Maharashtra",
        customerPlaceOfSupply: null,
        customerGstin: null,
        customerState: null,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Customer Place of Supply is required");
      expect(result.customerStateCode).toBeNull();
    });

    // 7. Special tax treatments already supported retain their intended behavior
    it("7a. Special Economic Zone (SEZ) supply is deemed inter-state (IGST)", () => {
      const result = determineTaxMode({
        supplierState: "27-Maharashtra",
        customerPlaceOfSupply: "27-Maharashtra",
        gstTreatment: "SPECIAL_ECONOMIC_ZONE",
      });

      expect(result.isValid).toBe(true);
      expect(result.isInterState).toBe(true);
      expect(result.taxMode).toBe("IGST");
      expect(result.reason).toContain("Special Economic Zone");
    });

    it("7b. Overseas export is treated as inter-state supply (IGST)", () => {
      const result = determineTaxMode({
        supplierState: "27-Maharashtra",
        customerPlaceOfSupply: "99-Other Territory / Export",
        gstTreatment: "OVERSEAS_EXPORT",
      });

      expect(result.isValid).toBe(true);
      expect(result.isInterState).toBe(true);
      expect(result.taxMode).toBe("IGST");
      expect(result.reason).toContain("Export");
    });
  });

  describe("Tax Breakdown & Arithmetic Consistency (Section 5)", () => {
    it("calculates exact CGST + SGST split for intra-state supply without charging IGST", () => {
      const breakdown = calculateTaxBreakdown(10000, 18, "CGST_SGST");
      expect(breakdown.taxableAmount).toBe(10000);
      expect(breakdown.totalTax).toBe(1800);
      expect(breakdown.cgstAmount).toBe(900);
      expect(breakdown.sgstAmount).toBe(900);
      expect(breakdown.igstAmount).toBe(0);
      expect(breakdown.cgstAmount + breakdown.sgstAmount).toBe(breakdown.totalTax);
    });

    it("calculates exact IGST for inter-state supply without charging CGST or SGST", () => {
      const breakdown = calculateTaxBreakdown(10000, 18, "IGST");
      expect(breakdown.taxableAmount).toBe(10000);
      expect(breakdown.totalTax).toBe(1800);
      expect(breakdown.cgstAmount).toBe(0);
      expect(breakdown.sgstAmount).toBe(0);
      expect(breakdown.igstAmount).toBe(1800);
    });

    it("handles odd paisa rounding consistently without floating point drift", () => {
      // 333.33 taxable @ 18% = 59.9994 -> 60.00 tax -> CGST 30.00, SGST 30.00
      const breakdown = calculateTaxBreakdown(333.33, 18, "CGST_SGST");
      expect(breakdown.totalTax).toBe(60);
      expect(breakdown.cgstAmount).toBe(30);
      expect(breakdown.sgstAmount).toBe(30);
      expect(breakdown.cgstAmount + breakdown.sgstAmount).toBe(breakdown.totalTax);
    });

    it("calculateInvoiceTotals provides cgst, sgst, igst consistent with taxMode", () => {
      const intraInvoice = {
        taxMode: "CGST_SGST" as const,
        amountPaid: 0,
        items: [
          {
            id: "1",
            item: "Item 1",
            description: "",
            quantity: 1,
            unitPrice: 1000,
            discount: 0,
            taxRate: 18,
          },
        ],
      };
      const intraTotals = calculateInvoiceTotals(intraInvoice);
      expect(intraTotals.tax).toBe(180);
      expect(intraTotals.cgst).toBe(90);
      expect(intraTotals.sgst).toBe(90);
      expect(intraTotals.igst).toBe(0);

      const interInvoice = {
        taxMode: "IGST" as const,
        amountPaid: 0,
        items: [
          {
            id: "1",
            item: "Item 1",
            description: "",
            quantity: 1,
            unitPrice: 1000,
            discount: 0,
            taxRate: 18,
          },
        ],
      };
      const interTotals = calculateInvoiceTotals(interInvoice);
      expect(interTotals.tax).toBe(180);
      expect(interTotals.cgst).toBe(0);
      expect(interTotals.sgst).toBe(0);
      expect(interTotals.igst).toBe(180);
    });
  });

  describe("Server-side Validation of Client Tax Submissions (Section 7 & 8)", () => {
    it("accepts valid matching tax mode from client", () => {
      const validation = validateServerTaxDecision({
        invoiceTaxMode: "IGST",
        supplierState: "27-Maharashtra",
        customerPlaceOfSupply: "29-Karnataka",
      });

      expect(validation.isValid).toBe(true);
      expect(validation.expectedTaxMode).toBe("IGST");
    });

    it("rejects manipulated client tax mode (client claims CGST_SGST for inter-state)", () => {
      const validation = validateServerTaxDecision({
        invoiceTaxMode: "CGST_SGST",
        supplierState: "27-Maharashtra",
        customerPlaceOfSupply: "29-Karnataka",
      });

      expect(validation.isValid).toBe(false);
      expect(validation.expectedTaxMode).toBe("IGST");
      expect(validation.error).toContain("Tax treatment mismatch");
    });

    it("rejects manipulated client tax mode (client claims IGST for intra-state)", () => {
      const validation = validateServerTaxDecision({
        invoiceTaxMode: "IGST",
        supplierState: "27-Maharashtra",
        customerPlaceOfSupply: "27-Maharashtra",
      });

      expect(validation.isValid).toBe(false);
      expect(validation.expectedTaxMode).toBe("CGST_SGST");
      expect(validation.error).toContain("Tax treatment mismatch");
    });
  });
});
