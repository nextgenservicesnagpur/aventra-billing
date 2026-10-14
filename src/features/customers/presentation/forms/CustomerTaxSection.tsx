"use client";

import { FileText } from "lucide-react";
import { Input, Label, Select } from "@/shared/components/form";
import type { GstTreatment } from "../../domain/entities/customer";
import { derivePanFromGstin } from "../../domain/rules/customer-rules";

export type CustomerTaxSectionProps = {
  gstin: string;
  onGstinChange: (val: string) => void;
  pan: string;
  onPanChange: (val: string) => void;
  currency: string;
  onCurrencyChange: (val: string) => void;
  placeOfSupply: string;
  onPlaceOfSupplyChange: (val: string) => void;
  gstTreatment: GstTreatment;
  gstinError?: string;
  panError?: string;
};

const currencyOptions = [
  { value: "INR (₹)", label: "INR (₹)" },
  { value: "USD ($)", label: "USD ($)" },
  { value: "EUR (€)", label: "EUR (€)" },
  { value: "GBP (£)", label: "GBP (£)" },
  { value: "AED (د.إ)", label: "AED (د.إ)" },
];

const placeOfSupplyOptions = [
  { value: "27-Maharashtra", label: "27-Maharashtra" },
  { value: "29-Karnataka", label: "29-Karnataka" },
  { value: "07-Delhi", label: "07-Delhi" },
  { value: "06-Haryana", label: "06-Haryana" },
  { value: "24-Gujarat", label: "24-Gujarat" },
  { value: "33-Tamil Nadu", label: "33-Tamil Nadu" },
  { value: "36-Telangana", label: "36-Telangana" },
  { value: "09-Uttar Pradesh", label: "09-Uttar Pradesh" },
  { value: "19-West Bengal", label: "19-West Bengal" },
  { value: "08-Rajasthan", label: "08-Rajasthan" },
  { value: "23-Madhya Pradesh", label: "23-Madhya Pradesh" },
  { value: "03-Punjab", label: "03-Punjab" },
  { value: "32-Kerala", label: "32-Kerala" },
  { value: "30-Goa", label: "30-Goa" },
  { value: "99-Other Territory / Export", label: "99-Other Territory / Export" },
];

export const CustomerTaxSection = ({
  gstin,
  onGstinChange,
  pan,
  onPanChange,
  currency,
  onCurrencyChange,
  placeOfSupply,
  onPlaceOfSupplyChange,
  gstTreatment,
  gstinError,
  panError,
}: CustomerTaxSectionProps) => {
  const isGstRequired =
    gstTreatment === "REGISTERED_BUSINESS_REGULAR" ||
    gstTreatment === "SPECIAL_ECONOMIC_ZONE" ||
    gstTreatment === "COMPOSITION_SCHEME";

  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <FileText size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Tax &amp; Compliance
          </h2>
          <p className="text-xs text-text-secondary">
            Enter tax and regulatory details.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* GSTIN */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-gstin" className="text-xs">
            GSTIN {isGstRequired && <span className="text-danger">*</span>}
          </Label>
          <Input
            id="customer-gstin"
            value={gstin}
            onChange={(e) =>
              onGstinChange(e.target.value.replace(/\s+/g, "").toUpperCase())
            }
            placeholder="ENTER GSTIN (15 CHARACTERS)..."
            aria-invalid={Boolean(gstinError)}
            className="h-10 text-sm font-mono tracking-wider uppercase"
            maxLength={15}
          />
          {gstinError && (
            <p className="text-xs text-danger" role="alert">
              {gstinError}
            </p>
          )}
        </div>

        {/* PAN */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="customer-pan" className="text-xs">
              PAN
            </Label>
            {pan && pan === derivePanFromGstin(gstin) && (
              <span className="text-[10px] text-primary-light font-medium">
                Auto-extracted
              </span>
            )}
          </div>
          <Input
            id="customer-pan"
            value={pan}
            onChange={(e) =>
              onPanChange(e.target.value.replace(/\s+/g, "").toUpperCase())
            }
            placeholder="ENTER PAN..."
            aria-invalid={Boolean(panError)}
            className="h-10 text-sm font-mono tracking-wider uppercase"
            maxLength={10}
          />
          {panError && (
            <p className="text-xs text-danger" role="alert">
              {panError}
            </p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-currency" className="text-xs">
            Currency <span className="text-danger">*</span>
          </Label>
          <Select
            id="customer-currency"
            value={currency}
            onChange={onCurrencyChange}
            options={currencyOptions}
            className="h-10 text-sm"
          />
        </div>

        {/* Place of Supply */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-place-of-supply" className="text-xs">
            Place of Supply <span className="text-danger">*</span>
          </Label>
          <Select
            id="customer-place-of-supply"
            value={placeOfSupply}
            onChange={onPlaceOfSupplyChange}
            options={placeOfSupplyOptions}
            className="h-10 text-sm"
          />
        </div>
      </div>
    </section>
  );
};
