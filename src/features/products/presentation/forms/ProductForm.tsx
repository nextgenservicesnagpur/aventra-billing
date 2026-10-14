"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/shared/components/form/Button";
import type { ProductDto, CreateProductInput } from "../../data/dto/product-dto";
import type { ProductType, ProductStatus } from "../../domain/entities/product";
import { createProductAction, updateProductAction } from "../../data/mutations/product-mutations";
import { ProductBasicInformationSection } from "./ProductBasicInformationSection";
import { ProductPricingSection } from "./ProductPricingSection";
import { ProductTaxSection } from "./ProductTaxSection";
import { ProductInventorySection } from "./ProductInventorySection";
import { ProductNotesSection } from "./ProductNotesSection";

export type ProductFormProps = {
  initialData?: ProductDto | null;
  isEdit?: boolean;
  defaultType?: ProductType;
  lockType?: boolean;
};

export const ProductForm = ({
  initialData,
  isEdit = false,
  defaultType = "PRODUCT",
  lockType = false,
}: ProductFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Basic Information
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<ProductType>(
    initialData?.type || defaultType,
  );
  const [sku, setSku] = useState(initialData?.sku || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [status, setStatus] = useState<ProductStatus>(
    initialData?.status || "ACTIVE",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  // Pricing
  const [sellingPrice, setSellingPrice] = useState<string>(
    initialData?.sellingPrice !== undefined ? String(initialData.sellingPrice) : "",
  );
  const [purchasePrice, setPurchasePrice] = useState<string>(
    initialData?.purchasePrice !== undefined && initialData?.purchasePrice !== null
      ? String(initialData.purchasePrice)
      : "",
  );
  const [currency, setCurrency] = useState(initialData?.currency || "INR (₹)");
  const [unit, setUnit] = useState(initialData?.unit || (defaultType === "SERVICE" ? "HRS" : "PCS"));

  // Tax & Compliance
  const [hsnSac, setHsnSac] = useState(initialData?.hsnSac || "");
  const [taxRate, setTaxRate] = useState<string>(
    initialData?.taxRate !== undefined ? String(initialData.taxRate) : "18",
  );
  const [taxPreference, setTaxPreference] = useState(
    initialData?.taxPreference || "Taxable",
  );

  // Inventory Settings (Products only)
  const [trackInventory, setTrackInventory] = useState(
    initialData?.trackInventory ?? false,
  );
  const [reorderPoint, setReorderPoint] = useState<string>(
    initialData?.reorderPoint !== undefined && initialData?.reorderPoint !== null
      ? String(initialData.reorderPoint)
      : "",
  );

  // Internal Notes
  const [internalNotes, setInternalNotes] = useState(
    initialData?.internalNotes || "",
  );

  // Error and UI state
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const listRoute = type === "SERVICE" ? "/services" : "/products";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const numericSellingPrice = sellingPrice !== "" ? parseFloat(sellingPrice) : 0;
    if (isNaN(numericSellingPrice) || numericSellingPrice < 0) {
      setFieldErrors({ sellingPrice: "Selling price must be a valid non-negative number." });
      return;
    }

    const numericPurchasePrice = purchasePrice ? parseFloat(purchasePrice) : null;
    if (purchasePrice && (isNaN(numericPurchasePrice!) || numericPurchasePrice! < 0)) {
      setFieldErrors({ purchasePrice: "Purchase price must be a valid non-negative number." });
      return;
    }

    const numericReorderPoint = reorderPoint ? parseFloat(reorderPoint) : null;
    if (reorderPoint && (isNaN(numericReorderPoint!) || numericReorderPoint! < 0)) {
      setFieldErrors({ reorderPoint: "Reorder point must be a non-negative number." });
      return;
    }

    const payload: CreateProductInput = {
      name,
      type,
      sku: sku.trim() || null,
      category: category.trim() || null,
      status,
      description: description.trim() || null,
      sellingPrice: numericSellingPrice,
      purchasePrice: numericPurchasePrice,
      currency,
      unit,
      hsnSac: hsnSac.trim() || null,
      taxRate: parseFloat(taxRate) || 0,
      taxPreference,
      trackInventory: type === "PRODUCT" ? trackInventory : false,
      reorderPoint: type === "PRODUCT" ? numericReorderPoint : null,
      internalNotes: internalNotes.trim() || null,
    };

    startTransition(async () => {
      if (isEdit && initialData) {
        const result = await updateProductAction(initialData.id, payload);
        if (!result.success) {
          setFormError(result.error || "Failed to update item.");
          if (result.fieldErrors) setFieldErrors(result.fieldErrors);
          return;
        }
        router.push(`${listRoute}/${initialData.id}?saved=1`);
      } else {
        const result = await createProductAction(payload);
        if (!result.success) {
          setFormError(result.error || "Failed to create item.");
          if (result.fieldErrors) setFieldErrors(result.fieldErrors);
          return;
        }
        router.push(`${listRoute}?saved=1`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError && (
        <div
          className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger flex items-center justify-between"
          role="alert"
        >
          <span>{formError}</span>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="text-danger hover:opacity-80"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. Basic Information */}
      <ProductBasicInformationSection
        name={name}
        onNameChange={setName}
        type={type}
        onTypeChange={setType}
        sku={sku}
        onSkuChange={setSku}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        description={description}
        onDescriptionChange={setDescription}
        lockType={lockType}
        errors={fieldErrors}
      />

      {/* 2. Pricing & Units */}
      <ProductPricingSection
        type={type}
        sellingPrice={sellingPrice}
        onSellingPriceChange={setSellingPrice}
        purchasePrice={purchasePrice}
        onPurchasePriceChange={setPurchasePrice}
        currency={currency}
        onCurrencyChange={setCurrency}
        unit={unit}
        onUnitChange={setUnit}
        errors={fieldErrors}
      />

      {/* 3. Tax & Compliance */}
      <ProductTaxSection
        type={type}
        hsnSac={hsnSac}
        onHsnSacChange={setHsnSac}
        taxRate={taxRate}
        onTaxRateChange={setTaxRate}
        taxPreference={taxPreference}
        onTaxPreferenceChange={setTaxPreference}
        errors={fieldErrors}
      />

      {/* 4. Inventory Settings (Products Only) */}
      {type === "PRODUCT" && (
        <ProductInventorySection
          trackInventory={trackInventory}
          onTrackInventoryChange={setTrackInventory}
          reorderPoint={reorderPoint}
          onReorderPointChange={setReorderPoint}
          errors={fieldErrors}
        />
      )}

      {/* 5. Internal Notes */}
      <ProductNotesSection
        internalNotes={internalNotes}
        onInternalNotesChange={setInternalNotes}
        errors={fieldErrors}
      />

      {/* Bottom Action Buttons — Aligned with Customer Form Pattern */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href={listRoute}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
        >
          <X size={15} />
          <span>Cancel</span>
        </Link>

        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="h-10 px-5 text-sm shadow-xs"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : isEdit ? (
            <>
              <Check size={16} />
              <span>{type === "PRODUCT" ? "Save Changes" : "Update Service"}</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>{type === "PRODUCT" ? "Create Product" : "Create Service"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
