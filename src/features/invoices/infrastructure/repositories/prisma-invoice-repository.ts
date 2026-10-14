import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/shared/lib/prisma";

import { CreditNoteStatus as PrismaCreditNoteStatus } from "@/generated/prisma/enums";

const Decimal = Prisma.Decimal;
import type { Invoice } from "../../domain/invoice";
import type {
  IInvoiceRepository,
  InvoiceFilterCriteria,
  SaveInvoiceDomainInput,
} from "../../domain/repositories/invoice-repository";
import {
  toDomainInvoice,
  toPrismaInvoiceStatus,
} from "../mappers/prisma-invoice-mapper";

export class PrismaInvoiceRepository implements IInvoiceRepository {
  async findById(organizationId: string, id: string): Promise<Invoice | null> {
    const prisma = getPrisma();
    const record = await prisma.invoice.findFirst({
      where: {
        organizationId,
        OR: [{ id }, { invoiceNumber: id }],
      },
      include: {
        items: true,
        creditNotes: {
          where: {
            status: PrismaCreditNoteStatus.ISSUED,
          },
          select: {
            total: true,
          },
        },
      },
    });

    if (!record) return null;
    return toDomainInvoice(record);
  }

  async findByNumber(
    organizationId: string,
    invoiceNumber: string,
  ): Promise<Invoice | null> {
    const prisma = getPrisma();
    const record = await prisma.invoice.findUnique({
      where: {
        organizationId_invoiceNumber: {
          organizationId,
          invoiceNumber,
        },
      },
      include: {
        items: true,
        creditNotes: {
          where: {
            status: PrismaCreditNoteStatus.ISSUED,
          },
          select: {
            total: true,
          },
        },
      },
    });

    if (!record) return null;
    return toDomainInvoice(record);
  }

  async findMany(
    organizationId: string,
    criteria?: InvoiceFilterCriteria,
  ): Promise<Invoice[]> {
    const prisma = getPrisma();
    const whereClause: Prisma.InvoiceWhereInput = {
      organizationId,
    };

    if (criteria?.status) {
      whereClause.status = toPrismaInvoiceStatus(criteria.status);
    }

    if (criteria?.customerId) {
      whereClause.customerId = criteria.customerId;
    }

    if (criteria?.query) {
      const q = criteria.query.trim();
      whereClause.OR = [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
      ];
    }

    if (criteria?.startDate || criteria?.endDate) {
      whereClause.issueDate = {
        ...(criteria.startDate && { gte: new Date(criteria.startDate) }),
        ...(criteria.endDate && { lte: new Date(criteria.endDate) }),
      };
    }

    const records = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        items: true,
        creditNotes: {
          where: {
            status: PrismaCreditNoteStatus.ISSUED,
          },
          select: {
            total: true,
          },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
    });

    return records.map(toDomainInvoice);
  }

  async create(input: SaveInvoiceDomainInput, txClient?: Prisma.TransactionClient): Promise<Invoice> {
    const runCreate = async (tx: Prisma.TransactionClient) => {
      const record = await tx.invoice.create({
        data: {
          id: input.id,
          organizationId: input.organizationId,
          invoiceNumber: input.invoiceNumber,
          customerId: input.customerId ?? null,
          customerName: input.customerName,
          customerEmail: input.customerEmail ?? null,
          customerAddress: input.customerAddress ?? null,
          customerGstin: input.customerGstin ?? null,
          customerPlaceOfSupply: input.customerPlaceOfSupply ?? null,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          paymentTerms: input.paymentTerms,
          status: toPrismaInvoiceStatus(input.status),
          taxMode: input.taxMode,
          currency: input.currency ?? "INR (₹)",
          subtotal: new Decimal(input.subtotal),
          lineDiscountTotal: new Decimal(input.lineDiscountTotal),
          additionalDiscount: new Decimal(input.additionalDiscount),
          additionalDiscountType: input.additionalDiscountType,
          additionalDiscountLabel: input.additionalDiscountLabel ?? null,
          additionalCharges: new Decimal(input.additionalCharges),
          additionalChargesLabel: input.additionalChargesLabel ?? null,
          taxableAmount: new Decimal(input.taxableAmount),
          cgst: new Decimal(input.cgst),
          sgst: new Decimal(input.sgst),
          igst: new Decimal(input.igst),
          totalTax: new Decimal(input.totalTax),
          total: new Decimal(input.total),
          amountPaid: new Decimal(input.amountPaid),
          notes: input.notes ?? null,
          terms: input.terms ?? null,
          items: {
            create: input.items.map((it) => ({
              id: it.id,
              productId: it.productId ?? null,
              item: it.item,
              description: it.description ?? null,
              hsnSac: it.hsnSac ?? null,
              quantity: new Decimal(it.quantity),
              unitPrice: new Decimal(it.unitPrice),
              discount: new Decimal(it.discount),
              taxRate: new Decimal(it.taxRate),
              taxableAmount: new Decimal(it.taxableAmount),
              taxAmount: new Decimal(it.taxAmount),
              lineTotal: new Decimal(it.lineTotal),
              sortOrder: it.sortOrder,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return toDomainInvoice(record);
    };

    if (txClient) {
      return await runCreate(txClient);
    }

    const prisma = getPrisma();
    return await prisma.$transaction(async (tx) => {
      return await runCreate(tx);
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: SaveInvoiceDomainInput,
    txClient?: Prisma.TransactionClient,
  ): Promise<Invoice> {
    const runUpdate = async (tx: Prisma.TransactionClient) => {
      // First delete existing items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Update invoice record and re-create line items
      const record = await tx.invoice.update({
        where: {
          id,
          organizationId,
        },
        data: {
          invoiceNumber: input.invoiceNumber,
          customerId: input.customerId ?? null,
          customerName: input.customerName,
          customerEmail: input.customerEmail ?? null,
          customerAddress: input.customerAddress ?? null,
          customerGstin: input.customerGstin ?? null,
          customerPlaceOfSupply: input.customerPlaceOfSupply ?? null,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          paymentTerms: input.paymentTerms,
          status: toPrismaInvoiceStatus(input.status),
          taxMode: input.taxMode,
          currency: input.currency ?? "INR (₹)",
          subtotal: new Decimal(input.subtotal),
          lineDiscountTotal: new Decimal(input.lineDiscountTotal),
          additionalDiscount: new Decimal(input.additionalDiscount),
          additionalDiscountType: input.additionalDiscountType,
          additionalDiscountLabel: input.additionalDiscountLabel ?? null,
          additionalCharges: new Decimal(input.additionalCharges),
          additionalChargesLabel: input.additionalChargesLabel ?? null,
          taxableAmount: new Decimal(input.taxableAmount),
          cgst: new Decimal(input.cgst),
          sgst: new Decimal(input.sgst),
          igst: new Decimal(input.igst),
          totalTax: new Decimal(input.totalTax),
          total: new Decimal(input.total),
          amountPaid: new Decimal(input.amountPaid),
          notes: input.notes ?? null,
          terms: input.terms ?? null,
          items: {
            create: input.items.map((it) => ({
              id: it.id,
              productId: it.productId ?? null,
              item: it.item,
              description: it.description ?? null,
              hsnSac: it.hsnSac ?? null,
              quantity: new Decimal(it.quantity),
              unitPrice: new Decimal(it.unitPrice),
              discount: new Decimal(it.discount),
              taxRate: new Decimal(it.taxRate),
              taxableAmount: new Decimal(it.taxableAmount),
              taxAmount: new Decimal(it.taxAmount),
              lineTotal: new Decimal(it.lineTotal),
              sortOrder: it.sortOrder,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return toDomainInvoice(record);
    };

    if (txClient) {
      return await runUpdate(txClient);
    }

    const prisma = getPrisma();
    return await prisma.$transaction(async (tx) => {
      return await runUpdate(tx);
    });
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.invoice.deleteMany({
      where: {
        id,
        organizationId,
      },
    });
  }
}

export const invoiceRepository = new PrismaInvoiceRepository();
