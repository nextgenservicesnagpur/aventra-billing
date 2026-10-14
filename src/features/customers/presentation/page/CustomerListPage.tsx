"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CustomerType, CustomerStatus } from "../../domain/entities/customer";
import type { CustomerDto } from "../../data/dto/customer-dto";
import { CustomerFilterBar } from "../components/CustomerFilterBar";
import { CustomerTable } from "../components/CustomerTable";
import { Pagination } from "@/shared/components/table";

const PAGE_SIZE = 8;

export type CustomerListPageProps = {
  initialCustomers?: CustomerDto[];
};

export const CustomerListPage = ({
  initialCustomers = [],
}: CustomerListPageProps) => {
  const searchParams = useSearchParams();

  // Filter state
  const [query, setQuery] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType | "All">("All");
  const [status, setStatus] = useState<CustomerStatus | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handleCustomerTypeChange = (val: CustomerType | "All") => {
    setCustomerType(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: CustomerStatus | "All") => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setQuery("");
    setCustomerType("All");
    setStatus("All");
    setCurrentPage(1);
  };

  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((c) => {
      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesEmail = c.email?.toLowerCase().includes(q) ?? false;
        const matchesPhone = c.phone?.toLowerCase().includes(q) ?? false;
        const matchesGstin = c.gstin?.toLowerCase().includes(q) ?? false;
        const matchesContact = c.contactPerson?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesGstin && !matchesContact) {
          return false;
        }
      }

      // Customer type filter
      if (customerType !== "All" && c.customerType !== customerType) {
        return false;
      }

      // Status filter
      if (status !== "All" && c.status !== status) {
        return false;
      }

      return true;
    });
  }, [initialCustomers, query, customerType, status]);

  const totalCount = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, currentPage]);

  const isFiltered =
    query.trim().length > 0 || customerType !== "All" || status !== "All";

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Customers
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage customer records and billing information.
          </p>
        </div>

        <Link
          href="/customers/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus shrink-0"
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </Link>
      </header>

      {/* Success feedback banner */}
      {searchParams?.get("saved") === "1" && (
        <p
          className="rounded-lg border border-success/40 bg-success/15 px-4 py-3 text-sm text-success"
          role="status"
        >
          Customer record saved successfully.
        </p>
      )}

      {/* Filter Row */}
      <CustomerFilterBar
        query={query}
        onQueryChange={handleQueryChange}
        customerType={customerType}
        onCustomerTypeChange={handleCustomerTypeChange}
        status={status}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
      />

      {/* Customers Data Table */}
      <CustomerTable
        customers={paginatedCustomers}
        isFiltered={isFiltered}
        onClearFilters={handleResetFilters}
      />

      {/* Pagination */}
      {totalCount > PAGE_SIZE && (
        <div className="flex justify-between items-center pt-2">
          <p className="text-xs text-text-secondary">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} customers
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
