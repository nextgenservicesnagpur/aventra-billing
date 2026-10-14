import { CreditNoteStatus as PrismaCreditNoteStatus } from "@/generated/prisma/enums";
import type {
  CreditNote as PrismaCreditNote,
  CreditNoteItem as PrismaCreditNoteItem,
} from "@/generated/prisma/client";
import type {
  CreditNote,
  CreditNoteLineItem,
  CreditNoteStatus,
  TaxMode,
} from "../../domain/credit-note";

export type PrismaCreditNoteWithRelations = PrismaCreditNote & {
  items: PrismaCreditNoteItem[];
  invoice?: {
    invoiceNumber: string;
  } | null;
};

export const toDomainCreditNoteStatus = (
  status: PrismaCreditNoteStatus,
): CreditNoteStatus => {
  switch (status) {
    case PrismaCreditNoteStatus.DRAFT:
      return "Draft";
    case PrismaCreditNoteStatus.ISSUED:
      return "Issued";
    case PrismaCreditNoteStatus.CANCELLED:
      return "Cancelled";
    default:
      return "Draft";
  }
};

export const toPrismaCreditNoteStatus = (
  status: CreditNoteStatus,
): PrismaCreditNoteStatus => {
  switch (status) {
    case "Draft":
      return PrismaCreditNoteStatus.DRAFT;
    case "Issued":
      return PrismaCreditNoteStatus.ISSUED;
    case "Cancelled":
      return PrismaCreditNoteStatus.CANCELLED;
    default:
      return PrismaCreditNoteStatus.DRAFT;
  }
};

export const toDomainCreditNoteLineItem = (
  item: PrismaCreditNoteItem,
): CreditNoteLineItem => ({
  id: item.id,
  invoiceItemId: item.invoiceItemId ?? undefined,
  productId: item.productId ?? undefined,
  item: item.item,
  description: item.description ?? "",
  hsnSac: item.hsnSac ?? undefined,
  quantity: Number(item.quantity),
  unitPrice: Number(item.unitPrice),
  discount: Number(item.discount),
  taxRate: Number(item.taxRate),
});

export const toDomainCreditNote = (
  record: PrismaCreditNoteWithRelations,
): CreditNote => {
  const issueDateStr = record.issueDate.toISOString().split("T")[0] ?? "";
  const sortedItems = [...record.items].sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: record.id,
    creditNoteNumber: record.creditNoteNumber,
    invoiceId: record.invoiceId,
    invoiceNumber: record.invoice?.invoiceNumber,
    customerId: record.customerId ?? undefined,
    customerName: record.customerName,
    customerEmail: record.customerEmail ?? "",
    customerAddress: record.customerAddress ?? "",
    customerGstin: record.customerGstin ?? "",
    customerPlaceOfSupply: record.customerPlaceOfSupply ?? undefined,
    issueDate: issueDateStr,
    status: toDomainCreditNoteStatus(record.status),
    reason: record.reason,
    taxMode: (record.taxMode === "IGST" ? "IGST" : "CGST_SGST") as TaxMode,
    currency: record.currency,
    subtotal: Number(record.subtotal),
    lineDiscountTotal: Number(record.lineDiscountTotal),
    taxableAmount: Number(record.taxableAmount),
    cgst: Number(record.cgst),
    sgst: Number(record.sgst),
    igst: Number(record.igst),
    totalTax: Number(record.totalTax),
    total: Number(record.total),
    notes: record.notes ?? "",
    terms: record.terms ?? "",
    items: sortedItems.map(toDomainCreditNoteLineItem),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
};
