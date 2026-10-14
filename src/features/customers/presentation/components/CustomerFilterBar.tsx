"use client";

import { RotateCcw, Search } from "lucide-react";
import { Input, Select } from "@/shared/components/form";
import type { CustomerType, CustomerStatus } from "../../domain/entities/customer";

export type CustomerFilterBarProps = {
  query: string;
  onQueryChange: (val: string) => void;
  customerType: CustomerType | "All";
  onCustomerTypeChange: (val: CustomerType | "All") => void;
  status: CustomerStatus | "All";
  onStatusChange: (val: CustomerStatus | "All") => void;
  onReset: () => void;
};

const customerTypeOptions = [
  { value: "All", label: "All Customer Types" },
  { value: "BUSINESS", label: "Business" },
  { value: "INDIVIDUAL", label: "Individual" },
];

const statusOptions = [
  { value: "All", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const CustomerFilterBar = ({
  query,
  onQueryChange,
  customerType,
  onCustomerTypeChange,
  status,
  onStatusChange,
  onReset,
}: CustomerFilterBarProps) => {
  const hasActiveFilters =
    query.trim().length > 0 || customerType !== "All" || status !== "All";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-card p-3 sm:flex-row sm:items-center">
      {/* Search Input */}
      <div className="min-w-0 flex-1">
        <Input
          id="customer-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search customers by name, email, phone, or GSTIN..."
          startIcon={<Search size={16} />}
          aria-label="Search customers"
          className="h-10 text-sm"
        />
      </div>

      {/* Customer Type Dropdown */}
      <div className="w-full sm:w-48 shrink-0">
        <Select
          id="filter-customer-type"
          value={customerType}
          onChange={(val) => onCustomerTypeChange(val as CustomerType | "All")}
          options={customerTypeOptions}
          aria-label="Filter by customer type"
          className="h-10 text-sm"
        />
      </div>

      {/* Status Dropdown */}
      <div className="w-full sm:w-40 shrink-0">
        <Select
          id="filter-customer-status"
          value={status}
          onChange={(val) => onStatusChange(val as CustomerStatus | "All")}
          options={statusOptions}
          aria-label="Filter by status"
          className="h-10 text-sm"
        />
      </div>

      {/* Reset Action */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-alt px-3 text-xs font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus cursor-pointer shrink-0"
          aria-label="Reset filters"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
