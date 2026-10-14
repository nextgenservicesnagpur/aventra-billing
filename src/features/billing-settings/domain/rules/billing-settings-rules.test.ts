import { describe, it, expect } from "vitest";
import {
  formatDocumentNumber,
  validatePrefix,
  validateSuffix,
  validateNextNumber,
  validatePadding,
  validateDefaultNotes,
  validateDefaultTerms,
  DEFAULT_DOCUMENT_CONFIGS,
} from "./billing-settings-rules";
import {
  InvalidNumberFormatError,
  BillingSettingsDomainError,
} from "../errors/billing-settings-errors";

describe("Billing Settings Domain Rules", () => {
  describe("formatDocumentNumber", () => {
    it("formats standard invoice document numbers with 4 digits padding", () => {
      const formatted = formatDocumentNumber({
        prefix: "INV-",
        nextNumber: 1,
        padding: 4,
      });
      expect(formatted).toBe("INV-0001");
    });

    it("formats debit notes, credit notes, and recurring invoices correctly", () => {
      expect(
        formatDocumentNumber({ prefix: "DN-", nextNumber: 42, padding: 4 }),
      ).toBe("DN-0042");

      expect(
        formatDocumentNumber({ prefix: "CN-", nextNumber: 999, padding: 4 }),
      ).toBe("CN-0999");

      expect(
        formatDocumentNumber({ prefix: "REC-", nextNumber: 5, padding: 5 }),
      ).toBe("REC-00005");
    });

    it("appends optional suffix when provided", () => {
      const formatted = formatDocumentNumber({
        prefix: "INV-",
        nextNumber: 7,
        padding: 4,
        suffix: "/2026-27",
      });
      expect(formatted).toBe("INV-0007/2026-27");
    });

    it("handles large sequence numbers exceeding initial padding without truncating", () => {
      const formatted = formatDocumentNumber({
        prefix: "INV-",
        nextNumber: 15420,
        padding: 4,
      });
      expect(formatted).toBe("INV-15420");
    });

    it("throws InvalidNumberFormatError for non-positive or NaN numbers", () => {
      expect(() =>
        formatDocumentNumber({ prefix: "INV-", nextNumber: 0, padding: 4 }),
      ).toThrow(InvalidNumberFormatError);

      expect(() =>
        formatDocumentNumber({ prefix: "INV-", nextNumber: -5, padding: 4 }),
      ).toThrow(InvalidNumberFormatError);

      expect(() =>
        formatDocumentNumber({ prefix: "INV-", nextNumber: NaN, padding: 4 }),
      ).toThrow(InvalidNumberFormatError);
    });
  });

  describe("Validation Rules", () => {
    it("validates valid prefix strings", () => {
      expect(validatePrefix("INV-")).toBe("INV-");
      expect(validatePrefix("TAX/2026/")).toBe("TAX/2026/");
      expect(validatePrefix("BILL_")).toBe("BILL_");
    });

    it("rejects empty prefix or invalid characters", () => {
      expect(() => validatePrefix("")).toThrow(InvalidNumberFormatError);
      expect(() => validatePrefix("   ")).toThrow(InvalidNumberFormatError);
      expect(() => validatePrefix("INV#01")).toThrow(InvalidNumberFormatError);
      expect(() => validatePrefix("INV 01")).toThrow(InvalidNumberFormatError);
      expect(() => validatePrefix("A".repeat(25))).toThrow(InvalidNumberFormatError);
    });

    it("validates suffix strings", () => {
      expect(validateSuffix(null)).toBeNull();
      expect(validateSuffix("")).toBeNull();
      expect(validateSuffix("/26-27")).toBe("/26-27");
      expect(() => validateSuffix("@suffix")).toThrow(InvalidNumberFormatError);
      expect(() => validateSuffix("B".repeat(25))).toThrow(InvalidNumberFormatError);
    });

    it("validates sequence next numbers", () => {
      expect(validateNextNumber(1)).toBe(1);
      expect(validateNextNumber(500)).toBe(500);
      expect(() => validateNextNumber(0)).toThrow(InvalidNumberFormatError);
      expect(() => validateNextNumber(-10)).toThrow(InvalidNumberFormatError);
      expect(() => validateNextNumber(1_000_000_000)).toThrow(InvalidNumberFormatError);
    });

    it("validates padding boundaries (1 to 10)", () => {
      expect(validatePadding(1)).toBe(1);
      expect(validatePadding(4)).toBe(4);
      expect(validatePadding(10)).toBe(10);
      expect(() => validatePadding(0)).toThrow(InvalidNumberFormatError);
      expect(() => validatePadding(11)).toThrow(InvalidNumberFormatError);
    });

    it("validates default notes and terms length", () => {
      expect(validateDefaultNotes("Valid notes")).toBe("Valid notes");
      expect(validateDefaultNotes(null)).toBeNull();
      expect(() => validateDefaultNotes("X".repeat(2001))).toThrow(BillingSettingsDomainError);

      expect(validateDefaultTerms("Valid terms")).toBe("Valid terms");
      expect(validateDefaultTerms(null)).toBeNull();
      expect(() => validateDefaultTerms("Y".repeat(2001))).toThrow(BillingSettingsDomainError);
    });

    it("provides complete default configurations for all 4 document types", () => {
      const types = ["INVOICE", "DEBIT_NOTE", "CREDIT_NOTE", "RECURRING_INVOICE"] as const;
      for (const t of types) {
        const config = DEFAULT_DOCUMENT_CONFIGS[t];
        expect(config).toBeDefined();
        expect(config.prefix.length).toBeGreaterThan(0);
        expect(config.nextNumber).toBe(1);
        expect(config.padding).toBe(4);
        expect(config.label).toBeDefined();
      }
    });
  });
});
