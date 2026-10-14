import { roundCurrency, type CreditNoteLineItem } from "../credit-note";

export const ELIGIBLE_INVOICE_STATUSES = [
  "Issued",
  "Partially Paid",
  "Paid",
  "Overdue",
  "ISSUED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
] as const;

export const isInvoiceEligibleForCredit = (status: string): boolean => {
  const normalized = status.trim();
  return ELIGIBLE_INVOICE_STATUSES.some(
    (s) => s.toLowerCase() === normalized.toLowerCase(),
  );
};

export type CreditAvailabilityResult = {
  isAllowed: boolean;
  invoiceTotal: number;
  previouslyCreditedTotal: number;
  remainingAvailableCredit: number;
  newCreditTotal: number;
  error?: string;
};

export const calculateCreditAvailability = ({
  invoiceTotal,
  previouslyCreditedTotal,
  newCreditTotal,
}: {
  invoiceTotal: number;
  previouslyCreditedTotal: number;
  newCreditTotal: number;
}): CreditAvailabilityResult => {
  const roundedInvoiceTotal = roundCurrency(invoiceTotal);
  const roundedPreviousCredit = roundCurrency(previouslyCreditedTotal);
  const remainingAvailable = roundCurrency(
    Math.max(0, roundedInvoiceTotal - roundedPreviousCredit),
  );
  const roundedNewCredit = roundCurrency(newCreditTotal);

  if (roundedNewCredit <= 0) {
    return {
      isAllowed: false,
      invoiceTotal: roundedInvoiceTotal,
      previouslyCreditedTotal: roundedPreviousCredit,
      remainingAvailableCredit: remainingAvailable,
      newCreditTotal: roundedNewCredit,
      error: "Credit note total must be greater than zero.",
    };
  }

  // Use EPSILON / 1-cent tolerance to avoid float boundary precision false positives
  const exceeds = roundedNewCredit > remainingAvailable + 0.001;

  if (exceeds) {
    return {
      isAllowed: false,
      invoiceTotal: roundedInvoiceTotal,
      previouslyCreditedTotal: roundedPreviousCredit,
      remainingAvailableCredit: remainingAvailable,
      newCreditTotal: roundedNewCredit,
      error: `Credit note amount (₹${roundedNewCredit.toFixed(2)}) exceeds remaining available invoice credit (₹${remainingAvailable.toFixed(2)}).`,
    };
  }

  return {
    isAllowed: true,
    invoiceTotal: roundedInvoiceTotal,
    previouslyCreditedTotal: roundedPreviousCredit,
    remainingAvailableCredit: remainingAvailable,
    newCreditTotal: roundedNewCredit,
  };
};

export const validateCreditNoteLineItems = (
  items: readonly CreditNoteLineItem[],
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!items || items.length === 0) {
    errors.items = "Add at least one line item to credit.";
    return errors;
  }

  items.forEach((line, index) => {
    if (!line.item.trim()) {
      errors[`item-${index}`] = "Item or description is required.";
    }
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
      errors[`quantity-${index}`] = "Quantity must be greater than zero.";
    }
    if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) {
      errors[`price-${index}`] = "Enter a valid unit price.";
    }
    if (!Number.isFinite(line.discount) || line.discount < 0 || line.discount > 100) {
      errors[`discount-${index}`] = "Discount must be between 0% and 100%.";
    }
    if (!Number.isFinite(line.taxRate) || line.taxRate < 0 || line.taxRate > 100) {
      errors[`tax-${index}`] = "Tax rate must be between 0% and 100%.";
    }
  });

  return errors;
};
