export type CreditNoteStatus = "Draft" | "Issued" | "Cancelled";
export type TaxMode = "CGST_SGST" | "IGST";

export const CREDIT_NOTE_REASONS = [
  "Sales return / Defective goods",
  "Billing or pricing correction",
  "Post-sale discount or rebate",
  "Order cancellation",
  "Deficiency in service",
  "Other commercial adjustment",
] as const;

export type CreditNoteReason = (typeof CREDIT_NOTE_REASONS)[number] | string;

export type CreditNoteLineItem = {
  id: string;
  invoiceItemId?: string;
  productId?: string;
  item: string;
  description: string;
  hsnSac?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
};

export type CreditNote = {
  id: string;
  creditNoteNumber: string;
  invoiceId: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerGstin: string;
  customerPlaceOfSupply?: string;
  issueDate: string;
  status: CreditNoteStatus;
  reason: string;
  taxMode: TaxMode;
  currency: string;
  subtotal: number;
  lineDiscountTotal: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  notes: string;
  terms: string;
  items: CreditNoteLineItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreditNoteTotals = {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
};

export const canEditCreditNote = (status: CreditNoteStatus): boolean => status === "Draft";

export const canIssueCreditNote = (status: CreditNoteStatus): boolean => status === "Draft";

export const roundCurrency = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const lineSubtotal = (line: Pick<CreditNoteLineItem, "quantity" | "unitPrice">): number =>
  roundCurrency(line.quantity * line.unitPrice);

export const lineDiscount = (
  line: Pick<CreditNoteLineItem, "quantity" | "unitPrice" | "discount">,
): number => roundCurrency(lineSubtotal(line) * (line.discount / 100));

export const lineTaxable = (
  line: Pick<CreditNoteLineItem, "quantity" | "unitPrice" | "discount">,
): number => roundCurrency(lineSubtotal(line) - lineDiscount(line));

export const lineTax = (
  line: Pick<CreditNoteLineItem, "quantity" | "unitPrice" | "discount" | "taxRate">,
): number => roundCurrency(lineTaxable(line) * (line.taxRate / 100));

export const calculateCreditNoteTotals = ({
  items,
  taxMode = "CGST_SGST",
}: {
  items: CreditNoteLineItem[];
  taxMode?: TaxMode;
}): CreditNoteTotals => {
  const subtotal = roundCurrency(items.reduce((sum, line) => sum + lineSubtotal(line), 0));
  const discount = roundCurrency(items.reduce((sum, line) => sum + lineDiscount(line), 0));
  const taxable = roundCurrency(items.reduce((sum, line) => sum + lineTaxable(line), 0));
  const tax = roundCurrency(items.reduce((sum, line) => sum + lineTax(line), 0));
  const total = roundCurrency(taxable + tax);

  const isIgst = taxMode === "IGST";
  const halfTax = roundCurrency(tax / 2);
  const otherHalf = roundCurrency(tax - halfTax);
  const cgst = isIgst ? 0 : halfTax;
  const sgst = isIgst ? 0 : otherHalf;
  const igst = isIgst ? tax : 0;

  return {
    subtotal,
    discount,
    taxable,
    tax,
    cgst,
    sgst,
    igst,
    total,
  };
};

export const formatCreditNoteCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export const formatCreditNoteDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? "Not supplied"
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
};
