import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { CreditNoteStatus as PrismaCreditNoteStatus } from "@/generated/prisma/enums";
import { getPrisma } from "@/shared/lib/prisma";
import type { CreditNote } from "../../domain/credit-note";
import type {
  ICreditNoteRepository,
  CreditNoteFilterCriteria,
  SaveCreditNoteDomainInput,
} from "../../domain/repositories/credit-note-repository";
import {
  toDomainCreditNote,
  toPrismaCreditNoteStatus,
} from "../mappers/prisma-credit-note-mapper";

const Decimal = Prisma.Decimal;

export class PrismaCreditNoteRepository implements ICreditNoteRepository {
  async findById(organizationId: string, id: string): Promise<CreditNote | null> {
    const prisma = getPrisma();
    const record = await prisma.creditNote.findFirst({
      where: {
        organizationId,
        OR: [{ id }, { creditNoteNumber: id }],
      },
      include: {
        items: true,
        invoice: {
          select: { invoiceNumber: true },
        },
      },
    });

    if (!record) return null;
    return toDomainCreditNote(record);
  }

  async findByNumber(
    organizationId: string,
    creditNoteNumber: string,
  ): Promise<CreditNote | null> {
    const prisma = getPrisma();
    const record = await prisma.creditNote.findUnique({
      where: {
        organizationId_creditNoteNumber: {
          organizationId,
          creditNoteNumber,
        },
      },
      include: {
        items: true,
        invoice: {
          select: { invoiceNumber: true },
        },
      },
    });

    if (!record) return null;
    return toDomainCreditNote(record);
  }

  async findMany(
    organizationId: string,
    criteria?: CreditNoteFilterCriteria,
  ): Promise<CreditNote[]> {
    const prisma = getPrisma();
    const whereClause: Prisma.CreditNoteWhereInput = {
      organizationId,
    };

    if (criteria?.status) {
      whereClause.status = toPrismaCreditNoteStatus(criteria.status);
    }

    if (criteria?.customerId) {
      whereClause.customerId = criteria.customerId;
    }

    if (criteria?.invoiceId) {
      whereClause.invoiceId = criteria.invoiceId;
    }

    if (criteria?.query) {
      const q = criteria.query.trim();
      whereClause.OR = [
        { creditNoteNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
        { invoice: { invoiceNumber: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (criteria?.startDate || criteria?.endDate) {
      whereClause.issueDate = {
        ...(criteria.startDate && { gte: new Date(criteria.startDate) }),
        ...(criteria.endDate && { lte: new Date(criteria.endDate) }),
      };
    }

    const records = await prisma.creditNote.findMany({
      where: whereClause,
      include: {
        items: true,
        invoice: {
          select: { invoiceNumber: true },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
    });

    return records.map(toDomainCreditNote);
  }

  async findByInvoiceId(
    organizationId: string,
    invoiceId: string,
  ): Promise<CreditNote[]> {
    const prisma = getPrisma();
    const records = await prisma.creditNote.findMany({
      where: {
        organizationId,
        invoiceId,
      },
      include: {
        items: true,
        invoice: {
          select: { invoiceNumber: true },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
    });

    return records.map(toDomainCreditNote);
  }

  async getIssuedTotalForInvoice(
    organizationId: string,
    invoiceId: string,
    excludeCreditNoteId?: string,
    txClient?: unknown,
  ): Promise<number> {
    const prisma = (txClient as ReturnType<typeof getPrisma>) ?? getPrisma();
    const whereClause: Prisma.CreditNoteWhereInput = {
      organizationId,
      invoiceId,
      status: PrismaCreditNoteStatus.ISSUED,
    };

    if (excludeCreditNoteId) {
      whereClause.id = { not: excludeCreditNoteId };
    }

    const records = await prisma.creditNote.findMany({
      where: whereClause,
      select: { total: true },
    });

    const sum = records.reduce((acc, curr) => acc + Number(curr.total), 0);
    return Math.round((sum + Number.EPSILON) * 100) / 100;
  }

  async create(
    input: SaveCreditNoteDomainInput,
    txClient?: Prisma.TransactionClient,
  ): Promise<CreditNote> {
    const runCreate = async (tx: Prisma.TransactionClient) => {
      const record = await tx.creditNote.create({
        data: {
          id: input.id,
          organizationId: input.organizationId,
          creditNoteNumber: input.creditNoteNumber,
          invoiceId: input.invoiceId,
          customerId: input.customerId ?? null,
          customerName: input.customerName,
          customerEmail: input.customerEmail ?? null,
          customerAddress: input.customerAddress ?? null,
          customerGstin: input.customerGstin ?? null,
          customerPlaceOfSupply: input.customerPlaceOfSupply ?? null,
          issueDate: input.issueDate,
          status: toPrismaCreditNoteStatus(input.status),
          reason: input.reason,
          taxMode: input.taxMode,
          currency: input.currency ?? "INR (₹)",
          subtotal: new Decimal(input.subtotal),
          lineDiscountTotal: new Decimal(input.lineDiscountTotal),
          taxableAmount: new Decimal(input.taxableAmount),
          cgst: new Decimal(input.cgst),
          sgst: new Decimal(input.sgst),
          igst: new Decimal(input.igst),
          totalTax: new Decimal(input.totalTax),
          total: new Decimal(input.total),
          notes: input.notes ?? null,
          terms: input.terms ?? null,
          items: {
            create: input.items.map((it) => ({
              id: it.id,
              invoiceItemId: it.invoiceItemId ?? null,
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
          invoice: {
            select: { invoiceNumber: true },
          },
        },
      });

      return toDomainCreditNote(record);
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
    input: SaveCreditNoteDomainInput,
    txClient?: Prisma.TransactionClient,
  ): Promise<CreditNote> {
    const runUpdate = async (tx: Prisma.TransactionClient) => {
      await tx.creditNoteItem.deleteMany({
        where: { creditNoteId: id },
      });

      const record = await tx.creditNote.update({
        where: {
          id,
          organizationId,
        },
        data: {
          creditNoteNumber: input.creditNoteNumber,
          invoiceId: input.invoiceId,
          customerId: input.customerId ?? null,
          customerName: input.customerName,
          customerEmail: input.customerEmail ?? null,
          customerAddress: input.customerAddress ?? null,
          customerGstin: input.customerGstin ?? null,
          customerPlaceOfSupply: input.customerPlaceOfSupply ?? null,
          issueDate: input.issueDate,
          status: toPrismaCreditNoteStatus(input.status),
          reason: input.reason,
          taxMode: input.taxMode,
          currency: input.currency ?? "INR (₹)",
          subtotal: new Decimal(input.subtotal),
          lineDiscountTotal: new Decimal(input.lineDiscountTotal),
          taxableAmount: new Decimal(input.taxableAmount),
          cgst: new Decimal(input.cgst),
          sgst: new Decimal(input.sgst),
          igst: new Decimal(input.igst),
          totalTax: new Decimal(input.totalTax),
          total: new Decimal(input.total),
          notes: input.notes ?? null,
          terms: input.terms ?? null,
          items: {
            create: input.items.map((it) => ({
              id: it.id,
              invoiceItemId: it.invoiceItemId ?? null,
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
          invoice: {
            select: { invoiceNumber: true },
          },
        },
      });

      return toDomainCreditNote(record);
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
    await prisma.creditNote.deleteMany({
      where: {
        id,
        organizationId,
      },
    });
  }
}

export const creditNoteRepository = new PrismaCreditNoteRepository();
