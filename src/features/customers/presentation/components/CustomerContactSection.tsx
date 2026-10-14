"use client";

import { Mail, Phone } from "lucide-react";
import { Input, Label } from "@/shared/components/form";

export type CustomerContactSectionProps = {
  contactPerson: string;
  onContactPersonChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  alternatePhone: string;
  onAlternatePhoneChange: (val: string) => void;
  emailError?: string;
  phoneError?: string;
  alternatePhoneError?: string;
};

export const CustomerContactSection = ({
  contactPerson,
  onContactPersonChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  alternatePhone,
  onAlternatePhoneChange,
  emailError,
  phoneError,
  alternatePhoneError,
}: CustomerContactSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <Phone size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Contact Information
          </h2>
          <p className="text-xs text-text-secondary">
            Add contact details for communication.
          </p>
        </div>
      </div>

      {/* Grid Fields */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Primary Contact Person */}
        <div className="space-y-1.5">
          <Label htmlFor="contact-person" className="text-xs">
            Primary Contact Person
          </Label>
          <Input
            id="contact-person"
            value={contactPerson}
            onChange={(e) => onContactPersonChange(e.target.value)}
            placeholder="Enter contact person name..."
            className="h-10 text-sm"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-email" className="text-xs">
            Email Address
          </Label>
          <Input
            id="customer-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Enter email address..."
            startIcon={<Mail size={16} />}
            aria-invalid={Boolean(emailError)}
            className="h-10 text-sm"
          />
          {emailError && (
            <p className="text-xs text-danger" role="alert">
              {emailError}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-phone" className="text-xs">
            Phone Number
          </Label>
          <Input
            id="customer-phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Enter phone number..."
            startIcon={
              <span className="text-xs font-semibold text-text-muted">+91</span>
            }
            aria-invalid={Boolean(phoneError)}
            className="h-10 text-sm"
          />
          {phoneError && (
            <p className="text-xs text-danger" role="alert">
              {phoneError}
            </p>
          )}
        </div>

        {/* Alternate Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-alternate-phone" className="text-xs">
            Alternate Phone
          </Label>
          <Input
            id="customer-alternate-phone"
            type="tel"
            value={alternatePhone}
            onChange={(e) => onAlternatePhoneChange(e.target.value)}
            placeholder="Enter alternate number..."
            startIcon={
              <span className="text-xs font-semibold text-text-muted">+91</span>
            }
            aria-invalid={Boolean(alternatePhoneError)}
            className="h-10 text-sm"
          />
          {alternatePhoneError && (
            <p className="text-xs text-danger" role="alert">
              {alternatePhoneError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
