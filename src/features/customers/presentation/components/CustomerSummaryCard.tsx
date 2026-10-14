"use client";

import {
  Building2,
  CreditCard,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import {
  formatCustomerAddress,
  getCustomerInitials,
  type CustomerAddress,
  type CustomerStatus,
  type CustomerType,
} from "../../domain/customer";

export type CustomerSummaryCardProps = {
  name: string;
  customerType: CustomerType;
  status: CustomerStatus;
  email?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  billingAddress?: Partial<CustomerAddress>;
};

export const CustomerSummaryCard = ({
  name,
  customerType,
  status,
  email,
  phone,
  gstin,
  pan,
  billingAddress,
}: CustomerSummaryCardProps) => {
  const displayName = name.trim() || "New Customer";
  const initials = getCustomerInitials(displayName);
  const formattedAddress = formatCustomerAddress(billingAddress);
  const country = billingAddress?.country || "India";
  const isActive = status === "Active";

  return (
    <div className="rounded-xl border border-border bg-surface-card p-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <FileText size={16} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Customer Summary
          </h2>
          <p className="text-[11px] text-text-muted">
            Quick overview of the customer information.
          </p>
        </div>
      </div>

      {/* Customer Hero block */}
      <div className="mt-4 flex items-start gap-3.5">
        <Avatar
          label={initials}
          className="h-12 w-12 rounded-xl border border-border bg-surface-alt text-sm font-bold text-primary-light shadow-xs"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-base font-bold text-text-primary">
            {displayName}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isActive
                  ? "bg-success/15 text-success"
                  : "bg-surface-alt text-text-muted border border-border/60"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-success" : "bg-text-muted"
                }`}
                aria-hidden="true"
              />
              {status}
            </span>
            <span className="inline-flex items-center rounded-full border border-border/80 bg-surface-alt px-2 py-0.5 text-[11px] font-medium text-text-secondary">
              {customerType}
            </span>
          </div>
        </div>
      </div>

      {/* Key Details Rows */}
      <div className="mt-5 space-y-2.5 border-t border-border/60 pt-4 text-xs text-text-secondary">
        {/* Email */}
        <div className="flex items-center gap-2.5">
          <Mail size={14} className="shrink-0 text-text-muted" />
          <span className="truncate">
            {email?.trim() || <span className="text-text-muted">No email entered</span>}
          </span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2.5">
          <Phone size={14} className="shrink-0 text-text-muted" />
          <span className="truncate">
            {phone?.trim() || <span className="text-text-muted">No phone entered</span>}
          </span>
        </div>

        {/* GSTIN */}
        <div className="flex items-center gap-2.5">
          <Building2 size={14} className="shrink-0 text-text-muted" />
          <span className="truncate font-mono">
            {gstin?.trim() ? `GSTIN: ${gstin.trim()}` : <span className="text-text-muted font-sans">GSTIN: Not provided</span>}
          </span>
        </div>

        {/* PAN */}
        <div className="flex items-center gap-2.5">
          <CreditCard size={14} className="shrink-0 text-text-muted" />
          <span className="truncate font-mono">
            {pan?.trim() ? `PAN: ${pan.trim()}` : <span className="text-text-muted font-sans">PAN: Not provided</span>}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2.5">
          <MapPin size={14} className="mt-0.5 shrink-0 text-text-muted" />
          <span className="line-clamp-2 text-text-secondary">
            {formattedAddress || <span className="text-text-muted">No address specified</span>}
          </span>
        </div>

        {/* Country */}
        <div className="flex items-center gap-2.5">
          <Globe size={14} className="shrink-0 text-text-muted" />
          <span className="truncate">{country}</span>
        </div>
      </div>
    </div>
  );
};
