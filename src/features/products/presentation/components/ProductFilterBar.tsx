"use client";

import { RotateCcw, Search } from "lucide-react";
import { Input, Select } from "@/shared/components/form";
import type { ProductType, ProductStatus } from "../../domain/entities/product";
import { STANDARD_CATEGORIES } from "../../domain/rules/product-rules";

export type ProductFilterBarProps = {
  query: string;
  onQueryChange: (val: string) => void;
  type?: ProductType | "ALL";
  onTypeChange?: (val: ProductType | "ALL") => void;
  showTypeFilter?: boolean;
  category: string | "ALL";
  onCategoryChange: (val: string | "ALL") => void;
  status: ProductStatus | "ALL";
  onStatusChange: (val: ProductStatus | "ALL") => void;
  onReset: () => void;
};

const typeOptions = [
  { value: "ALL", label: "All Types" },
  { value: "PRODUCT", label: "Products Only" },
  { value: "SERVICE", label: "Services Only" },
];

const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const categoryOptions = [
  { value: "ALL", label: "All Categories" },
  ...STANDARD_CATEGORIES.map((c) => ({ value: c, label: c })),
];

export const ProductFilterBar = ({
  query,
  onQueryChange,
  type = "ALL",
  onTypeChange,
  showTypeFilter = false,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  onReset,
}: ProductFilterBarProps) => {
  const hasActiveFilters =
    query.trim().length > 0 ||
    (showTypeFilter && type !== "ALL") ||
    category !== "ALL" ||
    status !== "ALL";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-card p-3 sm:flex-row sm:items-center">
      {/* Search Input */}
      <div className="min-w-0 flex-1">
        <Input
          id="product-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by name, SKU/code, or HSN/SAC..."
          startIcon={<Search size={16} />}
          aria-label="Search catalogue"
          className="h-10 text-sm"
        />
      </div>

      {/* Item Type Dropdown (if enabled) */}
      {showTypeFilter && onTypeChange && (
        <div className="w-full sm:w-44 shrink-0">
          <Select
            id="filter-product-type"
            value={type}
            onChange={(val) => onTypeChange(val as ProductType | "ALL")}
            options={typeOptions}
            aria-label="Filter by item type"
            className="h-10 text-sm"
          />
        </div>
      )}

      {/* Category Dropdown */}
      <div className="w-full sm:w-44 shrink-0">
        <Select
          id="filter-product-category"
          value={category}
          onChange={(val) => onCategoryChange(val as string | "ALL")}
          options={categoryOptions}
          aria-label="Filter by category"
          className="h-10 text-sm"
        />
      </div>

      {/* Status Dropdown */}
      <div className="w-full sm:w-36 shrink-0">
        <Select
          id="filter-product-status"
          value={status}
          onChange={(val) => onStatusChange(val as ProductStatus | "ALL")}
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
