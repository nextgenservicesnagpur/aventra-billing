"use client";

import Link from "next/link";
import { Edit2, Eye, Users, SearchX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/table";
import { Avatar } from "@/shared/components/Avatar";
import {
  formatCurrency,
  getCustomerInitials,
} from "../../domain/entities/customer";
import type { CustomerDto } from "../../data/dto/customer-dto";

export type CustomerTableProps = {
  customers: CustomerDto[];
  isFiltered?: boolean;
  onClearFilters?: () => void;
};

export const CustomerTable = ({
  customers,
  isFiltered = false,
  onClearFilters,
}: CustomerTableProps) => {
  if (customers.length === 0) {
    if (isFiltered) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-text-muted">
            <SearchX size={24} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-text-primary">
            No matching customers
          </h3>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            No customer records matched your search query or filter criteria.
          </p>
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-border bg-surface-alt px-4 text-xs font-medium text-text-primary transition-colors hover:border-text-muted hover:bg-surface cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-card p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-text-muted">
          <Users size={24} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-text-primary">
          No customers yet
        </h3>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          Get started by creating your first customer profile for invoicing and billing.
        </p>
        <Link
          href="/customers/new"
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-light"
        >
          Add Customer
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">Customer</TableHead>
            <TableHead className="w-[14%]">Type</TableHead>
            <TableHead className="w-[20%]">Contact</TableHead>
            <TableHead className="w-[16%]">GSTIN / Tax ID</TableHead>
            <TableHead className="w-[12%] text-right">Balance</TableHead>
            <TableHead className="w-[10%] text-center">Status</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((cust) => {
            const initials = getCustomerInitials(cust.name);
            const isActive = cust.status === "ACTIVE";
            const displayType =
              cust.customerType === "BUSINESS" ? "Business" : "Individual";

            return (
              <TableRow key={cust.id} className="group">
                {/* Customer Identity */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      label={initials}
                      className="h-9 w-9 bg-surface-alt text-xs font-bold text-primary-light border border-border/80"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/customers/${cust.id}`}
                        className="truncate text-sm font-medium text-text-primary group-hover:text-primary-light transition-colors hover:underline block"
                      >
                        {cust.name}
                      </Link>
                      <p className="truncate text-xs text-text-muted">
                        {cust.email || cust.phone || "No direct contact"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Customer Type */}
                <TableCell>
                  <span className="inline-flex items-center rounded-md border border-border/80 bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                    {displayType}
                  </span>
                </TableCell>

                {/* Contact Person & Phone */}
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-primary">
                      {cust.contactPerson || "—"}
                    </p>
                    {cust.phone && (
                      <p className="truncate text-xs text-text-muted">
                        {cust.phone}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* GSTIN */}
                <TableCell>
                  {cust.gstin ? (
                    <span className="font-mono text-xs text-text-primary">
                      {cust.gstin}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">Unregistered</span>
                  )}
                </TableCell>

                {/* Outstanding Balance */}
                <TableCell className="text-right">
                  <span
                    className={
                      (cust.outstandingBalance ?? 0) > 0
                        ? "font-medium text-sm text-warning"
                        : "text-sm text-text-secondary"
                    }
                  >
                    {formatCurrency(cust.outstandingBalance ?? cust.creditLimit ?? 0, cust.currency)}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isActive
                        ? "bg-success/15 text-success"
                        : "bg-surface-alt text-text-muted border border-border/80"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-success" : "bg-text-muted"
                      }`}
                      aria-hidden="true"
                    />
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/customers/${cust.id}`}
                      aria-label={`View details for ${cust.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-text-secondary transition-colors hover:border-text-muted hover:bg-surface-alt hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      <Eye size={13} />
                    </Link>
                    <Link
                      href={`/customers/${cust.id}/edit`}
                      aria-label={`Edit ${cust.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-text-secondary transition-colors hover:border-text-muted hover:bg-surface-alt hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      <Edit2 size={13} />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
