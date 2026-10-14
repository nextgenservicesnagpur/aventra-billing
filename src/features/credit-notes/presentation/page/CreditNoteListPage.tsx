"use client";

import Link from "next/link";
import { Plus, RotateCcw, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/form/Button";
import {
  filterCreditNotes,
  summarizeCreditNotes,
  type CreditNoteFilterOptions,
} from "../../domain/rules/credit-note-filter";
import type { CreditNote, CreditNoteStatus } from "../../domain/credit-note";
import { CreditNoteSummaryCards } from "../components/CreditNoteSummaryCards";
import { CreditNoteFilterBar } from "../components/CreditNoteFilterBar";
import { CreditNoteTable } from "../components/CreditNoteTable";
import { CreditNotePagination } from "../components/CreditNotePagination";

const PAGE_SIZE = 8;

export type CreditNoteListPageProps = {
  initialCreditNotes?: CreditNote[];
};

export const CreditNoteListPage = ({
  initialCreditNotes = [],
}: CreditNoteListPageProps) => {
  const creditNotes = initialCreditNotes;
  const searchParams = useSearchParams();

  // Filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CreditNoteStatus | "All">("All");
  const [customer, setCustomer] = useState("All");
  const [amountRange, setAmountRange] = useState<
    NonNullable<CreditNoteFilterOptions["amountRange"]>
  >("all");
  const [sortBy, setSortBy] = useState<
    NonNullable<CreditNoteFilterOptions["sortBy"]>
  >("issueDate-desc");

  // Pagination & selection
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // Derive unique customer list for dropdown
  const customersList = useMemo(() => {
    const set = new Set(creditNotes.map((cn) => cn.customerName));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [creditNotes]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: CreditNoteStatus | "All") => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handleCustomerChange = (val: string) => {
    setCustomer(val);
    setCurrentPage(1);
  };

  const handleAmountRangeChange = (
    val: NonNullable<CreditNoteFilterOptions["amountRange"]>,
  ) => {
    setAmountRange(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (
    val: NonNullable<CreditNoteFilterOptions["sortBy"]>,
  ) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setQuery("");
    setStatus("All");
    setCustomer("All");
    setAmountRange("all");
    setSortBy("issueDate-desc");
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const filtered = useMemo(
    () =>
      filterCreditNotes(creditNotes, {
        query,
        status,
        customer,
        amountRange,
        sortBy,
      }),
    [creditNotes, query, status, customer, amountRange, sortBy],
  );

  const summary = useMemo(
    () => summarizeCreditNotes(creditNotes),
    [creditNotes],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedNotes = useMemo(
    () => filtered.slice(startIndex, startIndex + PAGE_SIZE),
    [filtered, startIndex],
  );

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
    () =>
      paginatedNotes.length > 0 &&
      paginatedNotes.every((note) => selectedIds.has(note.id)),
    [paginatedNotes, selectedIds],
  );

  const handleToggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedNotes.forEach((note) => next.delete(note.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedNotes.forEach((note) => next.add(note.id));
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
            Credit Notes
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage sales returns, invoice corrections, and customer credit adjustments.
          </p>
        </div>
        <Link
          href="/credit-notes/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus shrink-0"
        >
          <Plus size={16} />
          <span>Create Credit Note</span>
        </Link>
      </header>

      {/* Saved notification banner */}
      {searchParams.get("saved") === "1" && (
        <p
          className="rounded-lg border border-success/40 bg-success/15 px-4 py-3 text-sm text-success"
          role="status"
        >
          Credit note saved successfully.
        </p>
      )}

      {/* Summary Cards */}
      <CreditNoteSummaryCards summary={summary} />

      {/* Filter Bar */}
      <CreditNoteFilterBar
        query={query}
        onQueryChange={handleQueryChange}
        status={status}
        onStatusChange={handleStatusChange}
        customer={customer}
        onCustomerChange={handleCustomerChange}
        amountRange={amountRange}
        onAmountRangeChange={handleAmountRangeChange}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        customersList={customersList}
        onClear={handleClear}
      />

      {/* Table & Pagination / Empty State */}
      {creditNotes.length === 0 ? (
        <EmptyState
          title="No credit notes yet"
          text="Issue credit notes against eligible customer invoices for returns or adjustments."
          action="Create Credit Note"
          href="/credit-notes/new"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching credit notes"
          text="Try adjusting your search query, status, or customer filters."
          action="Clear filters"
          onClick={handleClear}
        />
      ) : (
        <div className="space-y-4">
          <CreditNoteTable
            creditNotes={paginatedNotes}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            allOnPageSelected={allOnPageSelected}
          />

          <CreditNotePagination
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
    <Undo2 className="mx-auto text-text-muted" size={28} />
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
