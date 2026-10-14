"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  CircleDollarSign,
  Edit2,
  FileText,
  Handshake,
  Loader2,
  Package,
  ReceiptText,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { formatProductPrice } from "../../domain/entities/product";
import type { ProductDto } from "../../data/dto/product-dto";
import { deleteProductAction } from "../../data/mutations/product-mutations";

export type ProductDetailPageProps = {
  product: ProductDto;
};

export const ProductDetailPage = ({ product }: ProductDetailPageProps) => {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isService = product.type === "SERVICE";
  const listHref = isService ? "/services" : "/products";
  const editHref = isService ? `/services/${product.id}/edit` : `/products/${product.id}/edit`;
  const isActive = product.status === "ACTIVE";

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteProductAction(product.id);
      if (!result.success) {
        setDeleteError(result.error || "Failed to delete item.");
        return;
      }
      router.push(listHref);
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={listHref}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to {isService ? "Services" : "Products"}</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {product.name}
            </h1>
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
          </div>
          {product.sku && (
            <p className="mt-1 font-mono text-xs text-text-muted">
              {isService ? "Service Code:" : "SKU:"} {product.sku}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={editHref}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-alt px-3.5 text-xs font-medium text-text-primary transition-colors hover:border-text-muted hover:bg-surface"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>

      {deleteError && (
        <div
          className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger"
          role="alert"
        >
          {deleteError}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <div className="rounded-xl border border-border bg-surface-card p-5">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
              {isService ? <Handshake size={16} /> : <Package size={16} />}
            </div>
            <h2 className="text-sm font-semibold text-text-primary">
              Basic Details
            </h2>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-text-muted">Item Type</dt>
              <dd className="mt-1 font-medium text-text-primary">
                {isService ? "Service" : "Goods / Product"}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Category</dt>
              <dd className="mt-1 font-medium text-text-primary">
                {product.category || "General"}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">
                {isService ? "Service Code" : "SKU"}
              </dt>
              <dd className="mt-1 font-mono text-text-primary">
                {product.sku || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Measurement Unit</dt>
              <dd className="mt-1 font-mono text-text-primary">
                {product.unit}
              </dd>
            </div>
            {product.description && (
              <div className="col-span-2">
                <dt className="text-text-muted">Description</dt>
                <dd className="mt-1 text-text-secondary leading-relaxed">
                  {product.description}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-border bg-surface-card p-5">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
              <CircleDollarSign size={16} />
            </div>
            <h2 className="text-sm font-semibold text-text-primary">
              Pricing & Cost
            </h2>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-text-muted">Selling Price / Rate</dt>
              <dd className="mt-1 text-base font-semibold text-primary-light">
                {formatProductPrice(product.sellingPrice, product.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Purchase / Cost Price</dt>
              <dd className="mt-1 font-medium text-text-primary">
                {product.purchasePrice !== null && product.purchasePrice !== undefined
                  ? formatProductPrice(product.purchasePrice, product.currency)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Currency</dt>
              <dd className="mt-1 font-medium text-text-primary">
                {product.currency}
              </dd>
            </div>
          </dl>
        </div>

        {/* Tax & Compliance */}
        <div className="rounded-xl border border-border bg-surface-card p-5">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
              <ReceiptText size={16} />
            </div>
            <h2 className="text-sm font-semibold text-text-primary">
              Tax & Compliance
            </h2>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-text-muted">
                {isService ? "SAC Code" : "HSN Code"}
              </dt>
              <dd className="mt-1 font-mono text-text-primary">
                {product.hsnSac || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">GST Rate</dt>
              <dd className="mt-1 font-mono text-text-primary">
                {product.taxRate}%
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Tax Preference</dt>
              <dd className="mt-1 font-medium text-text-primary">
                {product.taxPreference}
              </dd>
            </div>
          </dl>
        </div>

        {/* Inventory Settings (Products Only) */}
        {!isService && (
          <div className="rounded-xl border border-border bg-surface-card p-5">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
                <Boxes size={16} />
              </div>
              <h2 className="text-sm font-semibold text-text-primary">
                Inventory Tracking
              </h2>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-text-muted">Stock Tracking</dt>
                <dd className="mt-1 font-medium text-text-primary">
                  {product.trackInventory ? "Enabled" : "Disabled"}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Low Stock Threshold (Reorder)</dt>
                <dd className="mt-1 font-mono text-text-primary">
                  {product.reorderPoint !== null && product.reorderPoint !== undefined
                    ? `${product.reorderPoint} ${product.unit}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Notes (if available) */}
        {product.internalNotes && (
          <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-surface-card p-5">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
                <FileText size={16} />
              </div>
              <h2 className="text-sm font-semibold text-text-primary">
                Internal Notes
              </h2>
            </div>
            <p className="mt-3 text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
              {product.internalNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
