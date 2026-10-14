import type { Invoice, InvoiceStatus } from "../invoice";

export type InvoiceFilterCriteria = {
  query?: string;
  status?: InvoiceStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
};

export type SaveInvoiceDomainInput = {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  customerId?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  customerGstin?: string | null;
  customerPlaceOfSupply?: string | null;
  issueDate: Date;
  dueDate: Date;
  paymentTerms: string;
  status: InvoiceStatus;
  taxMode: string;
  currency?: string;
  subtotal: number;
  lineDiscountTotal: number;
  additionalDiscount: number;
  additionalDiscountType: string;
  additionalDiscountLabel?: string | null;
  additionalCharges: number;
  additionalChargesLabel?: string | null;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  amountPaid: number;
  notes?: string | null;
  terms?: string | null;
  items: {
    id: string;
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
  }[];
};

export interface IInvoiceRepository {
  findById(organizationId: string, id: string): Promise<Invoice | null>;
  findByNumber(organizationId: string, invoiceNumber: string): Promise<Invoice | null>;
  findMany(organizationId: string, criteria?: InvoiceFilterCriteria): Promise<Invoice[]>;
  create(input: SaveInvoiceDomainInput, tx?: unknown): Promise<Invoice>;
  update(organizationId: string, id: string, input: SaveInvoiceDomainInput, tx?: unknown): Promise<Invoice>;
  delete(organizationId: string, id: string): Promise<void>;
}
