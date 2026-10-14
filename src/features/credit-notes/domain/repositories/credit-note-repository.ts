import type { CreditNote, CreditNoteStatus, TaxMode } from "../credit-note";

export type CreditNoteFilterCriteria = {
  query?: string;
  status?: CreditNoteStatus;
  customerId?: string;
  invoiceId?: string;
  startDate?: string;
  endDate?: string;
};

export type SaveCreditNoteLineItemInput = {
  id: string;
  invoiceItemId?: string | null;
  productId?: string | null;
  item: string;
  description?: string | null;
  hsnSac?: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  lineTotal: number;
  sortOrder: number;
};

export type SaveCreditNoteDomainInput = {
  id: string;
  organizationId: string;
  creditNoteNumber: string;
  invoiceId: string;
  customerId?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  customerGstin?: string | null;
  customerPlaceOfSupply?: string | null;
  issueDate: Date;
  status: CreditNoteStatus;
  reason: string;
  taxMode: TaxMode;
  currency?: string;
  subtotal: number;
  lineDiscountTotal: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  notes?: string | null;
  terms?: string | null;
  items: SaveCreditNoteLineItemInput[];
};

export type ICreditNoteRepository = {
  findById(organizationId: string, id: string): Promise<CreditNote | null>;
  findByNumber(organizationId: string, creditNoteNumber: string): Promise<CreditNote | null>;
  findMany(organizationId: string, criteria?: CreditNoteFilterCriteria): Promise<CreditNote[]>;
  findByInvoiceId(organizationId: string, invoiceId: string): Promise<CreditNote[]>;
  getIssuedTotalForInvoice(
    organizationId: string,
    invoiceId: string,
    excludeCreditNoteId?: string,
    txClient?: unknown,
  ): Promise<number>;
  create(input: SaveCreditNoteDomainInput, txClient?: unknown): Promise<CreditNote>;
  update(
    organizationId: string,
    id: string,
    input: SaveCreditNoteDomainInput,
    txClient?: unknown,
  ): Promise<CreditNote>;
  delete(organizationId: string, id: string): Promise<void>;
};
