import { RotateCcw, Search } from "lucide-react";
import type { ChangeEvent } from "react";
import type { CreditNoteFilterOptions } from "../../domain/rules/credit-note-filter";
import type { CreditNoteStatus } from "../../domain/credit-note";
import { Input, Select } from "@/shared/components/form";

const statuses: Array<CreditNoteStatus | "All"> = ["All", "Draft", "Issued", "Cancelled"];

export type CreditNoteFilterBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  status: CreditNoteStatus | "All";
  onStatusChange: (status: CreditNoteStatus | "All") => void;
  customer: string;
  onCustomerChange: (customer: string) => void;
  amountRange: NonNullable<CreditNoteFilterOptions["amountRange"]>;
  onAmountRangeChange: (range: NonNullable<CreditNoteFilterOptions["amountRange"]>) => void;
  sortBy: NonNullable<CreditNoteFilterOptions["sortBy"]>;
  onSortByChange: (sortBy: NonNullable<CreditNoteFilterOptions["sortBy"]>) => void;
  customersList: string[];
  onClear: () => void;
};

export const CreditNoteFilterBar = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
  customer,
  onCustomerChange,
  amountRange,
  onAmountRangeChange,
  sortBy,
  onSortByChange,
  customersList,
  onClear,
}: CreditNoteFilterBarProps) => (
  <div className="rounded-xl border border-border bg-surface-card p-3 sm:p-4 space-y-3 transition-colors">
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
      {/* 1. Search input */}
      <div className="flex-1 min-w-[220px]">
        <label htmlFor="credit-note-search" className="sr-only">
          Search by credit note number, customer, invoice, or reason
        </label>
        <Input
          id="credit-note-search"
          type="text"
          value={query}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)}
          placeholder="Search credit note #, customer, invoice #, reason..."
          startIcon={<Search size={16} />}
          className="h-10 text-sm"
        />
      </div>

      {/* 2. Status filter */}
      <div className="shrink-0 w-full sm:w-36 md:w-40">
        <label htmlFor="credit-note-status-filter" className="sr-only">
          Filter by status
        </label>
        <Select
          id="credit-note-status-filter"
          value={status}
          onChange={(val) => onStatusChange(val as CreditNoteStatus | "All")}
          className="h-10"
        >
          <option value="All">All Statuses</option>
          {statuses.slice(1).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {/* 3. Customer filter */}
      <div className="shrink-0 w-full sm:w-44 md:w-48">
        <label htmlFor="credit-note-customer-filter" className="sr-only">
          Filter by customer
        </label>
        <Select
          id="credit-note-customer-filter"
          value={customer}
          onChange={(val) => onCustomerChange(val)}
          className="h-10"
        >
          <option value="All">All Customers</option>
          {customersList.map((cust) => (
            <option key={cust} value={cust}>
              {cust}
            </option>
          ))}
        </Select>
      </div>

      {/* 4. Amount Range */}
      <div className="shrink-0 w-full sm:w-36 md:w-40">
        <label htmlFor="credit-note-amount-filter" className="sr-only">
          Filter by amount
        </label>
        <Select
          id="credit-note-amount-filter"
          value={amountRange}
          onChange={(val) =>
            onAmountRangeChange(val as NonNullable<CreditNoteFilterOptions["amountRange"]>)
          }
          className="h-10"
        >
          <option value="all">All Amounts</option>
          <option value="under-25k">Under ₹25,000</option>
          <option value="25k-50k">₹25,000 - ₹50,000</option>
          <option value="50k-100k">₹50,000 - ₹1,00,000</option>
          <option value="over-100k">Over ₹1,00,000</option>
        </Select>
      </div>

      {/* 5. Sort By */}
      <div className="shrink-0 w-full sm:w-40 md:w-44">
        <label htmlFor="credit-note-sort-filter" className="sr-only">
          Sort by
        </label>
        <Select
          id="credit-note-sort-filter"
          value={sortBy}
          onChange={(val) =>
            onSortByChange(val as NonNullable<CreditNoteFilterOptions["sortBy"]>)
          }
          className="h-10"
        >
          <option value="issueDate-desc">Date: Newest First</option>
          <option value="issueDate-asc">Date: Oldest First</option>
          <option value="amount-desc">Amount: Highest First</option>
          <option value="amount-asc">Amount: Lowest First</option>
          <option value="number-asc">Number: A to Z</option>
        </Select>
      </div>

      {/* Reset */}
      {(query ||
        status !== "All" ||
        customer !== "All" ||
        amountRange !== "all" ||
        sortBy !== "issueDate-desc") && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear all filters"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-alt px-3 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary shrink-0"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      )}
    </div>
  </div>
);
