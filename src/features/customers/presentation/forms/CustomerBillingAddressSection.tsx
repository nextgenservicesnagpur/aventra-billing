"use client";

import { MapPin } from "lucide-react";
import { Input, Label, Select } from "@/shared/components/form";
import type { CustomerAddress } from "../../domain/entities/customer";

export type CustomerBillingAddressSectionProps = {
  billingAddress: CustomerAddress;
  onBillingAddressChange: (updates: Partial<CustomerAddress>) => void;
  errors?: Record<string, string>;
};

const indianStates = [
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Delhi", label: "Delhi" },
  { value: "Haryana", label: "Haryana" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Punjab", label: "Punjab" },
  { value: "Kerala", label: "Kerala" },
  { value: "Goa", label: "Goa" },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Bihar", label: "Bihar" },
  { value: "Odisha", label: "Odisha" },
  { value: "Assam", label: "Assam" },
  { value: "Other", label: "Other" },
];

const countryOptions = [
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "Singapore", label: "Singapore" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
];

export const CustomerBillingAddressSection = ({
  billingAddress,
  onBillingAddressChange,
  errors = {},
}: CustomerBillingAddressSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <MapPin size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Billing Address
          </h2>
          <p className="text-xs text-text-secondary">
            Enter the customer&apos;s billing address.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Line 1 & Line 2 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="billing-line1" className="text-xs">
              Address Line 1 <span className="text-danger">*</span>
            </Label>
            <Input
              id="billing-line1"
              value={billingAddress.addressLine1}
              onChange={(e) =>
                onBillingAddressChange({ addressLine1: e.target.value })
              }
              placeholder="Enter address line 1..."
              aria-invalid={Boolean(errors["billingAddress.addressLine1"])}
              className="h-10 text-sm"
            />
            {errors["billingAddress.addressLine1"] && (
              <p className="text-xs text-danger" role="alert">
                {errors["billingAddress.addressLine1"]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="billing-line2" className="text-xs">
              Address Line 2
            </Label>
            <Input
              id="billing-line2"
              value={billingAddress.addressLine2 || ""}
              onChange={(e) =>
                onBillingAddressChange({ addressLine2: e.target.value })
              }
              placeholder="Enter address line 2..."
              className="h-10 text-sm"
            />
          </div>
        </div>

        {/* City, State, PIN Code, Country */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="billing-city" className="text-xs">
              City <span className="text-danger">*</span>
            </Label>
            <Input
              id="billing-city"
              value={billingAddress.city}
              onChange={(e) => onBillingAddressChange({ city: e.target.value })}
              placeholder="Enter city..."
              aria-invalid={Boolean(errors["billingAddress.city"])}
              className="h-10 text-sm"
            />
            {errors["billingAddress.city"] && (
              <p className="text-xs text-danger" role="alert">
                {errors["billingAddress.city"]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="billing-state" className="text-xs">
              State <span className="text-danger">*</span>
            </Label>
            <Select
              id="billing-state"
              value={billingAddress.state}
              onChange={(val) => onBillingAddressChange({ state: val })}
              options={indianStates}
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="billing-pincode" className="text-xs">
              PIN Code <span className="text-danger">*</span>
            </Label>
            <Input
              id="billing-pincode"
              value={billingAddress.pinCode}
              onChange={(e) =>
                onBillingAddressChange({ pinCode: e.target.value })
              }
              placeholder="Enter PIN code..."
              aria-invalid={Boolean(errors["billingAddress.pinCode"])}
              className="h-10 text-sm"
            />
            {errors["billingAddress.pinCode"] && (
              <p className="text-xs text-danger" role="alert">
                {errors["billingAddress.pinCode"]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="billing-country" className="text-xs">
              Country <span className="text-danger">*</span>
            </Label>
            <Select
              id="billing-country"
              value={billingAddress.country}
              onChange={(val) => onBillingAddressChange({ country: val })}
              options={countryOptions}
              className="h-10 text-sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
