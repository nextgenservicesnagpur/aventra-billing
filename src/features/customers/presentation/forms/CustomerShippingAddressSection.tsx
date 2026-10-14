"use client";

import { Truck } from "lucide-react";
import { Checkbox, Input, Label, Select } from "@/shared/components/form";
import type { CustomerAddress } from "../../domain/entities/customer";

export type CustomerShippingAddressSectionProps = {
  shippingAddress: CustomerAddress;
  onShippingAddressChange: (updates: Partial<CustomerAddress>) => void;
  sameAsBillingAddress: boolean;
  onSameAsBillingAddressChange: (checked: boolean) => void;
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

export const CustomerShippingAddressSection = ({
  shippingAddress,
  onShippingAddressChange,
  sameAsBillingAddress,
  onSameAsBillingAddressChange,
  errors = {},
}: CustomerShippingAddressSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
            <Truck size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Shipping Address
            </h2>
            <p className="text-xs text-text-secondary">
              Enter the customer&apos;s shipping address.
            </p>
          </div>
        </div>

        <label
          htmlFor="same-as-billing"
          className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary"
        >
          <Checkbox
            id="same-as-billing"
            checked={sameAsBillingAddress}
            onChange={(e) => onSameAsBillingAddressChange(e.target.checked)}
          />
          <span>Same as billing address</span>
        </label>
      </div>

      {!sameAsBillingAddress && (
        <div className="mt-5 space-y-4">
          {/* Line 1 & Line 2 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shipping-line1" className="text-xs">
                Address Line 1 <span className="text-danger">*</span>
              </Label>
              <Input
                id="shipping-line1"
                value={shippingAddress.addressLine1}
                onChange={(e) =>
                  onShippingAddressChange({ addressLine1: e.target.value })
                }
                placeholder="Enter shipping address line 1..."
                aria-invalid={Boolean(errors["shippingAddress.addressLine1"])}
                className="h-10 text-sm"
              />
              {errors["shippingAddress.addressLine1"] && (
                <p className="text-xs text-danger" role="alert">
                  {errors["shippingAddress.addressLine1"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shipping-line2" className="text-xs">
                Address Line 2
              </Label>
              <Input
                id="shipping-line2"
                value={shippingAddress.addressLine2 || ""}
                onChange={(e) =>
                  onShippingAddressChange({ addressLine2: e.target.value })
                }
                placeholder="Enter shipping address line 2..."
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* City, State, PIN Code, Country */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="shipping-city" className="text-xs">
                City <span className="text-danger">*</span>
              </Label>
              <Input
                id="shipping-city"
                value={shippingAddress.city}
                onChange={(e) =>
                  onShippingAddressChange({ city: e.target.value })
                }
                placeholder="Enter city..."
                aria-invalid={Boolean(errors["shippingAddress.city"])}
                className="h-10 text-sm"
              />
              {errors["shippingAddress.city"] && (
                <p className="text-xs text-danger" role="alert">
                  {errors["shippingAddress.city"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shipping-state" className="text-xs">
                State <span className="text-danger">*</span>
              </Label>
              <Select
                id="shipping-state"
                value={shippingAddress.state}
                onChange={(val) => onShippingAddressChange({ state: val })}
                options={indianStates}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shipping-pincode" className="text-xs">
                PIN Code <span className="text-danger">*</span>
              </Label>
              <Input
                id="shipping-pincode"
                value={shippingAddress.pinCode}
                onChange={(e) =>
                  onShippingAddressChange({ pinCode: e.target.value })
                }
                placeholder="Enter PIN code..."
                aria-invalid={Boolean(errors["shippingAddress.pinCode"])}
                className="h-10 text-sm"
              />
              {errors["shippingAddress.pinCode"] && (
                <p className="text-xs text-danger" role="alert">
                  {errors["shippingAddress.pinCode"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shipping-country" className="text-xs">
                Country <span className="text-danger">*</span>
              </Label>
              <Select
                id="shipping-country"
                value={shippingAddress.country}
                onChange={(val) => onShippingAddressChange({ country: val })}
                options={countryOptions}
                className="h-10 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
