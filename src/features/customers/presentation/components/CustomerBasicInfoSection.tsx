"use client";

import { Building2, User, UserRound } from "lucide-react";
import { Input, Label, Select } from "@/shared/components/form";
import type { CustomerType, GstTreatment, CustomerStatus } from "../../domain/customer";

export type CustomerBasicInfoSectionProps = {
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
  { value: "Business", label: "Business" },
  { value: "Individual", label: "Individual" },
];

const gstTreatmentOptions = [
  { value: "Registered Business (Regular)", label: "Registered Business (Regular)" },
  { value: "Consumer / Unregistered", label: "Consumer / Unregistered" },
  { value: "Overseas / Export", label: "Overseas / Export" },
  { value: "Special Economic Zone (SEZ)", label: "Special Economic Zone (SEZ)" },
  { value: "Deemed Export", label: "Deemed Export" },
  { value: "Composition Scheme", label: "Composition Scheme" },
];

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const CustomerBasicInfoSection = ({
  name,
  onNameChange,
  customerType,
  onCustomerTypeChange,
  gstTreatment,
  onGstTreatmentChange,
  status,
  onStatusChange,
  error,
}: CustomerBasicInfoSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      {/* Section Header */}
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

      {/* Grid Fields */}
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
              customerType === "Business" ? (
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
                  status === "Active" ? "bg-success" : "bg-text-muted"
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
