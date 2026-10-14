"use client";

import { Package, Handshake, Box } from "lucide-react";
import { Input, Label, Select, Textarea } from "@/shared/components/form";
import type { ProductType, ProductStatus } from "../../domain/entities/product";
import { STANDARD_CATEGORIES } from "../../domain/rules/product-rules";

export type ProductBasicInformationSectionProps = {
  name: string;
  onNameChange: (val: string) => void;
  type: ProductType;
  onTypeChange: (val: ProductType) => void;
  sku: string;
  onSkuChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  status: ProductStatus;
  onStatusChange: (val: ProductStatus) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  lockType?: boolean;
  errors?: Record<string, string>;
};

const typeOptions = [
  { value: "PRODUCT", label: "Goods / Product" },
  { value: "SERVICE", label: "Service" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const categoryOptions = [
  { value: "", label: "Select Category..." },
  ...STANDARD_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
];

export const ProductBasicInformationSection = ({
  name,
  onNameChange,
  type,
  onTypeChange,
  sku,
  onSkuChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  description,
  onDescriptionChange,
  lockType = false,
  errors = {},
}: ProductBasicInformationSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          {type === "PRODUCT" ? <Package size={18} /> : <Handshake size={18} />}
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Basic Information
          </h2>
          <p className="text-xs text-text-secondary">
            {type === "PRODUCT"
              ? "Enter product name, identifier, and category."
              : "Enter service name, code, and categorization."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Name */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
          <Label htmlFor="item-name" className="text-xs">
            {type === "PRODUCT" ? "Product Name" : "Service Name"}{" "}
            <span className="text-danger">*</span>
          </Label>
          <Input
            id="item-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={
              type === "PRODUCT"
                ? "e.g., Wireless Barcode Scanner"
                : "e.g., Cloud Architecture Consulting"
            }
            aria-invalid={Boolean(errors.name)}
            className="h-10 text-sm"
          />
          {errors.name && (
            <p className="text-xs text-danger" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Item Type */}
        <div className="space-y-1.5 sm:col-span-1 lg:col-span-1">
          <Label htmlFor="item-type" className="text-xs">
            Item Type <span className="text-danger">*</span>
          </Label>
          <Select
            id="item-type"
            value={type}
            onChange={(val) => onTypeChange(val as ProductType)}
            options={typeOptions}
            disabled={lockType}
            startIcon={
              type === "PRODUCT" ? <Box size={16} /> : <Handshake size={16} />
            }
            className="h-10 text-sm"
          />
          {errors.type && (
            <p className="text-xs text-danger" role="alert">
              {errors.type}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-1.5 sm:col-span-1 lg:col-span-1">
          <Label htmlFor="item-status" className="text-xs">
            Status <span className="text-danger">*</span>
          </Label>
          <Select
            id="item-status"
            value={status}
            onChange={(val) => onStatusChange(val as ProductStatus)}
            options={statusOptions}
            className="h-10 text-sm"
          />
          {errors.status && (
            <p className="text-xs text-danger" role="alert">
              {errors.status}
            </p>
          )}
        </div>

        {/* SKU / Code */}
        <div className="space-y-1.5 sm:col-span-1 lg:col-span-2">
          <Label htmlFor="item-sku" className="text-xs">
            {type === "PRODUCT" ? "SKU / Product Code" : "Service Code"}
          </Label>
          <Input
            id="item-sku"
            value={sku}
            onChange={(e) => onSkuChange(e.target.value)}
            placeholder={type === "PRODUCT" ? "e.g., PROD-SCN-001" : "e.g., SRV-CON-001"}
            aria-invalid={Boolean(errors.sku)}
            className="h-10 text-sm"
          />
          {errors.sku && (
            <p className="text-xs text-danger" role="alert">
              {errors.sku}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5 sm:col-span-1 lg:col-span-2">
          <Label htmlFor="item-category" className="text-xs">
            Category
          </Label>
          <Select
            id="item-category"
            value={category}
            onChange={onCategoryChange}
            options={categoryOptions}
            className="h-10 text-sm"
          />
          {errors.category && (
            <p className="text-xs text-danger" role="alert">
              {errors.category}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-4">
          <Label htmlFor="item-description" className="text-xs">
            Description
          </Label>
          <Textarea
            id="item-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add detailed item description for invoices and orders..."
            rows={3}
            className="text-sm resize-none"
          />
          {errors.description && (
            <p className="text-xs text-danger" role="alert">
              {errors.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
