"use client";

import Link from "next/link";
import { FileText, Plus, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/form/Button";
import { filterInvoices, summarizeInvoices, type InvoiceFilterOptions } from "../../domain/rules/invoice-filter";
import type { Invoice, InvoiceStatus } from "../../domain/invoice";
import { InvoiceSummaryCards } from "../components/InvoiceSummaryCards";
import { InvoiceFilterBar } from "../components/InvoiceFilterBar";
import { InvoiceTable } from "../components/InvoiceTable";
import { InvoicePagination } from "../components/InvoicePagination";

const PAGE_SIZE = 8;

export type InvoiceListPageProps = {
  initialInvoices?: Invoice[];
};

export const InvoiceListPage = ({ initialInvoices = [] }: InvoiceListPageProps) => {
  const invoices = initialInvoices;
  const searchParams = useSearchParams();

  // Primary filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "All">("All");
  const [dateRange, setDateRange] = useState("all");

  // Advanced filters
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [customer, setCustomer] = useState("All");
  const [amountRange, setAmountRange] = useState<NonNullable<InvoiceFilterOptions["amountRange"]>>("all");
  const [issueDateRange, setIssueDateRange] = useState("all");
  const [customIssueFrom, setCustomIssueFrom] = useState("");
  const [customIssueTo, setCustomIssueTo] = useState("");
  const [dueDateRange, setDueDateRange] = useState("all");
  const [customDueFrom, setCustomDueFrom] = useState("");
  const [customDueTo, setCustomDueTo] = useState("");
  const [sortBy, setSortBy] = useState<NonNullable<InvoiceFilterOptions["sortBy"]>>("issueDate-desc");

  // Pagination & selection
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // Derive unique customer list for dropdown
  const customersList = useMemo(() => {
    const set = new Set(invoices.map((inv) => inv.customer));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [invoices]);

  // Reset pagination when any filter changes
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: InvoiceStatus | "All") => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (val: string) => {
    setDateRange(val);
    setCurrentPage(1);
  };

  const handleCustomerChange = (val: string) => {
    setCustomer(val);
    setCurrentPage(1);
  };

  const handleAmountRangeChange = (val: NonNullable<InvoiceFilterOptions["amountRange"]>) => {
    setAmountRange(val);
    setCurrentPage(1);
  };

  const handleIssueDateRangeChange = (val: string) => {
    setIssueDateRange(val);
    setCurrentPage(1);
  };

  const handleDueDateRangeChange = (val: string) => {
    setDueDateRange(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (val: NonNullable<InvoiceFilterOptions["sortBy"]>) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  // Reset all filters
  const handleClear = () => {
    setQuery("");
    setStatus("All");
    setDateRange("all");
    setCustomer("All");
    setAmountRange("all");
    setIssueDateRange("all");
    setCustomIssueFrom("");
    setCustomIssueTo("");
    setDueDateRange("all");
    setCustomDueFrom("");
    setCustomDueTo("");
    setSortBy("issueDate-desc");
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // Map issue date presets to actual dates
  const resolvedIssueFrom = useMemo(() => {
    if (issueDateRange === "jan-2025") return "2025-01-01";
    if (issueDateRange === "dec-2024") return "2024-12-01";
    if (issueDateRange === "custom") return customIssueFrom;
    return "";
  }, [issueDateRange, customIssueFrom]);

  const resolvedIssueTo = useMemo(() => {
    if (issueDateRange === "jan-2025") return "2025-01-31";
    if (issueDateRange === "dec-2024") return "2024-12-31";
    if (issueDateRange === "custom") return customIssueTo;
    return "";
  }, [issueDateRange, customIssueTo]);

  // Map due date presets to actual dates
  const resolvedDueFrom = useMemo(() => {
    if (dueDateRange === "jan-2025") return "2025-01-01";
    if (dueDateRange === "feb-2025") return "2025-02-01";
    if (dueDateRange === "custom") return customDueFrom;
    return "";
  }, [dueDateRange, customDueFrom]);

  const resolvedDueTo = useMemo(() => {
    if (dueDateRange === "jan-2025") return "2025-01-31";
    if (dueDateRange === "feb-2025") return "2025-02-28";
    if (dueDateRange === "custom") return customDueTo;
    return "";
  }, [dueDateRange, customDueTo]);

  // Filtered and sorted dataset
  const filtered = useMemo(
    () =>
      filterInvoices(invoices, {
        query,
        status,
        dateRange,
        customer,
        amountRange,
        issueDateFrom: resolvedIssueFrom,
        issueDateTo: resolvedIssueTo,
        dueDateFrom: resolvedDueFrom,
        dueDateTo: resolvedDueTo,
        sortBy,
      }),
    [
      invoices,
      query,
      status,
      dateRange,
      customer,
      amountRange,
      resolvedIssueFrom,
      resolvedIssueTo,
      resolvedDueFrom,
      resolvedDueTo,
      sortBy,
    ],
  );

  // Summary counts derived dynamically from in-memory workspace
  const summary = useMemo(() => summarizeInvoices(invoices), [invoices]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedInvoices = useMemo(
    () => filtered.slice(startIndex, startIndex + PAGE_SIZE),
    [filtered, startIndex],
  );

  // Row selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allOnPageSelected = useMemo(
    () => paginatedInvoices.length > 0 && paginatedInvoices.every((inv) => selectedIds.has(inv.id)),
    [paginatedInvoices, selectedIds],
  );

  const handleToggleSelectAll = () => {
    if (allOnPageSelected) {
      // Unselect all on current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedInvoices.forEach((inv) => next.delete(inv.id));
        return next;
      });
    } else {
      // Select all on current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedInvoices.forEach((inv) => next.add(inv.id));
        return next;
      });
    }
  };

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Create, manage, and track customer invoices.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus shrink-0"
        >
          <Plus size={16} />
          <span>Create Invoice</span>
        </Link>
      </header>

      {/* Saved notification */}
      {searchParams.get("saved") === "1" && (
        <p
          className="rounded-lg border border-success/40 bg-success/15 px-4 py-3 text-sm text-success"
          role="status"
        >
          Invoice saved successfully.
        </p>
      )}

      {/* 4 Summary Cards */}
      <InvoiceSummaryCards summary={summary} />

      {/* Filter Bar with Collapsible Advanced Filter Section */}
      <InvoiceFilterBar
        query={query}
        onQueryChange={handleQueryChange}
        status={status}
        onStatusChange={handleStatusChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        customer={customer}
        onCustomerChange={handleCustomerChange}
        amountRange={amountRange}
        onAmountRangeChange={handleAmountRangeChange}
        issueDateRange={issueDateRange}
        onIssueDateRangeChange={handleIssueDateRangeChange}
        customIssueFrom={customIssueFrom}
        onCustomIssueFromChange={setCustomIssueFrom}
        customIssueTo={customIssueTo}
        onCustomIssueToChange={setCustomIssueTo}
        dueDateRange={dueDateRange}
        onDueDateRangeChange={handleDueDateRangeChange}
        customDueFrom={customDueFrom}
        onCustomDueFromChange={setCustomDueFrom}
        customDueTo={customDueTo}
        onCustomDueToChange={setCustomDueTo}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        customersList={customersList}
        isAdvancedOpen={isAdvancedOpen}
        onToggleAdvanced={() => setIsAdvancedOpen((prev) => !prev)}
        onClear={handleClear}
      />

      {/* Invoices Table & Pagination or Empty State */}
      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          text="Create your first invoice draft to start managing customer billing."
          action="Create Invoice"
          href="/invoices/new"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching invoices"
          text="Try adjusting your search query, status, or date range filters."
          action="Clear filters"
          onClick={handleClear}
        />
      ) : (
        <div className="space-y-4">
          <InvoiceTable
            invoices={paginatedInvoices}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            allOnPageSelected={allOnPageSelected}
          />

          <InvoicePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </section>
  );
};

const EmptyState = ({
  title,
  text,
  action,
  href,
  onClick,
}: {
  title: string;
  text: string;
  action: string;
  href?: string;
  onClick?: () => void;
}) => (
  <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center">
    <FileText className="mx-auto text-text-muted" size={28} />
    <h2 className="mt-4 font-heading text-xl font-semibold text-text-primary">{title}</h2>
    <p className="mx-auto mt-2 max-w-sm text-text-secondary">{text}</p>
    {href ? (
      <Link
        href={href}
        className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary-light active:bg-primary-dark"
      >
        <Plus size={17} />
        {action}
      </Link>
    ) : (
      <Button variant="secondary" onClick={onClick} className="mt-6 px-4">
        <RotateCcw size={16} />
        {action}
      </Button>
    )}
  </div>
);
