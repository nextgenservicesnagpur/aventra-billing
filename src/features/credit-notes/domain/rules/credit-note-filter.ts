import {
  calculateCreditNoteTotals,
  type CreditNote,
  type CreditNoteStatus,
} from "../credit-note";

export type CreditNoteFilterOptions = {
  query?: string;
  status?: CreditNoteStatus | "All";
  customer?: string;
  amountRange?: "all" | "under-25k" | "25k-50k" | "50k-100k" | "over-100k";
  issueDateFrom?: string;
  issueDateTo?: string;
  sortBy?:
    | "issueDate-desc"
    | "issueDate-asc"
    | "amount-desc"
    | "amount-asc"
    | "number-asc";
};

export const filterCreditNotes = (
  creditNotes: CreditNote[],
  options: CreditNoteFilterOptions = {},
): CreditNote[] => {
  const normalized = (options.query ?? "").trim().toLowerCase();
  const targetStatus = options.status ?? "All";
  const targetCustomer =
    options.customer && options.customer !== "All"
      ? options.customer.toLowerCase()
      : "";
  const targetAmount = options.amountRange ?? "all";
  const issueFrom = options.issueDateFrom ?? "";
  const issueTo = options.issueDateTo ?? "";
  const sortBy = options.sortBy ?? "issueDate-desc";

  const filtered = creditNotes.filter((note) => {
    // 1. Text search
    if (normalized) {
      const matchNumber = note.creditNoteNumber.toLowerCase().includes(normalized);
      const matchCustomer = note.customerName.toLowerCase().includes(normalized);
      const matchEmail = (note.customerEmail ?? "").toLowerCase().includes(normalized);
      const matchInvoice = (note.invoiceNumber ?? "").toLowerCase().includes(normalized);
      const matchReason = (note.reason ?? "").toLowerCase().includes(normalized);
      if (!matchNumber && !matchCustomer && !matchEmail && !matchInvoice && !matchReason) {
        return false;
      }
    }

    // 2. Status
    if (targetStatus !== "All" && note.status !== targetStatus) {
      return false;
    }

    // 3. Customer
    if (targetCustomer && note.customerName.toLowerCase() !== targetCustomer) {
      return false;
    }

    // 4. Amount range
    if (targetAmount !== "all") {
      const total = note.total || calculateCreditNoteTotals(note).total;
      if (targetAmount === "under-25k" && total >= 25000) return false;
      if (targetAmount === "25k-50k" && (total < 25000 || total > 50000)) return false;
      if (targetAmount === "50k-100k" && (total < 50000 || total > 100000)) return false;
      if (targetAmount === "over-100k" && total <= 100000) return false;
    }

    // 5. Date range
    if (issueFrom && note.issueDate < issueFrom) return false;
    if (issueTo && note.issueDate > issueTo) return false;

    return true;
  });

  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "issueDate-asc":
        return a.issueDate.localeCompare(b.issueDate);
      case "amount-desc":
        return b.total - a.total;
      case "amount-asc":
        return a.total - b.total;
      case "number-asc":
        return a.creditNoteNumber.localeCompare(b.creditNoteNumber);
      case "issueDate-desc":
      default:
        return b.issueDate.localeCompare(a.issueDate);
    }
  });
};

export type CreditNoteSummary = {
  totalCreditNotes: number;
  totalCreditedAmount: number;
  issuedCount: number;
  issuedAmount: number;
  draftCount: number;
  draftAmount: number;
  cancelledCount: number;
};

export const summarizeCreditNotes = (
  creditNotes: readonly CreditNote[],
): CreditNoteSummary =>
  creditNotes.reduce<CreditNoteSummary>(
    (summary, note) => {
      summary.totalCreditNotes += 1;
      if (note.status === "Issued") {
        summary.issuedCount += 1;
        summary.issuedAmount += note.total;
        summary.totalCreditedAmount += note.total;
      } else if (note.status === "Draft") {
        summary.draftCount += 1;
        summary.draftAmount += note.total;
      } else if (note.status === "Cancelled") {
        summary.cancelledCount += 1;
      }
      return summary;
    },
    {
      totalCreditNotes: 0,
      totalCreditedAmount: 0,
      issuedCount: 0,
      issuedAmount: 0,
      draftCount: 0,
      draftAmount: 0,
      cancelledCount: 0,
    },
  );
