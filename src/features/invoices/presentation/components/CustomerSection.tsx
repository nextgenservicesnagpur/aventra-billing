import Link from "next/link";
import {
  Building2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { DatePicker, Input, Label, Select } from "@/shared/components/form";

export type SampleCustomer = {
  id?: string;
  name: string;
  email: string;
  address: string;
  gstin: string;
  phone?: string;
  contactPerson?: string;
  pan?: string;
  state?: string;
  placeOfSupply?: string;
  gstTreatment?: string;
  paymentTerms?: string;
};

export type CustomerSectionProps = {
  selectedCustomer?: string;
  onSelectCustomer?: (customer: SampleCustomer | null) => void;
  customers?: SampleCustomer[];
  error?: string;
  invoiceNumber?: string;
  onInvoiceNumberChange?: (val: string) => void;
  issueDate?: string;
  onIssueDateChange?: (val: string) => void;
  dueDate?: string;
  onDueDateChange?: (val: string) => void;
  paymentTerms?: string;
  onPaymentTermsChange?: (val: string) => void;
  errors?: Record<string, string>;
};

export const CustomerSection = ({
  selectedCustomer = "",
  onSelectCustomer = () => {},
  customers = [],
  error,
  invoiceNumber = "",
  onInvoiceNumberChange = () => {},
  issueDate = "",
  onIssueDateChange = () => {},
  dueDate = "",
  onDueDateChange = () => {},
  paymentTerms = "Net 15 days",
  onPaymentTermsChange = () => {},
  errors = {},
}: CustomerSectionProps) => {
  const current = customers.find((c) => c.name === selectedCustomer);
  const customerError = error || errors.customer || errors.customerName;

  const handleCustomerSelect = (val: string) => {
    const match = customers.find((c) => c.name === val) || null;
    onSelectCustomer(match);
  };

  const phone = current?.phone || "—";
  const contactPerson = current?.contactPerson || "—";
  const pan = current?.pan || "—";
  const state = current?.placeOfSupply || current?.state || "—";

  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6 transition-colors space-y-6">
      {/* 1. Section Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
          aria-hidden="true"
        >
          <FileText size={19} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight text-text-primary">
            Invoice Details
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">
            Select a customer for this invoice.
          </p>
        </div>
      </div>

      {/* 2. Customer Section: Selector + Comprehensive Details Card Below */}
      <div className="space-y-4">
        {/* Customer Select Dropdown */}
        <div className="w-full max-w-2xl">
          <div className="mb-1.5 flex items-center justify-between">
            <Label
              htmlFor="invoice-customer-select"
              className="block text-xs font-medium text-text-secondary"
            >
              Customer <span className="text-danger">*</span>
            </Label>
            <Link
              href="/customers/new"
              className="text-[11px] font-medium text-primary-light transition-colors hover:underline"
            >
              + Add Customer
            </Link>
          </div>

          {customers.length === 0 ? (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-surface-alt/40 p-3 text-xs text-text-secondary">
              <span>No customer records found in this organization.</span>
              <Link
                href="/customers/new"
                className="font-medium text-primary-light hover:underline"
              >
                Create Customer
              </Link>
            </div>
          ) : (
            <Select
              id="invoice-customer-select"
              value={selectedCustomer}
              onChange={handleCustomerSelect}
              placeholder="Search and select a customer..."
              aria-invalid={Boolean(customerError)}
              aria-describedby={customerError ? "customer-error" : undefined}
              startIcon={<Search size={16} className="text-text-muted" />}
              className="h-11"
            >
              <option value="">Search and select a customer...</option>
              {customers.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name} {c.gstin ? `(${c.gstin})` : c.email ? `(${c.email})` : ""}
                </option>
              ))}
            </Select>
          )}

          {customerError && (
            <span id="customer-error" className="mt-1.5 block text-xs text-danger" role="alert">
              {customerError}
            </span>
          )}
        </div>

        {/* Selected Customer Detailed Profile Card */}
        {current ? (
          <div className="rounded-xl border border-border bg-surface-alt/50 p-4 sm:p-5 transition-colors">
            {/* Header: Business Name & Tax Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-surface text-primary-light">
                  <Building2 size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                    {current.name}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {contactPerson !== "—" ? `${contactPerson} • ` : ""}Customer Profile
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface px-2.5 py-1 text-xs text-text-secondary">
                  <span className="text-[11px] font-medium text-text-muted">GSTIN:</span>
                  <span className="font-mono text-xs font-semibold text-primary-light">
                    {current.gstin || "Unregistered"}
                  </span>
                </div>
                {pan !== "—" && (
                  <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface px-2.5 py-1 text-xs text-text-secondary">
                    <span className="text-[11px] font-medium text-text-muted">PAN:</span>
                    <span className="font-mono text-xs font-semibold text-text-primary">{pan}</span>
                  </div>
                )}
                {current.paymentTerms && (
                  <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface px-2.5 py-1 text-xs text-text-secondary">
                    <span className="text-[11px] font-medium text-text-muted">Terms:</span>
                    <span className="text-xs font-semibold text-text-primary">{current.paymentTerms}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Balanced Information Blocks */}
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              {/* 1. Email */}
              <div className="rounded-lg border border-border/50 bg-surface/60 p-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted mb-1">
                  <Mail size={12} className="text-primary-light" />
                  Billing Email
                </span>
                <span className="font-medium text-text-primary truncate block" title={current.email || "No email"}>
                  {current.email || "—"}
                </span>
              </div>

              {/* 2. Phone */}
              <div className="rounded-lg border border-border/50 bg-surface/60 p-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted mb-1">
                  <Phone size={12} className="text-primary-light" />
                  Contact Phone
                </span>
                <span className="font-medium text-text-primary tabular-nums block">
                  {phone}
                </span>
              </div>

              {/* 3. Place of Supply */}
              <div className={`rounded-lg border p-2.5 ${errors.placeOfSupply ? "border-danger bg-danger/10" : "border-border/50 bg-surface/60"}`}>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted mb-1">
                  <Globe size={12} className="text-primary-light" />
                  Place of Supply
                </span>
                <span className="font-medium text-text-primary truncate block" title={state}>
                  {state}
                </span>
                {errors.placeOfSupply && (
                  <span className="mt-1 block text-[10px] text-danger" role="alert">
                    {errors.placeOfSupply}
                  </span>
                )}
              </div>

              {/* 4. Billing Address */}
              <div className="rounded-lg border border-border/50 bg-surface/60 p-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted mb-1">
                  <MapPin size={12} className="text-primary-light" />
                  Billing Address
                </span>
                <span className="font-medium text-text-secondary truncate block" title={current.address || "No address"}>
                  {current.address || "—"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-border/80 bg-surface-alt/30 p-5 transition-colors">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface-alt/80 text-primary-light/80">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Customer Details</p>
              <p className="mt-0.5 text-xs text-text-muted">
                Select a customer to view their information.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Invoice Parameters Row: 4 Symmetrically Aligned Columns */}
      <div className="pt-5 border-t border-border/60">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Invoice Number */}
          <div>
            <Label
              htmlFor="invoice-number-input"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Invoice Number <span className="text-danger">*</span>
            </Label>
            <Input
              id="invoice-number-input"
              type="text"
              value={invoiceNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onInvoiceNumberChange(e.target.value)}
              placeholder="e.g. INV-2025-0025"
              aria-invalid={Boolean(errors.number)}
              aria-describedby={errors.number ? "number-error" : undefined}
              className="h-10 px-3.5 text-sm"
            />
            {errors.number && (
              <span id="number-error" className="mt-1 block text-xs text-danger" role="alert">
                {errors.number}
              </span>
            )}
          </div>

          {/* Issue Date */}
          <div>
            <Label
              htmlFor="invoice-issue-date"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Issue Date <span className="text-danger">*</span>
            </Label>
            <DatePicker
              id="invoice-issue-date"
              value={issueDate}
              onChange={onIssueDateChange}
              aria-invalid={Boolean(errors.issueDate)}
              aria-describedby={errors.issueDate ? "issueDate-error" : undefined}
            />
            {errors.issueDate && (
              <span id="issueDate-error" className="mt-1 block text-xs text-danger" role="alert">
                {errors.issueDate}
              </span>
            )}
          </div>

          {/* Due Date */}
          <div>
            <Label
              htmlFor="invoice-due-date"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Due Date <span className="text-danger">*</span>
            </Label>
            <DatePicker
              id="invoice-due-date"
              value={dueDate}
              minDate={issueDate}
              onChange={onDueDateChange}
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
            />
            {errors.dueDate && (
              <span id="dueDate-error" className="mt-1 block text-xs text-danger" role="alert">
                {errors.dueDate}
              </span>
            )}
          </div>

          {/* Payment Terms */}
          <div>
            <Label
              htmlFor="invoice-payment-terms"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Payment Terms
            </Label>
            <Select
              id="invoice-payment-terms"
              value={paymentTerms}
              onChange={onPaymentTermsChange}
              className="h-10"
            >
              <option value="Net 15 days">Net 15 days</option>
              <option value="Net 30 days">Net 30 days</option>
              <option value="Net 45 days">Net 45 days</option>
              <option value="Net 60 days">Net 60 days</option>
              <option value="Due on receipt">Due on receipt</option>
              <option value="Due on Receipt">Due on Receipt</option>
              {paymentTerms &&
                !["Net 15 days", "Net 30 days", "Net 45 days", "Net 60 days", "Due on receipt", "Due on Receipt"].includes(
                  paymentTerms,
                ) && <option value={paymentTerms}>{paymentTerms}</option>}
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
};

export const InvoiceDetailsSection = CustomerSection;
