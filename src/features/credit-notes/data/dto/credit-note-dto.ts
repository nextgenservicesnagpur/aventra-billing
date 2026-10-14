import type { CreditNoteStatus, TaxMode } from "../../domain/credit-note";

export type CreditNoteActionResult<T = unknown> =
  | {
      success: true;
      data: T;
      error?: never;
      fieldErrors?: never;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
      data?: never;
    };

export type CreditNoteLineItemInputDto = {
  id?: string;
  invoiceItemId?: string;
  productId?: string;
  item: string;
  description?: string;
  hsnSac?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
};

export type CreateCreditNoteInputDto = {
  invoiceId: string;
  creditNoteNumber?: string;
  issueDate: string;
  status?: CreditNoteStatus;
  reason: string;
  notes?: string;
  terms?: string;
  items: CreditNoteLineItemInputDto[];
};

export type UpdateCreditNoteInputDto = {
  id: string;
  creditNoteNumber?: string;
  issueDate: string;
  status?: CreditNoteStatus;
  reason: string;
  notes?: string;
  terms?: string;
  items: CreditNoteLineItemInputDto[];
};

export type EligibleInvoiceSummaryDto = {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerGstin?: string;
  customerPlaceOfSupply?: string;
  issueDate: string;
  dueDate: string;
  status: string;
  taxMode: TaxMode;
  total: number;
  creditedTotal: number;
  remainingCreditableAmount: number;
  items: Array<{
    id: string;
    productId?: string;
    item: string;
    description?: string;
    hsnSac?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    lineTotal: number;
  }>;
};
