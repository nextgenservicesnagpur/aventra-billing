"use client";

import { Settings2 } from "lucide-react";
import { Input, Label, Select } from "@/shared/components/form";
import type { CustomerAdditionalSettings } from "../../domain/customer";

export type CustomerAdditionalSettingsSectionProps = {
  settings: CustomerAdditionalSettings;
  onChange: (updates: Partial<CustomerAdditionalSettings>) => void;
  creditLimitError?: string;
  defaultDiscountError?: string;
};

const paymentTermsOptions = [
  { value: "Net 15 days", label: "Net 15 days" },
  { value: "Net 30 days", label: "Net 30 days" },
  { value: "Net 45 days", label: "Net 45 days" },
  { value: "Net 60 days", label: "Net 60 days" },
  { value: "Due on Receipt", label: "Due on Receipt" },
];

const taxPreferenceOptions = [
  { value: "18% (IGST)", label: "18% (IGST)" },
  { value: "12% (IGST)", label: "12% (IGST)" },
  { value: "5% (IGST)", label: "5% (IGST)" },
  { value: "0%", label: "0%" },
  { value: "Tax Exempt", label: "Tax Exempt" },
];

const priceListOptions = [
  { value: "Default Price List", label: "Default Price List" },
  { value: "Wholesale Price List", label: "Wholesale Price List" },
  { value: "Retail Price List", label: "Retail Price List" },
];

export const CustomerAdditionalSettingsSection = ({
  settings,
  onChange,
  creditLimitError,
  defaultDiscountError,
}: CustomerAdditionalSettingsSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <Settings2 size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Additional Settings
          </h2>
          <p className="text-xs text-text-secondary">
            Configure credit and payment settings.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Payment Terms */}
        <div className="space-y-1.5">
          <Label htmlFor="setting-payment-terms" className="text-xs">
            Payment Terms
          </Label>
          <Select
            id="setting-payment-terms"
            value={settings.paymentTerms}
            onChange={(val) => onChange({ paymentTerms: val })}
            options={paymentTermsOptions}
            className="h-10 text-sm"
          />
        </div>

        {/* Credit Limit */}
        <div className="space-y-1.5">
          <Label htmlFor="setting-credit-limit" className="text-xs">
            Credit Limit (₹)
          </Label>
          <Input
            id="setting-credit-limit"
            type="number"
            min="0"
            step="1000"
            value={settings.creditLimit ?? ""}
            onChange={(e) =>
              onChange({
                creditLimit:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="1,00,000.00"
            startIcon={<span className="text-xs text-text-muted">₹</span>}
            aria-invalid={Boolean(creditLimitError)}
            className="h-10 text-sm"
          />
          {creditLimitError && (
            <p className="text-xs text-danger" role="alert">
              {creditLimitError}
            </p>
          )}
        </div>

        {/* Default Discount */}
        <div className="space-y-1.5">
          <Label htmlFor="setting-default-discount" className="text-xs">
            Default Discount (%)
          </Label>
          <Input
            id="setting-default-discount"
            type="number"
            min="0"
            max="100"
            value={settings.defaultDiscount ?? 0}
            onChange={(e) =>
              onChange({
                defaultDiscount:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="0"
            aria-invalid={Boolean(defaultDiscountError)}
            className="h-10 text-sm"
          />
          {defaultDiscountError && (
            <p className="text-xs text-danger" role="alert">
              {defaultDiscountError}
            </p>
          )}
        </div>

        {/* Default Tax Preference */}
        <div className="space-y-1.5">
          <Label htmlFor="setting-tax-preference" className="text-xs">
            Default Tax Preference
          </Label>
          <Select
            id="setting-tax-preference"
            value={settings.defaultTaxPreference}
            onChange={(val) => onChange({ defaultTaxPreference: val })}
            options={taxPreferenceOptions}
            className="h-10 text-sm"
          />
        </div>

        {/* Price List */}
        <div className="space-y-1.5">
          <Label htmlFor="setting-price-list" className="text-xs">
            Price List
          </Label>
          <Select
            id="setting-price-list"
            value={settings.priceList}
            onChange={(val) => onChange({ priceList: val })}
            options={priceListOptions}
            className="h-10 text-sm"
          />
        </div>
      </div>
    </section>
  );
};
