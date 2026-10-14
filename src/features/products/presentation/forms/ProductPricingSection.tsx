"use client";

import { CircleDollarSign } from "lucide-react";
import { Input, Label, Select } from "@/shared/components/form";
import type { ProductType } from "../../domain/entities/product";
import { STANDARD_UNITS } from "../../domain/rules/product-rules";

export type ProductPricingSectionProps = {
  type: ProductType;
  sellingPrice: number | string;
  onSellingPriceChange: (val: string) => void;
  purchasePrice: number | string;
  onPurchasePriceChange: (val: string) => void;
  currency: string;
  onCurrencyChange: (val: string) => void;
  unit: string;
  onUnitChange: (val: string) => void;
  errors?: Record<string, string>;
};

const currencyOptions = [
  { value: "INR (₹)", label: "INR (₹)" },
  { value: "USD ($)", label: "USD ($)" },
  { value: "EUR (€)", label: "EUR (€)" },
  { value: "GBP (£)", label: "GBP (£)" },
];

const unitOptions = STANDARD_UNITS.map((u) => ({ value: u, label: u }));

export const ProductPricingSection = ({
  type,
  sellingPrice,
  onSellingPriceChange,
  purchasePrice,
  onPurchasePriceChange,
  currency,
  onCurrencyChange,
  unit,
  onUnitChange,
  errors = {},
}: ProductPricingSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <CircleDollarSign size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Pricing &amp; Units
          </h2>
          <p className="text-xs text-text-secondary">
            Configure selling rates, purchase costs, and measurement units.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Selling Price */}
        <div className="space-y-1.5">
          <Label htmlFor="selling-price" className="text-xs">
            Selling Price / Rate <span className="text-danger">*</span>
          </Label>
          <Input
            id="selling-price"
            type="number"
            step="0.01"
            min="0"
            value={sellingPrice}
            onChange={(e) => onSellingPriceChange(e.target.value)}
            placeholder="0.00"
            aria-invalid={Boolean(errors.sellingPrice)}
            className="h-10 text-sm"
          />
          {errors.sellingPrice && (
            <p className="text-xs text-danger" role="alert">
              {errors.sellingPrice}
            </p>
          )}
        </div>

        {/* Purchase Price */}
        <div className="space-y-1.5">
          <Label htmlFor="purchase-price" className="text-xs">
            {type === "PRODUCT" ? "Cost / Purchase Price" : "Internal Cost Rate"}
          </Label>
          <Input
            id="purchase-price"
            type="number"
            step="0.01"
            min="0"
            value={purchasePrice}
            onChange={(e) => onPurchasePriceChange(e.target.value)}
            placeholder="0.00"
            aria-invalid={Boolean(errors.purchasePrice)}
            className="h-10 text-sm"
          />
          {errors.purchasePrice && (
            <p className="text-xs text-danger" role="alert">
              {errors.purchasePrice}
            </p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-1.5">
          <Label htmlFor="currency" className="text-xs">
            Currency <span className="text-danger">*</span>
          </Label>
          <Select
            id="currency"
            value={currency}
            onChange={onCurrencyChange}
            options={currencyOptions}
            className="h-10 text-sm"
          />
          {errors.currency && (
            <p className="text-xs text-danger" role="alert">
              {errors.currency}
            </p>
          )}
        </div>

        {/* Unit of Measurement */}
        <div className="space-y-1.5">
          <Label htmlFor="unit" className="text-xs">
            Unit of Measurement <span className="text-danger">*</span>
          </Label>
          <Select
            id="unit"
            value={unit}
            onChange={onUnitChange}
            options={unitOptions}
            className="h-10 text-sm"
          />
          {errors.unit && (
            <p className="text-xs text-danger" role="alert">
              {errors.unit}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
