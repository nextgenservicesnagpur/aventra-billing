"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { ProductType, ProductStatus } from "../../domain/entities/product";
import type { ProductDto } from "../../data/dto/product-dto";
import { ProductFilterBar } from "../components/ProductFilterBar";
import { ProductTable } from "../components/ProductTable";
import { Pagination } from "@/shared/components/table";

const PAGE_SIZE = 10;

export type ProductListPageProps = {
  initialProducts?: ProductDto[];
  itemType?: ProductType;
};

export const ProductListPage = ({
  initialProducts = [],
  itemType,
}: ProductListPageProps) => {
  const isServicesPage = itemType === "SERVICE";
  const basePath = isServicesPage ? "/services" : "/products";

  // Filter state
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | "ALL">("ALL");
  const [status, setStatus] = useState<ProductStatus | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<ProductType | "ALL">(
    itemType || "ALL",
  );
  const [currentPage, setCurrentPage] = useState(1);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string | "ALL") => {
    setCategory(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: ProductStatus | "ALL") => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handleTypeChange = (val: ProductType | "ALL") => {
    setSelectedType(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setQuery("");
    setCategory("ALL");
    setStatus("ALL");
    if (!itemType) setSelectedType("ALL");
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      // Type filter
      if (itemType) {
        if (p.type !== itemType) return false;
      } else if (selectedType !== "ALL" && p.type !== selectedType) {
        return false;
      }

      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q) ?? false;
        const matchesHsn = p.hsnSac?.toLowerCase().includes(q) ?? false;
        const matchesCategory = p.category?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesSku && !matchesHsn && !matchesCategory) {
          return false;
        }
      }

      // Category filter
      if (category !== "ALL" && p.category !== category) {
        return false;
      }

      // Status filter
      if (status !== "ALL" && p.status !== status) {
        return false;
      }

      return true;
    });
  }, [initialProducts, itemType, selectedType, query, category, status]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const isFiltered =
    query.trim().length > 0 ||
    category !== "ALL" ||
    status !== "ALL" ||
    (!itemType && selectedType !== "ALL");

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            {isServicesPage ? "Services" : "Products"}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {isServicesPage
              ? "Manage your service catalogue, billing rates, and tax details."
              : "Manage your product catalogue, pricing, and tax details."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`${basePath}/new`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            <Plus size={15} />
            <span>{isServicesPage ? "Add Service" : "Add Product"}</span>
          </Link>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <ProductFilterBar
        query={query}
        onQueryChange={handleQueryChange}
        type={selectedType}
        onTypeChange={handleTypeChange}
        showTypeFilter={!itemType}
        category={category}
        onCategoryChange={handleCategoryChange}
        status={status}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
      />

      {/* Product Table */}
      <ProductTable
        products={paginatedProducts}
        isFiltered={isFiltered}
        onClearFilters={handleResetFilters}
        basePath={basePath}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-4 sm:flex-row">
          <p className="text-xs text-text-secondary">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} items
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </section>
  );
};
