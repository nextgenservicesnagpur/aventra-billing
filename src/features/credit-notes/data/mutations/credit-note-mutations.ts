"use server";

import { revalidatePath } from "next/cache";
import { InvoiceStatus as PrismaInvoiceStatus } from "@/generated/prisma/enums";
import { getPrisma } from "@/shared/lib/prisma";
import { resolveCreditNoteContext } from "../context/credit-note-context";
import { creditNoteRepository } from "../../infrastructure/repositories/prisma-credit-note-repository";
import { invoiceRepository } from "@/features/invoices/infrastructure/repositories/prisma-invoice-repository";
import { billingSettingsRepository } from "@/features/billing-settings/infrastructure/repositories/prisma-billing-settings-repository";
import {
  calculateCreditNoteTotals,
  lineTax,
  lineTaxable,
  roundCurrency,
  type CreditNote,
  type CreditNoteLineItem,
} from "../../domain/credit-note";
import { calculateInvoiceTotals } from "@/features/invoices/domain/invoice";
import {
  calculateCreditAvailability,
  isInvoiceEligibleForCredit,
  validateCreditNoteLineItems,
} from "../../domain/rules/credit-calculation-rules";
import {
  createCreditNoteSchema,
  updateCreditNoteSchema,
} from "../validators/credit-note-schemas";
import type {
  CreateCreditNoteInputDto,
  CreditNoteActionResult,
  UpdateCreditNoteInputDto,
} from "../dto/credit-note-dto";
import {
  CreditNoteNotFoundError,
  DuplicateCreditNoteNumberError,
  ExceededInvoiceCreditLimitError,
  IneligibleInvoiceForCreditError,
  InvalidCreditNoteStatusTransitionError,
  CreditNoteImmutableError,
} from "../../domain/errors/credit-note-errors";

export const createCreditNoteAction = async (
  input: CreateCreditNoteInputDto,
): Promise<CreditNoteActionResult<CreditNote>> => {
  try {
    const parseResult = createCreditNoteSchema.safeParse(input);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const pathKey = issue.path.join(".");
        fieldErrors[pathKey] = issue.message;
      }
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors,
      };
    }

    const { organizationId } = await resolveCreditNoteContext();
    const data = parseResult.data;

    // 1. Authoritative verification of original invoice
    const originalInvoice = await invoiceRepository.findById(
      organizationId,
      data.invoiceId,
    );
    if (!originalInvoice) {
      return {
        success: false,
        error: `Original invoice '${data.invoiceId}' does not exist or does not belong to your organization.`,
      };
    }

    if (!isInvoiceEligibleForCredit(originalInvoice.status)) {
      throw new IneligibleInvoiceForCreditError(
        originalInvoice.number,
        originalInvoice.status,
      );
    }

    // 2. Prepare domain line items
    const domainItems: CreditNoteLineItem[] = data.items.map((it, idx) => ({
      id: it.id || `cn_line_${idx + 1}_${crypto.randomUUID().slice(0, 8)}`,
      invoiceItemId: it.invoiceItemId,
      productId: it.productId,
      item: it.item,
      description: it.description || "",
      hsnSac: it.hsnSac || undefined,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discount: it.discount,
      taxRate: it.taxRate,
    }));

    const lineErrors = validateCreditNoteLineItems(domainItems);
    if (Object.keys(lineErrors).length > 0) {
      return {
        success: false,
        error: "Invalid line items provided.",
        fieldErrors: lineErrors,
      };
    }

    // 3. Authoritative totals calculation using original invoice taxMode
    const calculatedTotals = calculateCreditNoteTotals({
      items: domainItems,
      taxMode: originalInvoice.taxMode,
    });

    if (calculatedTotals.total <= 0) {
      return {
        success: false,
        error: "Credit note total must be greater than zero.",
      };
    }

    const prisma = getPrisma();

    // 4. Concurrency-safe atomic transaction
    const saved = await prisma.$transaction(async (tx) => {
      // Row-lock the invoice to serialize concurrent credit notes on this invoice
      await tx.$queryRaw`
        SELECT "id" FROM invoice
        WHERE "id" = ${originalInvoice.id} AND "organizationId" = ${organizationId}
        FOR UPDATE
      `;

      // Calculate authoritative remaining credit availability
      const previouslyIssuedTotal =
        await creditNoteRepository.getIssuedTotalForInvoice(
          organizationId,
          originalInvoice.id,
          undefined,
          tx,
        );

      const invoiceTotal = calculateInvoiceTotals(originalInvoice).total;
      const availabilityCheck = calculateCreditAvailability({
        invoiceTotal,
        previouslyCreditedTotal: previouslyIssuedTotal,
        newCreditTotal: calculatedTotals.total,
      });

      if (!availabilityCheck.isAllowed) {
        throw new ExceededInvoiceCreditLimitError(
          calculatedTotals.total,
          availabilityCheck.remainingAvailableCredit,
          originalInvoice.number,
        );
      }

      // Allocate unique credit note number
      let finalNumber = data.creditNoteNumber?.trim();
      if (!finalNumber) {
        const allocated = await billingSettingsRepository.allocateNextNumber(
          organizationId,
          "CREDIT_NOTE",
          tx,
        );
        finalNumber = allocated.allocatedNumber;
      } else {
        const existing = await tx.creditNote.findUnique({
          where: {
            organizationId_creditNoteNumber: {
              organizationId,
              creditNoteNumber: finalNumber,
            },
          },
          select: { id: true },
        });
        if (existing) {
          throw new DuplicateCreditNoteNumberError(finalNumber);
        }
      }

      const creditNoteId = `cn_${crypto.randomUUID()}`;

      const repositoryItems = domainItems.map((it, idx) => {
        const taxable = lineTaxable(it);
        const taxAmt = lineTax(it);
        const lineTot = roundCurrency(taxable + taxAmt);
        return {
          id: `cn_item_${crypto.randomUUID()}`,
          invoiceItemId: it.invoiceItemId ?? null,
          productId: it.productId ?? null,
          item: it.item,
          description: it.description ?? null,
          hsnSac: it.hsnSac ?? null,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          taxRate: it.taxRate,
          taxableAmount: taxable,
          taxAmount: taxAmt,
          lineTotal: lineTot,
          sortOrder: idx,
        };
      });

      // Fallback default notes and terms from Billing Settings if not provided
      let effectiveNotes = data.notes?.trim() || null;
      let effectiveTerms = data.terms?.trim() || null;
      if (!effectiveNotes || !effectiveTerms) {
        const settings = await billingSettingsRepository.getSettings(
          organizationId,
          "CREDIT_NOTE",
          tx,
        );
        if (!effectiveNotes && settings.defaultNotes) {
          effectiveNotes = settings.defaultNotes;
        }
        if (!effectiveTerms && settings.defaultTerms) {
          effectiveTerms = settings.defaultTerms;
        }
      }

      const createdRecord = await creditNoteRepository.create(
        {
          id: creditNoteId,
          organizationId,
          creditNoteNumber: finalNumber,
          invoiceId: originalInvoice.id,
          customerId: originalInvoice.customerId ?? null,
          customerName: originalInvoice.customer,
          customerEmail: originalInvoice.customerEmail || null,
          customerAddress: originalInvoice.customerAddress || null,
          customerGstin: originalInvoice.customerGstin || null,
          customerPlaceOfSupply: originalInvoice.customerPlaceOfSupply || null,
          issueDate: new Date(`${data.issueDate}T00:00:00.000Z`),
          status: data.status,
          reason: data.reason,
          taxMode: originalInvoice.taxMode,
          currency: "INR (₹)",
          subtotal: calculatedTotals.subtotal,
          lineDiscountTotal: calculatedTotals.discount,
          taxableAmount: calculatedTotals.taxable,
          cgst: calculatedTotals.cgst,
          sgst: calculatedTotals.sgst,
          igst: calculatedTotals.igst,
          totalTax: calculatedTotals.tax,
          total: calculatedTotals.total,
          notes: effectiveNotes,
          terms: effectiveTerms,
          items: repositoryItems,
        },
        tx,
      );

      // If issuing immediately, calculate remaining receivable on original invoice and update status if fully or partially settled
      if (data.status === "Issued") {
        const totalCreditedAfter = roundCurrency(previouslyIssuedTotal + calculatedTotals.total);
        const settledAmount = roundCurrency(originalInvoice.amountPaid + totalCreditedAfter);
        const remainingReceivable = roundCurrency(Math.max(0, invoiceTotal - settledAmount));

        if (remainingReceivable <= 0 && originalInvoice.status !== "Paid") {
          await tx.invoice.update({
            where: { id: originalInvoice.id },
            data: { status: PrismaInvoiceStatus.PAID },
          });
        } else if (
          settledAmount > 0 &&
          remainingReceivable > 0 &&
          (originalInvoice.status === "Issued" || originalInvoice.status === "Overdue")
        ) {
          await tx.invoice.update({
            where: { id: originalInvoice.id },
            data: { status: PrismaInvoiceStatus.PARTIALLY_PAID },
          });
        }
      }

      return createdRecord;
    });

    revalidatePath("/credit-notes");
    revalidatePath("/credit-notes/new");
    revalidatePath(`/credit-notes/${saved.id}`);
    revalidatePath(`/invoices/${originalInvoice.id}`);
    revalidatePath("/settings/billing");

    return {
      success: true,
      data: saved,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};

export const updateCreditNoteAction = async (
  input: UpdateCreditNoteInputDto,
): Promise<CreditNoteActionResult<CreditNote>> => {
  try {
    const parseResult = updateCreditNoteSchema.safeParse(input);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const pathKey = issue.path.join(".");
        fieldErrors[pathKey] = issue.message;
      }
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors,
      };
    }

    const { organizationId } = await resolveCreditNoteContext();
    const data = parseResult.data;

    const existing = await creditNoteRepository.findById(organizationId, data.id);
    if (!existing) {
      throw new CreditNoteNotFoundError(data.id);
    }

    // Only Draft credit notes can be edited
    if (existing.status !== "Draft") {
      throw new CreditNoteImmutableError(existing.creditNoteNumber);
    }

    const originalInvoice = await invoiceRepository.findById(
      organizationId,
      existing.invoiceId,
    );
    if (!originalInvoice) {
      return {
        success: false,
        error: "Referenced original invoice no longer exists.",
      };
    }

    const domainItems: CreditNoteLineItem[] = data.items.map((it, idx) => ({
      id: it.id || `cn_line_${idx + 1}_${crypto.randomUUID().slice(0, 8)}`,
      invoiceItemId: it.invoiceItemId,
      productId: it.productId,
      item: it.item,
      description: it.description || "",
      hsnSac: it.hsnSac || undefined,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discount: it.discount,
      taxRate: it.taxRate,
    }));

    const lineErrors = validateCreditNoteLineItems(domainItems);
    if (Object.keys(lineErrors).length > 0) {
      return {
        success: false,
        error: "Invalid line items provided.",
        fieldErrors: lineErrors,
      };
    }

    const calculatedTotals = calculateCreditNoteTotals({
      items: domainItems,
      taxMode: existing.taxMode,
    });

    if (calculatedTotals.total <= 0) {
      return {
        success: false,
        error: "Credit note total must be greater than zero.",
      };
    }

    const prisma = getPrisma();

    const updated = await prisma.$transaction(async (tx) => {
      // Row-lock invoice
      await tx.$queryRaw`
        SELECT "id" FROM invoice
        WHERE "id" = ${originalInvoice.id} AND "organizationId" = ${organizationId}
        FOR UPDATE
      `;

      // Check remaining limit excluding this draft
      const previouslyIssuedTotal =
        await creditNoteRepository.getIssuedTotalForInvoice(
          organizationId,
          originalInvoice.id,
          existing.id,
          tx,
        );

      const invoiceTotal = calculateInvoiceTotals(originalInvoice).total;
      const availabilityCheck = calculateCreditAvailability({
        invoiceTotal,
        previouslyCreditedTotal: previouslyIssuedTotal,
        newCreditTotal: calculatedTotals.total,
      });

      if (!availabilityCheck.isAllowed) {
        throw new ExceededInvoiceCreditLimitError(
          calculatedTotals.total,
          availabilityCheck.remainingAvailableCredit,
          originalInvoice.number,
        );
      }

      let finalNumber = existing.creditNoteNumber;
      if (data.creditNoteNumber && data.creditNoteNumber !== existing.creditNoteNumber) {
        const conflict = await tx.creditNote.findUnique({
          where: {
            organizationId_creditNoteNumber: {
              organizationId,
              creditNoteNumber: data.creditNoteNumber,
            },
          },
          select: { id: true },
        });
        if (conflict && conflict.id !== existing.id) {
          throw new DuplicateCreditNoteNumberError(data.creditNoteNumber);
        }
        finalNumber = data.creditNoteNumber;
      }

      const repositoryItems = domainItems.map((it, idx) => {
        const taxable = lineTaxable(it);
        const taxAmt = lineTax(it);
        const lineTot = roundCurrency(taxable + taxAmt);
        return {
          id: `cn_item_${crypto.randomUUID()}`,
          invoiceItemId: it.invoiceItemId ?? null,
          productId: it.productId ?? null,
          item: it.item,
          description: it.description ?? null,
          hsnSac: it.hsnSac ?? null,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          taxRate: it.taxRate,
          taxableAmount: taxable,
          taxAmount: taxAmt,
          lineTotal: lineTot,
          sortOrder: idx,
        };
      });

      return await creditNoteRepository.update(
        organizationId,
        existing.id,
        {
          id: existing.id,
          organizationId,
          creditNoteNumber: finalNumber,
          invoiceId: existing.invoiceId,
          customerId: originalInvoice.customerId ?? null,
          customerName: originalInvoice.customer,
          customerEmail: originalInvoice.customerEmail || null,
          customerAddress: originalInvoice.customerAddress || null,
          customerGstin: originalInvoice.customerGstin || null,
          customerPlaceOfSupply: originalInvoice.customerPlaceOfSupply || null,
          issueDate: new Date(`${data.issueDate}T00:00:00.000Z`),
          status: data.status,
          reason: data.reason,
          taxMode: existing.taxMode,
          currency: existing.currency,
          subtotal: calculatedTotals.subtotal,
          lineDiscountTotal: calculatedTotals.discount,
          taxableAmount: calculatedTotals.taxable,
          cgst: calculatedTotals.cgst,
          sgst: calculatedTotals.sgst,
          igst: calculatedTotals.igst,
          totalTax: calculatedTotals.tax,
          total: calculatedTotals.total,
          notes: data.notes || null,
          terms: data.terms || null,
          items: repositoryItems,
        },
        tx,
      );
    });

    revalidatePath("/credit-notes");
    revalidatePath(`/credit-notes/${updated.id}`);
    revalidatePath(`/invoices/${originalInvoice.id}`);

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};

export const issueCreditNoteAction = async (
  id: string,
): Promise<CreditNoteActionResult<CreditNote>> => {
  try {
    const { organizationId } = await resolveCreditNoteContext();

    const existing = await creditNoteRepository.findById(organizationId, id);
    if (!existing) {
      throw new CreditNoteNotFoundError(id);
    }

    if (existing.status !== "Draft") {
      throw new InvalidCreditNoteStatusTransitionError(existing.status, "issue");
    }

    const originalInvoice = await invoiceRepository.findById(
      organizationId,
      existing.invoiceId,
    );
    if (!originalInvoice) {
      return {
        success: false,
        error: "Referenced original invoice does not exist.",
      };
    }

    const currentExisting = existing;
    const currentInvoice = originalInvoice;

    const prisma = getPrisma();

    const issued = await prisma.$transaction(async (tx) => {
      // Row-lock invoice
      await tx.$queryRaw`
        SELECT "id" FROM invoice
        WHERE "id" = ${currentInvoice.id} AND "organizationId" = ${organizationId}
        FOR UPDATE
      `;

      const previouslyIssuedTotal =
        await creditNoteRepository.getIssuedTotalForInvoice(
          organizationId,
          currentInvoice.id,
          currentExisting.id,
          tx,
        );

      const invoiceTotal = calculateInvoiceTotals(currentInvoice).total;
      const availabilityCheck = calculateCreditAvailability({
        invoiceTotal,
        previouslyCreditedTotal: previouslyIssuedTotal,
        newCreditTotal: currentExisting.total,
      });

      if (!availabilityCheck.isAllowed) {
        throw new ExceededInvoiceCreditLimitError(
          currentExisting.total,
          availabilityCheck.remainingAvailableCredit,
          currentInvoice.number,
        );
      }

      const repositoryItems = currentExisting.items.map((it, idx) => ({
        id: `cn_item_${crypto.randomUUID()}`,
        invoiceItemId: it.invoiceItemId ?? null,
        productId: it.productId ?? null,
        item: it.item,
        description: it.description ?? null,
        hsnSac: it.hsnSac ?? null,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        taxRate: it.taxRate,
        taxableAmount: lineTaxable(it),
        taxAmount: lineTax(it),
        lineTotal: roundCurrency(lineTaxable(it) + lineTax(it)),
        sortOrder: idx,
      }));

      const updatedRecord = await creditNoteRepository.update(
        organizationId,
        currentExisting.id,
        {
          id: currentExisting.id,
          organizationId,
          creditNoteNumber: currentExisting.creditNoteNumber,
          invoiceId: currentExisting.invoiceId,
          customerId: currentExisting.customerId ?? null,
          customerName: currentExisting.customerName,
          customerEmail: currentExisting.customerEmail || null,
          customerAddress: currentExisting.customerAddress || null,
          customerGstin: currentExisting.customerGstin || null,
          customerPlaceOfSupply: currentExisting.customerPlaceOfSupply || null,
          issueDate: new Date(`${currentExisting.issueDate}T00:00:00.000Z`),
          status: "Issued",
          reason: currentExisting.reason,
          taxMode: currentExisting.taxMode,
          currency: currentExisting.currency,
          subtotal: currentExisting.subtotal,
          lineDiscountTotal: currentExisting.lineDiscountTotal,
          taxableAmount: currentExisting.taxableAmount,
          cgst: currentExisting.cgst,
          sgst: currentExisting.sgst,
          igst: currentExisting.igst,
          totalTax: currentExisting.totalTax,
          total: currentExisting.total,
          notes: currentExisting.notes || null,
          terms: currentExisting.terms || null,
          items: repositoryItems,
        },
        tx,
      );

      // Calculate remaining receivable on original invoice and update status if fully or partially settled
      const totalCreditedAfter = roundCurrency(previouslyIssuedTotal + currentExisting.total);
      const settledAmount = roundCurrency(currentInvoice.amountPaid + totalCreditedAfter);
      const remainingReceivable = roundCurrency(Math.max(0, invoiceTotal - settledAmount));

      if (remainingReceivable <= 0 && currentInvoice.status !== "Paid") {
        await tx.invoice.update({
          where: { id: currentInvoice.id },
          data: { status: PrismaInvoiceStatus.PAID },
        });
      } else if (
        settledAmount > 0 &&
        remainingReceivable > 0 &&
        (currentInvoice.status === "Issued" || currentInvoice.status === "Overdue")
      ) {
        await tx.invoice.update({
          where: { id: currentInvoice.id },
          data: { status: PrismaInvoiceStatus.PARTIALLY_PAID },
        });
      }

      return updatedRecord;
    });

    revalidatePath("/credit-notes");
    revalidatePath(`/credit-notes/${issued.id}`);
    revalidatePath(`/invoices/${originalInvoice.id}`);

    return {
      success: true,
      data: issued,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};

export const deleteCreditNoteAction = async (
  id: string,
): Promise<CreditNoteActionResult<{ id: string }>> => {
  try {
    const { organizationId } = await resolveCreditNoteContext();

    const existing = await creditNoteRepository.findById(organizationId, id);
    if (!existing) {
      throw new CreditNoteNotFoundError(id);
    }

    if (existing.status !== "Draft") {
      throw new InvalidCreditNoteStatusTransitionError(existing.status, "delete");
    }

    await creditNoteRepository.delete(organizationId, id);

    revalidatePath("/credit-notes");
    revalidatePath(`/invoices/${existing.invoiceId}`);

    return {
      success: true,
      data: { id },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};
