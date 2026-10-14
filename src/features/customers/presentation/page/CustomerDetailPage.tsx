"use client";

import Link from "next/link";
import { ArrowLeft, Edit2, FileText, MapPin, Phone, Settings2, Tags, Truck } from "lucide-react";
import type { CustomerDto } from "../../data/dto/customer-dto";
import { formatCurrency, getCustomerInitials } from "../../domain/entities/customer";
import { Avatar } from "@/shared/components/Avatar";

export type CustomerDetailPageProps = {
  customer: CustomerDto;
};

export const CustomerDetailPage = ({ customer }: CustomerDetailPageProps) => {
  const initials = getCustomerInitials(customer.name);
  const isActive = customer.status === "ACTIVE";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Customers</span>
          </Link>
          <div className="flex items-center gap-3 pt-1">
            <Avatar
              label={initials}
              className="h-10 w-10 border border-border/80 bg-surface-alt text-sm font-bold text-primary-light"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  {customer.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isActive
                      ? "bg-success/15 text-success"
                      : "border border-border/80 bg-surface-alt text-text-muted"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-success" : "bg-text-muted"
                    }`}
                    aria-hidden="true"
                  />
                  {isActive ? "Active" : "Inactive"}
                </span>
                <span className="inline-flex items-center rounded-md border border-border/80 bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                  {customer.customerType === "BUSINESS" ? "Business" : "Individual"}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Created {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Edit2 size={16} />
            <span>Edit Customer</span>
          </Link>
        </div>
      </div>

      {/* Grid of Details Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-xl border border-border bg-surface-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
              <Phone size={16} />
            </div>
            <h2 className="text-sm font-semibold text-text-primary">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <p className="text-text-muted">Primary Contact Person</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.contactPerson || "—"}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Email Address</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.email ? (
                  <a href={`mailto:${customer.email}`} className="hover:underline text-primary-light">
                    {customer.email}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Phone Number</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.phone || "—"}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Alternate Phone</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.alternatePhone || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Tax & Compliance */}
        <div className="rounded-xl border border-border bg-surface-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
              <FileText size={16} />
            </div>
            <h2 className="text-sm font-semibold text-text-primary">
              Tax &amp; Compliance
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <p className="text-text-muted">GST Treatment</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.gstTreatment.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <p className="text-text-muted">GSTIN</p>
              <p className="mt-1 font-mono font-medium text-text-primary">
                {customer.gstin || "Unregistered"}
              </p>
            </div>
            <div>
              <p className="text-text-muted">PAN</p>
              <p className="mt-1 font-mono font-medium text-text-primary">
                {customer.pan || "—"}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Place of Supply</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.placeOfSupply}
              </p>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="rounded-xl border border-border bg-surface-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
              <MapPin size={16} />
            </div>
            <h2 className="text-sm font-semibold text-text-primary">
              Billing Address
            </h2>
          </div>

          <div className="text-xs space-y-1 text-text-secondary">
            <p className="font-medium text-text-primary">
              {customer.billingAddress.addressLine1}
            </p>
            {customer.billingAddress.addressLine2 && (
              <p>{customer.billingAddress.addressLine2}</p>
            )}
            <p>
              {customer.billingAddress.city}, {customer.billingAddress.state}{" "}
              {customer.billingAddress.pinCode}
            </p>
            <p>{customer.billingAddress.country}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="rounded-xl border border-border bg-surface-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
              <Truck size={16} />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-primary">
                Shipping Address
              </h2>
              {customer.sameAsBillingAddress && (
                <span className="text-[10px] text-text-muted">(Same as billing)</span>
              )}
            </div>
          </div>

          <div className="text-xs space-y-1 text-text-secondary">
            <p className="font-medium text-text-primary">
              {customer.shippingAddress.addressLine1}
            </p>
            {customer.shippingAddress.addressLine2 && (
              <p>{customer.shippingAddress.addressLine2}</p>
            )}
            <p>
              {customer.shippingAddress.city}, {customer.shippingAddress.state}{" "}
              {customer.shippingAddress.pinCode}
            </p>
            <p>{customer.shippingAddress.country}</p>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="rounded-xl border border-border bg-surface-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
              <Settings2 size={16} />
            </div>
            <h2 className="text-sm font-semibold text-text-primary">
              Additional Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
            <div>
              <p className="text-text-muted">Payment Terms</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.paymentTerms}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Credit Limit</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.creditLimit != null
                  ? formatCurrency(customer.creditLimit, customer.currency)
                  : "No limit"}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Default Discount</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.defaultDiscount ?? 0}%
              </p>
            </div>
            <div>
              <p className="text-text-muted">Tax Preference</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.defaultTaxPreference}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Price List</p>
              <p className="mt-1 font-medium text-text-primary">
                {customer.priceList}
              </p>
            </div>
          </div>
        </div>

        {/* Notes & Tags */}
        <div className="rounded-xl border border-border bg-surface-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
              <Tags size={16} />
            </div>
            <h2 className="text-sm font-semibold text-text-primary">
              Notes &amp; Tags
            </h2>
          </div>

          <div className="text-xs space-y-3">
            <div>
              <p className="text-text-muted">Internal Notes</p>
              <p className="mt-1 text-text-primary whitespace-pre-wrap">
                {customer.internalNotes || "No notes added."}
              </p>
            </div>

            {customer.tags.length > 0 && (
              <div>
                <p className="text-text-muted mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md border border-border/80 bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
