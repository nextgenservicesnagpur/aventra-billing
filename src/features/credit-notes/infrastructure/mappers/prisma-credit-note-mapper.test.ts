import { describe, expect, it } from "vitest";
import { CreditNoteStatus as PrismaCreditNoteStatus } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import {
  toDomainCreditNote,
  toDomainCreditNoteStatus,
  toPrismaCreditNoteStatus,
} from "./prisma-credit-note-mapper";

const Decimal = Prisma.Decimal;

describe("prisma-credit-note-mapper", () => {
  it("maps Prisma credit note statuses to domain statuses correctly", () => {
    expect(toDomainCreditNoteStatus(PrismaCreditNoteStatus.DRAFT)).toBe("Draft");
    expect(toDomainCreditNoteStatus(PrismaCreditNoteStatus.ISSUED)).toBe("Issued");
    expect(toDomainCreditNoteStatus(PrismaCreditNoteStatus.CANCELLED)).toBe("Cancelled");
  });

  it("maps Domain credit note statuses to Prisma statuses correctly", () => {
    expect(toPrismaCreditNoteStatus("Draft")).toBe(PrismaCreditNoteStatus.DRAFT);
    expect(toPrismaCreditNoteStatus("Issued")).toBe(PrismaCreditNoteStatus.ISSUED);
    expect(toPrismaCreditNoteStatus("Cancelled")).toBe(PrismaCreditNoteStatus.CANCELLED);
  });

  it("maps Prisma record with Decimal values and relations to Domain credit note entity", () => {
    const prismaRecord = {
      id: "cn-test-1",
      organizationId: "org-test-1",
      creditNoteNumber: "CN-2026-0001",
      invoiceId: "inv-test-1",
      customerId: "cust-1",
      customerName: "Acme Enterprises",
      customerEmail: "billing@acme.com",
      customerAddress: "Mumbai, MH",
      customerGstin: "27ABCDE1234F1Z5",
      customerPlaceOfSupply: "27-Maharashtra",
      issueDate: new Date("2026-10-15T00:00:00.000Z"),
      status: PrismaCreditNoteStatus.ISSUED,
      reason: "Defective equipment returned",
      taxMode: "CGST_SGST",
      currency: "INR (₹)",
      subtotal: new Decimal(50000),
      lineDiscountTotal: new Decimal(2500),
      taxableAmount: new Decimal(47500),
      cgst: new Decimal(4275),
      sgst: new Decimal(4275),
      igst: new Decimal(0),
      totalTax: new Decimal(8550),
      total: new Decimal(56050),
      notes: "Credit note against INV-2026-0001",
      terms: "Adjusted against future orders",
      createdAt: new Date("2026-10-15T10:00:00.000Z"),
      updatedAt: new Date("2026-10-15T10:00:00.000Z"),
      invoice: {
        invoiceNumber: "INV-2026-0001",
      },
      items: [
        {
          id: "cn-item-2",
          creditNoteId: "cn-test-1",
          invoiceItemId: "inv-item-2",
          productId: "prod-2",
          item: "Setup Fee",
          description: "One-time setup",
          hsnSac: "998313",
          quantity: new Decimal(1),
          unitPrice: new Decimal(10000),
          discount: new Decimal(0),
          taxRate: new Decimal(18),
          taxableAmount: new Decimal(10000),
          taxAmount: new Decimal(1800),
          lineTotal: new Decimal(11800),
          sortOrder: 1,
          createdAt: new Date("2026-10-15T10:00:00.000Z"),
          updatedAt: new Date("2026-10-15T10:00:00.000Z"),
        },
        {
          id: "cn-item-1",
          creditNoteId: "cn-test-1",
          invoiceItemId: "inv-item-1",
          productId: "prod-1",
          item: "Cloud Server",
          description: "Monthly unit",
          hsnSac: "998314",
          quantity: new Decimal(2),
          unitPrice: new Decimal(20000),
          discount: new Decimal(5),
          taxRate: new Decimal(18),
          taxableAmount: new Decimal(38000),
          taxAmount: new Decimal(6840),
          lineTotal: new Decimal(44840),
          sortOrder: 0,
          createdAt: new Date("2026-10-15T10:00:00.000Z"),
          updatedAt: new Date("2026-10-15T10:00:00.000Z"),
        },
      ],
    };

    const domain = toDomainCreditNote(prismaRecord as Parameters<typeof toDomainCreditNote>[0]);

    expect(domain.id).toBe("cn-test-1");
    expect(domain.creditNoteNumber).toBe("CN-2026-0001");
    expect(domain.invoiceId).toBe("inv-test-1");
    expect(domain.invoiceNumber).toBe("INV-2026-0001");
    expect(domain.customerName).toBe("Acme Enterprises");
    expect(domain.status).toBe("Issued");
    expect(domain.reason).toBe("Defective equipment returned");
    expect(domain.taxMode).toBe("CGST_SGST");
    expect(domain.subtotal).toBe(50000);
    expect(domain.total).toBe(56050);
    // Verifies sort order sorting
    expect(domain.items[0].id).toBe("cn-item-1");
    expect(domain.items[1].id).toBe("cn-item-2");
    expect(domain.items[0].quantity).toBe(2);
    expect(domain.items[0].unitPrice).toBe(20000);
  });
});
