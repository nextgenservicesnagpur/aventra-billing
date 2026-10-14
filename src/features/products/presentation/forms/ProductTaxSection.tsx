"use client";

import { ReceiptText } from "lucide-react";
import { Input, Label, Select } from "@/shared/components/form";
import type { ProductType } from "../../domain/entities/product";
import { STANDARD_TAX_RATES } from "../../domain/rules/product-rules";

export type ProductTaxSectionProps = {
  type: ProductType;
  hsnSac: string;
  onHsnSacChange: (val: string) => void;
  taxRate: number | string;
  onTaxRateChange: (val: string) => void;
  taxPreference: string;
  onTaxPreferenceChange: (val: string) => void;
  errors?: Record<string, string>;
};

const taxRateOptions = STANDARD_TAX_RATES.map((rate) => ({
  value: String(rate),
  label: `${rate}% GST`,
}));

const taxPreferenceOptions = [
  { value: "Taxable", label: "Taxable" },
  { value: "Exempt", label: "Exempt" },
  { value: "Nil-rated", label: "Nil-rated" },
  { value: "Non-GST", label: "Non-GST" },
];

export const ProductTaxSection = ({
  type,
  hsnSac,
  onHsnSacChange,
  taxRate,
  onTaxRateChange,
  taxPreference,
  onTaxPreferenceChange,
  errors = {},
}: ProductTaxSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <ReceiptText size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Tax &amp; Compliance
          </h2>
          <p className="text-xs text-text-secondary">
            Configure GST rate and {type === "PRODUCT" ? "HSN" : "SAC"} classification codes.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* HSN/SAC Code */}
        <div className="space-y-1.5">
          <Label htmlFor="hsn-sac" className="text-xs">
            {type === "PRODUCT" ? "HSN Code" : "SAC Code"}
          </Label>
          <Input
            id="hsn-sac"
            value={hsnSac}
            onChange={(e) => onHsnSacChange(e.target.value)}
            placeholder={type === "PRODUCT" ? "e.g., 84713010" : "e.g., 998313"}
            aria-invalid={Boolean(errors.hsnSac)}
            className="h-10 text-sm"
          />
          {errors.hsnSac && (
            <p className="text-xs text-danger" role="alert">
              {errors.hsnSac}
            </p>
          )}
        </div>

        {/* GST Tax Rate */}
        <div className="space-y-1.5">
          <Label htmlFor="tax-rate" className="text-xs">
            Applicable GST Rate <span className="text-danger">*</span>
          </Label>
          <Select
            id="tax-rate"
            value={String(taxRate)}
            onChange={onTaxRateChange}
            options={taxRateOptions}
            className="h-10 text-sm"
          />
          {errors.taxRate && (
            <p className="text-xs text-danger" role="alert">
              {errors.taxRate}
            </p>
          )}
        </div>

        {/* Tax Preference */}
        <div className="space-y-1.5">
          <Label htmlFor="tax-preference" className="text-xs">
            Tax Preference <span className="text-danger">*</span>
          </Label>
          <Select
            id="tax-preference"
            value={taxPreference}
            onChange={onTaxPreferenceChange}
            options={taxPreferenceOptions}
            className="h-10 text-sm"
          />
          {errors.taxPreference && (
            <p className="text-xs text-danger" role="alert">
              {errors.taxPreference}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
