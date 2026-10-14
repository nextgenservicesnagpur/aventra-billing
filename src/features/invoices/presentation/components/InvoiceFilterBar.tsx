import { Calendar, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { ChangeEvent } from "react";
import type { InvoiceFilterOptions } from "../../domain/rules/invoice-filter";
import type { InvoiceStatus } from "../../domain/invoice";
import { cn } from "@/shared/utils/cn";
import { DatePicker, Input, Label, Select } from "@/shared/components/form";

const statuses: Array<InvoiceStatus | "All"> = [
  "All",
  "Draft",
  "Issued",
  "Partially Paid",
  "Paid",
  "Overdue",
  "Cancelled",
];

type InvoiceFilterBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  status: InvoiceStatus | "All";
  onStatusChange: (status: InvoiceStatus | "All") => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  customer: string;
  onCustomerChange: (customer: string) => void;
  amountRange: NonNullable<InvoiceFilterOptions["amountRange"]>;
  onAmountRangeChange: (range: NonNullable<InvoiceFilterOptions["amountRange"]>) => void;
  issueDateRange: string;
  onIssueDateRangeChange: (range: string) => void;
  customIssueFrom: string;
  onCustomIssueFromChange: (val: string) => void;
  customIssueTo: string;
  onCustomIssueToChange: (val: string) => void;
  dueDateRange: string;
  onDueDateRangeChange: (range: string) => void;
  customDueFrom: string;
  onCustomDueFromChange: (val: string) => void;
  customDueTo: string;
  onCustomDueToChange: (val: string) => void;
  sortBy: NonNullable<InvoiceFilterOptions["sortBy"]>;
  onSortByChange: (sortBy: NonNullable<InvoiceFilterOptions["sortBy"]>) => void;
  customersList: string[];
  isAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
  onClear: () => void;
};

export const InvoiceFilterBar = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  customer,
  onCustomerChange,
  amountRange,
  onAmountRangeChange,
  issueDateRange,
  onIssueDateRangeChange,
  customIssueFrom,
  onCustomIssueFromChange,
  customIssueTo,
  onCustomIssueToChange,
  dueDateRange,
  onDueDateRangeChange,
  customDueFrom,
  onCustomDueFromChange,
  customDueTo,
  onCustomDueToChange,
  sortBy,
  onSortByChange,
  customersList,
  isAdvancedOpen,
  onToggleAdvanced,
  onClear,
}: InvoiceFilterBarProps) => (
  <div className="rounded-xl border border-border bg-surface-card p-3 sm:p-4 space-y-3 transition-colors">
    {/* Primary filter row */}
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
      {/* 1. Search input */}
      <div className="flex-1 min-w-[220px]">
        <label htmlFor="invoice-search" className="sr-only">
          Search by invoice number, customer, or email
        </label>
        <Input
          id="invoice-search"
          type="text"
          value={query}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)}
          placeholder="Search by invoice number, customer, or email..."
          startIcon={<Search size={16} />}
          className="h-10 text-sm"
        />
      </div>

      {/* 2. Status filter */}
      <div className="shrink-0 w-full sm:w-36 md:w-40">
        <label htmlFor="invoice-status-filter" className="sr-only">
          Filter by status
        </label>
        <Select
          id="invoice-status-filter"
          value={status}
          onChange={(val) => onStatusChange(val as InvoiceStatus | "All")}
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

      {/* 3. Primary date range filter */}
      <div className="shrink-0 w-full sm:w-52 md:w-60">
        <label htmlFor="invoice-date-range" className="sr-only">
          Filter by date range
        </label>
        <Select
          id="invoice-date-range"
          value={dateRange}
          onChange={onDateRangeChange}
          startIcon={<Calendar size={15} />}
          className="h-10"
        >
          <option value="all">All dates</option>
          <option value="jan-2025">01 Jan 2025 - 31 Jan 2025</option>
          <option value="last-30">Last 30 days</option>
          <option value="last-90">Last 90 days</option>
        </Select>
      </div>

      {/* Actions: More filters + Clear */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleAdvanced}
          aria-expanded={isAdvancedOpen}
          aria-controls="advanced-filter-section"
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium transition-colors",
            isAdvancedOpen
              ? "bg-surface-elevated text-text-primary border-primary/40"
              : "bg-surface-alt text-text-secondary hover:bg-surface hover:text-text-primary",
          )}
        >
          <SlidersHorizontal size={14} />
          <span>{isAdvancedOpen ? "Fewer filters" : "More filters"}</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-transparent px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
        >
          <RotateCcw size={14} />
          <span>Clear</span>
        </button>
      </div>
    </div>

    {/* Advanced filter section */}
    {isAdvancedOpen && (
      <div
        id="advanced-filter-section"
        className="pt-3 border-t border-border space-y-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* 1. Customer */}
          <div>
            <Label htmlFor="adv-customer" className="mb-1.5 block text-xs font-medium text-text-muted">
              Customer
            </Label>
            <Select
              id="adv-customer"
              value={customer}
              onChange={onCustomerChange}
              className="h-10"
            >
              <option value="All">All customers</option>
              {customersList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          {/* 2. Amount range */}
          <div>
            <Label htmlFor="adv-amount" className="mb-1.5 block text-xs font-medium text-text-muted">
              Amount range
            </Label>
            <Select
              id="adv-amount"
              value={amountRange}
              onChange={(val) =>
                onAmountRangeChange(val as NonNullable<InvoiceFilterOptions["amountRange"]>)
              }
              className="h-10"
            >
              <option value="all">Any amount</option>
              <option value="under-50k">Under ₹50,000</option>
              <option value="50k-100k">₹50,000 - ₹1,00,000</option>
              <option value="100k-250k">₹1,00,000 - ₹2,50,000</option>
              <option value="over-250k">Over ₹2,50,000</option>
            </Select>
          </div>

          {/* 3. Issue date */}
          <div>
            <Label htmlFor="adv-issue-date" className="mb-1.5 block text-xs font-medium text-text-muted">
              Issue date
            </Label>
            <Select
              id="adv-issue-date"
              value={issueDateRange}
              onChange={onIssueDateRangeChange}
              startIcon={<Calendar size={14} />}
              className="h-10"
            >
              <option value="all">Select date range</option>
              <option value="jan-2025">Jan 2025</option>
              <option value="dec-2024">Dec 2024</option>
              <option value="last-30">Last 30 days</option>
              <option value="last-90">Last 90 days</option>
              <option value="custom">Custom range...</option>
            </Select>
          </div>

          {/* 4. Due date */}
          <div>
            <Label htmlFor="adv-due-date" className="mb-1.5 block text-xs font-medium text-text-muted">
              Due date
            </Label>
            <Select
              id="adv-due-date"
              value={dueDateRange}
              onChange={onDueDateRangeChange}
              startIcon={<Calendar size={14} />}
              className="h-10"
            >
              <option value="all">Select date range</option>
              <option value="jan-2025">Jan 2025</option>
              <option value="feb-2025">Feb 2025</option>
              <option value="next-30">Next 30 days</option>
              <option value="next-60">Next 60 days</option>
              <option value="custom">Custom range...</option>
            </Select>
          </div>

          {/* 5. Sort by */}
          <div>
            <Label htmlFor="adv-sort-by" className="mb-1.5 block text-xs font-medium text-text-muted">
              Sort by
            </Label>
            <Select
              id="adv-sort-by"
              value={sortBy}
              onChange={(val) =>
                onSortByChange(val as NonNullable<InvoiceFilterOptions["sortBy"]>)
              }
              className="h-10"
            >
              <option value="issueDate-desc">Issue date (newest)</option>
              <option value="issueDate-asc">Issue date (oldest)</option>
              <option value="dueDate-asc">Due date (earliest)</option>
              <option value="dueDate-desc">Due date (latest)</option>
              <option value="amount-desc">Amount (high to low)</option>
              <option value="amount-asc">Amount (low to high)</option>
              <option value="number-asc">Invoice number (A-Z)</option>
            </Select>
          </div>
        </div>

        {/* Custom date range pickers if selected */}
        {(issueDateRange === "custom" || dueDateRange === "custom") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {issueDateRange === "custom" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border bg-surface-alt/50 p-2.5">
                <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Issue:</span>
                <DatePicker
                  placeholder="Start date"
                  aria-label="Issue date start"
                  value={customIssueFrom}
                  onChange={onCustomIssueFromChange}
                  className="h-8 text-xs"
                />
                <span className="text-xs text-text-muted">to</span>
                <DatePicker
                  placeholder="End date"
                  aria-label="Issue date end"
                  value={customIssueTo}
                  minDate={customIssueFrom}
                  onChange={onCustomIssueToChange}
                  className="h-8 text-xs"
                />
              </div>
            )}
            {dueDateRange === "custom" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border bg-surface-alt/50 p-2.5">
                <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Due:</span>
                <DatePicker
                  placeholder="Start date"
                  aria-label="Due date start"
                  value={customDueFrom}
                  onChange={onCustomDueFromChange}
                  className="h-8 text-xs"
                />
                <span className="text-xs text-text-muted">to</span>
                <DatePicker
                  placeholder="End date"
                  aria-label="Due date end"
                  value={customDueTo}
                  minDate={customDueFrom}
                  onChange={onCustomDueToChange}
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);
