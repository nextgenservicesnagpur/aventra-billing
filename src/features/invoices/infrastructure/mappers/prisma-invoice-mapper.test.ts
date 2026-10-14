import { describe, expect, it } from "vitest";
import { InvoiceStatus as PrismaInvoiceStatus } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";

const Decimal = Prisma.Decimal;
import {
  toDomainInvoice,
  toDomainInvoiceStatus,
  toPrismaInvoiceStatus,
} from "./prisma-invoice-mapper";

describe("prisma-invoice-mapper", () => {
  it("maps Prisma invoice statuses to domain statuses correctly", () => {
    expect(toDomainInvoiceStatus(PrismaInvoiceStatus.DRAFT)).toBe("Draft");
    expect(toDomainInvoiceStatus(PrismaInvoiceStatus.ISSUED)).toBe("Issued");
    expect(toDomainInvoiceStatus(PrismaInvoiceStatus.PARTIALLY_PAID)).toBe("Partially Paid");
    expect(toDomainInvoiceStatus(PrismaInvoiceStatus.PAID)).toBe("Paid");
    expect(toDomainInvoiceStatus(PrismaInvoiceStatus.OVERDUE)).toBe("Overdue");
    expect(toDomainInvoiceStatus(PrismaInvoiceStatus.CANCELLED)).toBe("Cancelled");
  });

  it("maps Domain invoice statuses to Prisma statuses correctly", () => {
    expect(toPrismaInvoiceStatus("Draft")).toBe(PrismaInvoiceStatus.DRAFT);
    expect(toPrismaInvoiceStatus("Issued")).toBe(PrismaInvoiceStatus.ISSUED);
    expect(toPrismaInvoiceStatus("Partially Paid")).toBe(PrismaInvoiceStatus.PARTIALLY_PAID);
    expect(toPrismaInvoiceStatus("Paid")).toBe(PrismaInvoiceStatus.PAID);
    expect(toPrismaInvoiceStatus("Overdue")).toBe(PrismaInvoiceStatus.OVERDUE);
    expect(toPrismaInvoiceStatus("Cancelled")).toBe(PrismaInvoiceStatus.CANCELLED);
  });

  it("maps Prisma record with decimal totals and items to Domain invoice entity", () => {
    const prismaRecord = {
      id: "inv-test-1",
      organizationId: "org-test-1",
      invoiceNumber: "INV-2026-0001",
      customerId: "cust-1",
      customerName: "Acme Tech Pvt Ltd",
      customerEmail: "billing@acme.com",
      customerAddress: "Bangalore, KA",
      customerGstin: "29AABCA1234F1Z5",
      customerPlaceOfSupply: "29-Karnataka",
      issueDate: new Date("2026-10-15T00:00:00.000Z"),
      dueDate: new Date("2026-10-30T00:00:00.000Z"),
      paymentTerms: "Net 15 days",
      status: PrismaInvoiceStatus.ISSUED,
      taxMode: "IGST",
      currency: "INR (₹)",
      subtotal: new Decimal(100000),
      lineDiscountTotal: new Decimal(5000),
      additionalDiscount: new Decimal(2000),
      additionalDiscountType: "fixed",
      additionalDiscountLabel: "Loyalty Discount",
      additionalCharges: new Decimal(1500),
      additionalChargesLabel: "Freight",
      taxableAmount: new Decimal(93000),
      cgst: new Decimal(0),
      sgst: new Decimal(0),
      igst: new Decimal(16740),
      totalTax: new Decimal(16740),
      total: new Decimal(111240),
      amountPaid: new Decimal(0),
      notes: "Prompt payment appreciated.",
      terms: "Standard Aventra terms.",
      createdAt: new Date("2026-10-15T10:00:00.000Z"),
      updatedAt: new Date("2026-10-15T10:00:00.000Z"),
      items: [
        {
          id: "item-1",
          invoiceId: "inv-test-1",
          productId: "prod-1",
          item: "Cloud Infrastructure Setup",
          description: "AWS multi-region architecture",
          hsnSac: "998313",
          quantity: new Decimal(1),
          unitPrice: new Decimal(100000),
          discount: new Decimal(5),
          taxRate: new Decimal(18),
          taxableAmount: new Decimal(95000),
          taxAmount: new Decimal(17100),
          lineTotal: new Decimal(112100),
          sortOrder: 0,
          createdAt: new Date("2026-10-15T10:00:00.000Z"),
          updatedAt: new Date("2026-10-15T10:00:00.000Z"),
        },
      ],
    };

    const domainInvoice = toDomainInvoice(
      prismaRecord as Parameters<typeof toDomainInvoice>[0],
    );

    expect(domainInvoice.id).toBe("inv-test-1");
    expect(domainInvoice.number).toBe("INV-2026-0001");
    expect(domainInvoice.customer).toBe("Acme Tech Pvt Ltd");
    expect(domainInvoice.customerPlaceOfSupply).toBe("29-Karnataka");
    expect(domainInvoice.issueDate).toBe("2026-10-15");
    expect(domainInvoice.dueDate).toBe("2026-10-30");
    expect(domainInvoice.status).toBe("Issued");
    expect(domainInvoice.taxMode).toBe("IGST");
    expect(domainInvoice.additionalCharges).toBe(1500);
    expect(domainInvoice.additionalDiscount).toBe(2000);
    expect(domainInvoice.items).toHaveLength(1);
    expect(domainInvoice.items[0].quantity).toBe(1);
    expect(domainInvoice.items[0].unitPrice).toBe(100000);
  });
});
