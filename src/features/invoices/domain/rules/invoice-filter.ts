import { calculateInvoiceTotals, type Invoice, type InvoiceStatus } from "../invoice";

export type InvoiceFilterOptions = {
  query?: string;
  status?: InvoiceStatus | "All";
  dateRange?: string;
  customer?: string;
  amountRange?: "all" | "under-50k" | "50k-100k" | "100k-250k" | "over-250k";
  issueDateFrom?: string;
  issueDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?:
    | "issueDate-desc"
    | "issueDate-asc"
    | "dueDate-asc"
    | "dueDate-desc"
    | "amount-desc"
    | "amount-asc"
    | "number-asc";
};

export const filterInvoices = (
  invoices: Invoice[],
  optionsOrQuery: InvoiceFilterOptions | string = "",
  statusParam?: Invoice["status"] | "All",
  fromParam = "",
  toParam = "",
): Invoice[] => {
  const options: InvoiceFilterOptions =
    typeof optionsOrQuery === "string"
      ? {
          query: optionsOrQuery,
          status: statusParam,
          issueDateFrom: fromParam,
          issueDateTo: toParam,
        }
      : optionsOrQuery;

  const normalized = (options.query ?? "").trim().toLowerCase();
  const targetStatus = options.status ?? "All";
  const targetCustomer =
    options.customer && options.customer !== "All" ? options.customer.toLowerCase() : "";
  const targetAmount = options.amountRange ?? "all";
  const issueFrom = options.issueDateFrom ?? "";
  const issueTo = options.issueDateTo ?? "";
  const dueFrom = options.dueDateFrom ?? "";
  const dueTo = options.dueDateTo ?? "";
  const primaryDateRange = options.dateRange ?? "all";
  const sortBy = options.sortBy ?? "issueDate-desc";

  const filtered = invoices.filter((invoice) => {
    // 1. Text search
    if (normalized) {
      const matchNumber = invoice.number.toLowerCase().includes(normalized);
      const matchCustomer = invoice.customer.toLowerCase().includes(normalized);
      const matchEmail = (invoice.customerEmail ?? "").toLowerCase().includes(normalized);
      if (!matchNumber && !matchCustomer && !matchEmail) return false;
    }

    // 2. Status
    if (targetStatus !== "All" && invoice.status !== targetStatus) {
      return false;
    }

    // 3. Customer
    if (targetCustomer && invoice.customer.toLowerCase() !== targetCustomer) {
      return false;
    }

    // 4. Amount range
    if (targetAmount !== "all") {
      const totals = calculateInvoiceTotals(invoice);
      const total = totals.total;
      if (targetAmount === "under-50k" && total >= 50000) return false;
      if (targetAmount === "50k-100k" && (total < 50000 || total > 100000)) return false;
      if (targetAmount === "100k-250k" && (total < 100000 || total > 250000)) return false;
      if (targetAmount === "over-250k" && total <= 250000) return false;
    }

    // 5. Issue date range
    if (issueFrom && invoice.issueDate < issueFrom) return false;
    if (issueTo && invoice.issueDate > issueTo) return false;

    // 6. Due date range
    if (dueFrom && invoice.dueDate < dueFrom) return false;
    if (dueTo && invoice.dueDate > dueTo) return false;

    // 7. Primary row quick date range
    if (primaryDateRange === "jan-2025") {
      if (invoice.issueDate < "2025-01-01" || invoice.issueDate > "2025-01-31") return false;
    }

    return true;
  });

  // Sort
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "issueDate-asc":
        return a.issueDate.localeCompare(b.issueDate);
      case "dueDate-asc":
        return a.dueDate.localeCompare(b.dueDate);
      case "dueDate-desc":
        return b.dueDate.localeCompare(a.dueDate);
      case "amount-desc": {
        const totalA = calculateInvoiceTotals(a).total;
        const totalB = calculateInvoiceTotals(b).total;
        return totalB - totalA;
      }
      case "amount-asc": {
        const totalA = calculateInvoiceTotals(a).total;
        const totalB = calculateInvoiceTotals(b).total;
        return totalA - totalB;
      }
      case "number-asc":
        return a.number.localeCompare(b.number);
      case "issueDate-desc":
      default:
        return b.issueDate.localeCompare(a.issueDate);
    }
  });
};

export type InvoiceSummary = {
  totalInvoices: number;
  drafts: number;
  outstanding: number;
  outstandingCount: number;
  paid: number;
  paidCount: number;
};

export const summarizeInvoices = (invoices: Invoice[]): InvoiceSummary =>
  invoices.reduce(
    (summary, invoice) => {
      const totals = calculateInvoiceTotals(invoice);
      summary.totalInvoices += 1;
      if (invoice.status === "Draft") {
        summary.drafts += 1;
      } else if (invoice.status === "Paid") {
        summary.paidCount += 1;
      } else {
        summary.outstandingCount += 1;
      }
      summary.outstanding += totals.balance;
      summary.paid += invoice.amountPaid;
      return summary;
    },
    { totalInvoices: 0, drafts: 0, outstanding: 0, outstandingCount: 0, paid: 0, paidCount: 0 },
  );
