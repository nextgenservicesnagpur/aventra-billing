"use client";

import { MapPin, Truck } from "lucide-react";
import { Checkbox, Input, Label, Select } from "@/shared/components/form";
import type { CustomerAddress } from "../../domain/customer";

export type CustomerAddressSectionProps = {
  billingAddress: CustomerAddress;
  onBillingAddressChange: (updates: Partial<CustomerAddress>) => void;
  shippingAddress: CustomerAddress;
  onShippingAddressChange: (updates: Partial<CustomerAddress>) => void;
  sameAsBillingAddress: boolean;
  onSameAsBillingAddressChange: (checked: boolean) => void;
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

export const CustomerAddressSection = ({
  billingAddress,
  onBillingAddressChange,
  shippingAddress,
  onShippingAddressChange,
  sameAsBillingAddress,
  onSameAsBillingAddressChange,
}: CustomerAddressSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Billing Address Card */}
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
          {/* Address Line 1 & Line 2 */}
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
                className="h-10 text-sm"
              />
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

          {/* City, State, PIN, Country */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="billing-city" className="text-xs">
                City <span className="text-danger">*</span>
              </Label>
              <Input
                id="billing-city"
                value={billingAddress.city}
                onChange={(e) =>
                  onBillingAddressChange({ city: e.target.value })
                }
                placeholder="Enter city..."
                className="h-10 text-sm"
              />
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
                placeholder="Select state..."
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billing-pin" className="text-xs">
                PIN Code <span className="text-danger">*</span>
              </Label>
              <Input
                id="billing-pin"
                value={billingAddress.pinCode}
                onChange={(e) =>
                  onBillingAddressChange({ pinCode: e.target.value })
                }
                placeholder="Enter PIN code..."
                className="h-10 text-sm"
              />
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

      {/* Shipping Address Card */}
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

          {/* Same as billing address checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              id="same-as-billing"
              checked={sameAsBillingAddress}
              onChange={(e) => onSameAsBillingAddressChange(e.target.checked)}
            />
            <span className="text-xs font-medium text-text-primary">
              Same as billing address
            </span>
          </label>
        </div>

        {/* If separate shipping address is required */}
        {!sameAsBillingAddress && (
          <div className="mt-5 space-y-4">
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
                  placeholder="Enter address line 1..."
                  className="h-10 text-sm"
                />
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
                  placeholder="Enter address line 2..."
                  className="h-10 text-sm"
                />
              </div>
            </div>

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
                  className="h-10 text-sm"
                />
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
                  placeholder="Select state..."
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shipping-pin" className="text-xs">
                  PIN Code <span className="text-danger">*</span>
                </Label>
                <Input
                  id="shipping-pin"
                  value={shippingAddress.pinCode}
                  onChange={(e) =>
                    onShippingAddressChange({ pinCode: e.target.value })
                  }
                  placeholder="Enter PIN code..."
                  className="h-10 text-sm"
                />
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
    </div>
  );
};
