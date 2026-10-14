import type { Invoice, InvoiceStatus, TaxMode } from "../../domain/invoice";

export type InvoiceLineItemDto = {
  id?: string;
  productId?: string;
  item: string;
  description?: string;
  hsnSac?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
};

export type CreateInvoiceInputDto = {
  invoiceNumber?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerGstin?: string;
  customerPlaceOfSupply?: string;
  issueDate: string;
  dueDate: string;
  paymentTerms?: string;
  status: InvoiceStatus;
  taxMode?: TaxMode;
  notes?: string;
  terms?: string;
  items: InvoiceLineItemDto[];
  amountPaid?: number;
  additionalCharges?: number;
  additionalChargesLabel?: string;
  additionalDiscount?: number;
  additionalDiscountType?: "percentage" | "fixed";
  additionalDiscountLabel?: string;
};

export type UpdateInvoiceInputDto = Partial<CreateInvoiceInputDto> & {
  id: string;
};

export type InvoiceActionResult<T = Invoice> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type InvoiceListFilterDto = {
  query?: string;
  status?: InvoiceStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
};
