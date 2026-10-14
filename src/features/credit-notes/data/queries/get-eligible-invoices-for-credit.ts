import "server-only";

import { resolveCreditNoteContext } from "../context/credit-note-context";
import { invoiceRepository } from "@/features/invoices/infrastructure/repositories/prisma-invoice-repository";
import { creditNoteRepository } from "../../infrastructure/repositories/prisma-credit-note-repository";
import { isInvoiceEligibleForCredit } from "../../domain/rules/credit-calculation-rules";
import { roundCurrency } from "../../domain/credit-note";
import { calculateInvoiceTotals } from "@/features/invoices/domain/invoice";
import type { EligibleInvoiceSummaryDto } from "../dto/credit-note-dto";

export const getEligibleInvoicesForCredit = async (
  options?: { includeInvoiceId?: string },
): Promise<EligibleInvoiceSummaryDto[]> => {
  const { organizationId } = await resolveCreditNoteContext();
  const allInvoices = await invoiceRepository.findMany(organizationId);

  // Filter to eligible statuses (not Draft, not Cancelled)
  const eligibleInvoices = allInvoices.filter((inv) =>
    isInvoiceEligibleForCredit(inv.status),
  );

  const results: EligibleInvoiceSummaryDto[] = [];

  for (const inv of eligibleInvoices) {
    const creditedTotal = await creditNoteRepository.getIssuedTotalForInvoice(
      organizationId,
      inv.id,
    );

    const invTotals = calculateInvoiceTotals(inv);
    const remaining = roundCurrency(Math.max(0, invTotals.total - creditedTotal));

    if (remaining <= 0 && options?.includeInvoiceId !== inv.id) {
      continue;
    }

    results.push({
      id: inv.id,
      invoiceNumber: inv.number,
      customerId: inv.customerId,
      customerName: inv.customer,
      customerEmail: inv.customerEmail,
      customerAddress: inv.customerAddress,
      customerGstin: inv.customerGstin,
      customerPlaceOfSupply: inv.customerPlaceOfSupply,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      taxMode: inv.taxMode,
      total: invTotals.total,
      creditedTotal,
      remainingCreditableAmount: remaining,
      items: inv.items.map((it) => ({
        id: it.id,
        item: it.item,
        description: it.description,
        hsnSac: it.hsnSac,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        taxRate: it.taxRate,
        lineTotal: roundCurrency(
          it.quantity * it.unitPrice * (1 - it.discount / 100) * (1 + it.taxRate / 100),
        ),
      })),
    });
  }

  return results;
};
