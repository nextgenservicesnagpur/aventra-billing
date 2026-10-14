"use client";

import { Building2, User, UserRound } from "lucide-react";
import { Input, Label, Select } from "@/shared/components/form";
import type { CustomerType, GstTreatment, CustomerStatus } from "../../domain/entities/customer";

export type CustomerBasicInformationSectionProps = {
  name: string;
  onNameChange: (val: string) => void;
  customerType: CustomerType;
  onCustomerTypeChange: (val: CustomerType) => void;
  gstTreatment: GstTreatment;
  onGstTreatmentChange: (val: GstTreatment) => void;
  status: CustomerStatus;
  onStatusChange: (val: CustomerStatus) => void;
  error?: string;
};

const customerTypeOptions = [
  { value: "BUSINESS", label: "Business" },
  { value: "INDIVIDUAL", label: "Individual" },
];

const gstTreatmentOptions = [
  { value: "REGISTERED_BUSINESS_REGULAR", label: "Registered Business (Regular)" },
  { value: "CONSUMER_UNREGISTERED", label: "Consumer / Unregistered" },
  { value: "OVERSEAS_EXPORT", label: "Overseas / Export" },
  { value: "SPECIAL_ECONOMIC_ZONE", label: "Special Economic Zone (SEZ)" },
  { value: "DEEMED_EXPORT", label: "Deemed Export" },
  { value: "COMPOSITION_SCHEME", label: "Composition Scheme" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const CustomerBasicInformationSection = ({
  name,
  onNameChange,
  customerType,
  onCustomerTypeChange,
  gstTreatment,
  onGstTreatmentChange,
  status,
  onStatusChange,
  error,
}: CustomerBasicInformationSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <UserRound size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Basic Information
          </h2>
          <p className="text-xs text-text-secondary">
            Enter the customer&apos;s basic details.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Customer Name */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-name" className="text-xs">
            Customer Name <span className="text-danger">*</span>
          </Label>
          <Input
            id="customer-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter customer name..."
            aria-invalid={Boolean(error)}
            className="h-10 text-sm"
          />
          {error && (
            <p className="text-xs text-danger" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Customer Type */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-type" className="text-xs">
            Customer Type <span className="text-danger">*</span>
          </Label>
          <Select
            id="customer-type"
            value={customerType}
            onChange={(val) => onCustomerTypeChange(val as CustomerType)}
            options={customerTypeOptions}
            startIcon={
              customerType === "BUSINESS" ? (
                <Building2 size={16} />
              ) : (
                <User size={16} />
              )
            }
            className="h-10 text-sm"
          />
        </div>

        {/* GST Treatment */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-gst-treatment" className="text-xs">
            GST Treatment <span className="text-danger">*</span>
          </Label>
          <Select
            id="customer-gst-treatment"
            value={gstTreatment}
            onChange={(val) => onGstTreatmentChange(val as GstTreatment)}
            options={gstTreatmentOptions}
            className="h-10 text-sm"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-status" className="text-xs">
            Status <span className="text-danger">*</span>
          </Label>
          <Select
            id="customer-status"
            value={status}
            onChange={(val) => onStatusChange(val as CustomerStatus)}
            options={statusOptions}
            startIcon={
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "ACTIVE" ? "bg-success" : "bg-text-muted"
                }`}
              />
            }
            className="h-10 text-sm"
          />
        </div>
      </div>
    </section>
  );
};
