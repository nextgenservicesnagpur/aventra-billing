"use client";

import Link from "next/link";
import { Edit2, Eye, Package, SearchX, Handshake } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/table";
import { formatProductPrice } from "../../domain/entities/product";
import type { ProductDto } from "../../data/dto/product-dto";

export type ProductTableProps = {
  products: ProductDto[];
  isFiltered?: boolean;
  onClearFilters?: () => void;
  basePath?: "/products" | "/services";
};

export const ProductTable = ({
  products,
  isFiltered = false,
  onClearFilters,
  basePath = "/products",
}: ProductTableProps) => {
  const isServicesContext = basePath === "/services";

  if (products.length === 0) {
    if (isFiltered) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-text-muted">
            <SearchX size={24} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-text-primary">
            No matching items
          </h3>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            No catalogue items matched your search query or filter criteria.
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
          {isServicesContext ? <Handshake size={24} /> : <Package size={24} />}
        </div>
        <h3 className="mt-4 text-base font-semibold text-text-primary">
          {isServicesContext ? "No services yet" : "No products yet"}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          {isServicesContext
            ? "Create your first service catalogue record for billing and quotes."
            : "Get started by adding your first product to the inventory catalogue."}
        </p>
        <Link
          href={`${basePath}/new`}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-light"
        >
          {isServicesContext ? "+ Add Service" : "+ Add Product"}
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">
              {isServicesContext ? "Service" : "Product"}
            </TableHead>
            <TableHead className="w-[14%]">SKU / Code</TableHead>
            <TableHead className="w-[14%]">Category</TableHead>
            <TableHead className="w-[14%] text-right">Selling Price</TableHead>
            <TableHead className="w-[8%] text-center">Unit</TableHead>
            <TableHead className="w-[10%]">
              {isServicesContext ? "SAC" : "HSN/SAC"}
            </TableHead>
            <TableHead className="w-[8%] text-center">Tax</TableHead>
            <TableHead className="w-[8%] text-center">Status</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => {
            const isActive = p.status === "ACTIVE";
            const detailHref = `${basePath}/${p.id}`;
            const editHref = `${basePath}/${p.id}/edit`;

            return (
              <TableRow key={p.id} className="group">
                {/* Product / Service Name */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-surface-alt text-primary-light">
                      {p.type === "PRODUCT" ? (
                        <Package size={15} />
                      ) : (
                        <Handshake size={15} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={detailHref}
                        className="truncate text-sm font-medium text-text-primary group-hover:text-primary-light transition-colors hover:underline block"
                      >
                        {p.name}
                      </Link>
                      {p.description && (
                        <p className="truncate text-xs text-text-muted max-w-xs">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* SKU / Code */}
                <TableCell>
                  {p.sku ? (
                    <span className="font-mono text-xs text-text-secondary">
                      {p.sku}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">—</span>
                  )}
                </TableCell>

                {/* Category */}
                <TableCell>
                  <span className="inline-flex items-center rounded-md border border-border/70 bg-surface-alt px-2 py-0.5 text-xs text-text-secondary">
                    {p.category || "General"}
                  </span>
                </TableCell>

                {/* Selling Price */}
                <TableCell className="text-right font-medium text-sm text-text-primary">
                  {formatProductPrice(p.sellingPrice, p.currency)}
                </TableCell>

                {/* Unit */}
                <TableCell className="text-center">
                  <span className="text-xs font-mono text-text-secondary">
                    {p.unit}
                  </span>
                </TableCell>

                {/* HSN / SAC */}
                <TableCell>
                  {p.hsnSac ? (
                    <span className="font-mono text-xs text-text-secondary">
                      {p.hsnSac}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">—</span>
                  )}
                </TableCell>

                {/* Tax Rate */}
                <TableCell className="text-center">
                  <span className="text-xs text-text-secondary font-mono">
                    {p.taxRate}%
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
                      href={detailHref}
                      aria-label={`View details for ${p.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-text-secondary transition-colors hover:border-text-muted hover:bg-surface-alt hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      <Eye size={13} />
                    </Link>
                    <Link
                      href={editHref}
                      aria-label={`Edit ${p.name}`}
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
