export type InvoiceStatus = "Draft" | "Issued" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";
export type TaxMode = "CGST_SGST" | "IGST";

export type InvoiceLineItem = {
  id: string;
  item: string;
  description: string;
  hsnSac?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
};

export type Invoice = {
  id: string;
  number: string;
  customer: string;
  customerEmail: string;
  customerAddress: string;
  customerGstin: string;
  customerPlaceOfSupply?: string;
  customerId?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  taxMode: TaxMode;
  notes: string;
  paymentTerms: string;
  terms: string;
  items: InvoiceLineItem[];
  amountPaid: number;
  creditedAmount?: number;
  additionalCharges?: number;
  additionalChargesLabel?: string;
  additionalDiscount?: number;
  additionalDiscountType?: "percentage" | "fixed";
  additionalDiscountLabel?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  balance: number;
  creditedAmount?: number;
  additionalCharges?: number;
  additionalDiscount?: number;
};

export const canEditInvoice = (invoice: Pick<Invoice, "status">) => invoice.status === "Draft";

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const lineSubtotal = (line: InvoiceLineItem) => roundCurrency(line.quantity * line.unitPrice);
export const lineDiscount = (line: InvoiceLineItem) => roundCurrency(lineSubtotal(line) * (line.discount / 100));
export const lineTaxable = (line: InvoiceLineItem) => roundCurrency(lineSubtotal(line) - lineDiscount(line));
export const lineTax = (line: InvoiceLineItem) => roundCurrency(lineTaxable(line) * (line.taxRate / 100));

export const calculateInvoiceTotals = (
  invoice: Pick<Invoice, "items" | "amountPaid"> & {
    creditedAmount?: number;
    taxMode?: TaxMode;
    additionalCharges?: number;
    additionalDiscount?: number;
    additionalDiscountType?: "percentage" | "fixed";
  },
): InvoiceTotals => {
  const subtotal = roundCurrency(invoice.items.reduce((sum, line) => sum + lineSubtotal(line), 0));
  const lineDiscountSum = roundCurrency(invoice.items.reduce((sum, line) => sum + lineDiscount(line), 0));
  const baseTaxable = roundCurrency(invoice.items.reduce((sum, line) => sum + lineTaxable(line), 0));

  let extraDiscount = 0;
  if (invoice.additionalDiscount && invoice.additionalDiscount > 0) {
    if (invoice.additionalDiscountType === "percentage") {
      extraDiscount = roundCurrency(baseTaxable * (invoice.additionalDiscount / 100));
    } else {
      extraDiscount = roundCurrency(invoice.additionalDiscount);
    }
  }

  const discount = roundCurrency(lineDiscountSum + extraDiscount);
  const taxable = roundCurrency(Math.max(0, baseTaxable - extraDiscount));
  const tax = roundCurrency(invoice.items.reduce((sum, line) => sum + lineTax(line), 0));
  const extraCharges = roundCurrency(Math.max(0, invoice.additionalCharges ?? 0));
  const total = roundCurrency(Math.max(0, taxable + tax + extraCharges));

  const isIgst = invoice.taxMode === "IGST";
  const halfTax = roundCurrency(tax / 2);
  const otherHalf = roundCurrency(tax - halfTax);
  const cgst = isIgst ? 0 : halfTax;
  const sgst = isIgst ? 0 : otherHalf;
  const igst = isIgst ? tax : 0;

  const credited = roundCurrency(invoice.creditedAmount ?? 0);
  const result: InvoiceTotals = {
    subtotal,
    discount,
    taxable,
    tax,
    cgst,
    sgst,
    igst,
    total,
    balance: roundCurrency(Math.max(0, total - invoice.amountPaid - credited)),
  };
  if (invoice.creditedAmount !== undefined && invoice.creditedAmount > 0) {
    result.creditedAmount = credited;
  }
  if (invoice.additionalCharges !== undefined && invoice.additionalCharges > 0) {
    result.additionalCharges = extraCharges;
  }
  if (extraDiscount > 0) {
    result.additionalDiscount = extraDiscount;
  }
  return result;
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export const formatInvoiceDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "Not supplied" : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
};

export const validateInvoice = (invoice: Pick<Invoice, "customer" | "issueDate" | "dueDate" | "items">) => {
  const errors: Record<string, string> = {};
  if (!invoice.customer.trim()) errors.customer = "Select a customer before saving.";
  if (!invoice.issueDate) errors.issueDate = "Issue date is required.";
  if (!invoice.dueDate) errors.dueDate = "Due date is required.";
  if (invoice.issueDate && invoice.dueDate && invoice.dueDate < invoice.issueDate) errors.dueDate = "Due date must be on or after issue date.";
  if (invoice.items.length === 0) errors.items = "Add at least one line item.";
  invoice.items.forEach((line, index) => {
    if (!line.item.trim()) errors[`item-${index}`] = "Item or service is required.";
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) errors[`quantity-${index}`] = "Quantity must be greater than zero.";
    if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) errors[`price-${index}`] = "Enter a valid price.";
    if (!Number.isFinite(line.discount) || line.discount < 0 || line.discount > 100) errors[`discount-${index}`] = "Discount must be 0–100%.";
    if (!Number.isFinite(line.taxRate) || line.taxRate < 0 || line.taxRate > 100) errors[`tax-${index}`] = "Tax rate must be 0–100%.";
  });
  return errors;
};

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parsePaymentTermsDays = (paymentTerms?: string | null): number => {
  if (!paymentTerms) return 15;
  const normalized = paymentTerms.trim().toLowerCase();
  if (normalized.includes("receipt")) {
    return 0;
  }
  const match = normalized.match(/\b(\d+)\b/);
  if (match && match[1]) {
    const days = parseInt(match[1], 10);
    return Number.isFinite(days) ? days : 15;
  }
  return 15;
};

export const calculateDueDate = (
  issueDate: string,
  paymentTerms?: string | null,
): string => {
  if (!issueDate) return "";
  const days = parsePaymentTermsDays(paymentTerms);
  const parts = issueDate.split("-");
  if (parts.length !== 3) return issueDate;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return issueDate;
  }

  const date = new Date(year, month, day);
  date.setDate(date.getDate() + days);

  const resYear = date.getFullYear();
  const resMonth = String(date.getMonth() + 1).padStart(2, "0");
  const resDay = String(date.getDate()).padStart(2, "0");
  return `${resYear}-${resMonth}-${resDay}`;
};
