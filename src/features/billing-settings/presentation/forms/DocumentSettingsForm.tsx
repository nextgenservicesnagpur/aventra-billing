"use client";

import { useState, useTransition } from "react";
import { Check, CheckCircle2, FileText, Hash, Info, Loader2, RotateCcw, X } from "lucide-react";
import { Input, Label, Textarea, Select, Button } from "@/shared/components/form";
import type { BillingDocumentType } from "../../domain/entities/billing-settings";
import type { BillingSettingsDto, UpdateBillingSettingsInput } from "../../data/dto/billing-settings-dto";
import { updateBillingSettingsAction } from "../../data/mutations/billing-settings-mutations";
import { DocumentNumberPreviewCard } from "../components/DocumentNumberPreviewCard";
import { DEFAULT_DOCUMENT_CONFIGS } from "../../domain/rules/billing-settings-rules";

export type DocumentSettingsFormProps = {
  documentType: BillingDocumentType;
  initialSettings: BillingSettingsDto;
};

const paddingOptions = [
  { value: "3", label: "3 digits (e.g. 001)" },
  { value: "4", label: "4 digits (e.g. 0001 - Standard)" },
  { value: "5", label: "5 digits (e.g. 00001)" },
  { value: "6", label: "6 digits (e.g. 000001)" },
  { value: "8", label: "8 digits (e.g. 00000001)" },
];

export const DocumentSettingsForm = ({
  documentType,
  initialSettings,
}: DocumentSettingsFormProps) => {
  const config = DEFAULT_DOCUMENT_CONFIGS[documentType];
  const [isPending, startTransition] = useTransition();

  // Form states
  const [prefix, setPrefix] = useState(initialSettings.prefix);
  const [suffix, setSuffix] = useState(initialSettings.suffix || "");
  const [nextNumber, setNextNumber] = useState<string>(String(initialSettings.nextNumber));
  const [padding, setPadding] = useState<string>(String(initialSettings.padding));
  const [defaultNotes, setDefaultNotes] = useState(initialSettings.defaultNotes || "");
  const [defaultTerms, setDefaultTerms] = useState(initialSettings.defaultTerms || "");

  // Feedback states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isInvoice = documentType === "INVOICE";
  const numVal = parseInt(nextNumber, 10);
  const paddingVal = parseInt(padding, 10) || 4;

  const handleResetToDefaults = () => {
    if (window.confirm(`Reset ${config.label} settings to recommended default values?`)) {
      setPrefix(config.prefix);
      setSuffix(config.suffix || "");
      setNextNumber(String(config.nextNumber));
      setPadding(String(config.padding));
      setDefaultNotes(config.defaultNotes || "");
      setDefaultTerms(config.defaultTerms || "");
      setFieldErrors({});
      setFormError(null);
      setSuccessMessage(null);
    }
  };

  const handleCancel = () => {
    setPrefix(initialSettings.prefix);
    setSuffix(initialSettings.suffix || "");
    setNextNumber(String(initialSettings.nextNumber));
    setPadding(String(initialSettings.padding));
    setDefaultNotes(initialSettings.defaultNotes || "");
    setDefaultTerms(initialSettings.defaultTerms || "");
    setFieldErrors({});
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setFormError(null);
    setFieldErrors({});

    const numericNextNumber = parseInt(nextNumber, 10);
    if (isNaN(numericNextNumber) || numericNextNumber < 1) {
      setFieldErrors({ nextNumber: "Starting number must be a positive integer greater than or equal to 1." });
      return;
    }

    const nextNumberChanged = numericNextNumber !== initialSettings.nextNumber;

    const payload: UpdateBillingSettingsInput = {
      documentType,
      prefix: prefix.trim(),
      suffix: suffix.trim() || null,
      ...(nextNumberChanged ? { nextNumber: numericNextNumber } : {}),
      padding: paddingVal,
      defaultNotes: defaultNotes.trim() || null,
      defaultTerms: defaultTerms.trim() || null,
    };

    startTransition(async () => {
      const result = await updateBillingSettingsAction(payload);
      if (!result.success) {
        setFormError(result.error || "Failed to save settings.");
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }
      setSuccessMessage(`${config.label} settings saved successfully.`);
      if (result.data) {
        setNextNumber(String(result.data.nextNumber));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Success Notification */}
      {successMessage && (
        <div
          className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success flex items-center justify-between"
          role="status"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-success hover:opacity-80"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {formError && (
        <div
          className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger flex items-center justify-between"
          role="alert"
        >
          <span>{formError}</span>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="text-danger hover:opacity-80"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Integration Context Banner */}
      <div className="rounded-xl border border-border/80 bg-surface-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-primary-light mt-0.5">
            <Info size={15} />
          </div>
          <div className="text-xs sm:text-sm">
            <h3 className="font-semibold text-text-primary">
              {config.label} Configuration
            </h3>
            <p className="mt-0.5 text-text-secondary leading-relaxed">
              {isInvoice
                ? "Active in Create Invoice. Configured default notes, terms, and numbering rules are prefilled during new invoice creation."
                : `Settings for ${config.label} are saved and ready. Document creation workflows for ${config.label}s will consume these persisted defaults when that workflow is active.`}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Numbering Settings Section */}
      <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
            <Hash size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Document Numbering
            </h2>
            <p className="text-xs text-text-secondary">
              Configure prefixes, sequence numbers, and digit padding for {config.label.toLowerCase()}s.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Controls Column */}
          <div className="space-y-4">
            {/* Prefix */}
            <div className="space-y-1.5">
              <Label htmlFor={`${documentType}-prefix`} className="text-xs">
                Number Prefix <span className="text-danger">*</span>
              </Label>
              <Input
                id={`${documentType}-prefix`}
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder={config.prefix}
                aria-invalid={Boolean(fieldErrors.prefix)}
                className="h-10 text-sm font-mono"
              />
              <p className="text-xs text-text-muted">
                Letters, numbers, hyphens, or slashes (e.g., {config.prefix}).
              </p>
              {fieldErrors.prefix && (
                <p className="text-xs text-danger" role="alert">
                  {fieldErrors.prefix}
                </p>
              )}
            </div>

            {/* Next / Starting Number */}
            <div className="space-y-1.5">
              <Label htmlFor={`${documentType}-next-number`} className="text-xs">
                Next Sequence Number <span className="text-danger">*</span>
              </Label>
              <Input
                id={`${documentType}-next-number`}
                type="number"
                min="1"
                step="1"
                value={nextNumber}
                onChange={(e) => setNextNumber(e.target.value)}
                placeholder="1"
                aria-invalid={Boolean(fieldErrors.nextNumber)}
                className="h-10 text-sm font-mono"
              />
              <p className="text-xs text-text-muted">
                The numeric counter used for the next issued document.
              </p>
              {fieldErrors.nextNumber && (
                <p className="text-xs text-danger" role="alert">
                  {fieldErrors.nextNumber}
                </p>
              )}
            </div>

            {/* Minimum Digits / Padding */}
            <div className="space-y-1.5">
              <Label htmlFor={`${documentType}-padding`} className="text-xs">
                Minimum Digits (Zero Padding) <span className="text-danger">*</span>
              </Label>
              <Select
                id={`${documentType}-padding`}
                value={padding}
                onChange={(val) => setPadding(val)}
                options={paddingOptions}
                className="h-10 text-sm"
              />
              <p className="text-xs text-text-muted">
                Pads sequence numbers with leading zeros (e.g., 4 digits transforms 1 to 0001).
              </p>
              {fieldErrors.padding && (
                <p className="text-xs text-danger" role="alert">
                  {fieldErrors.padding}
                </p>
              )}
            </div>

            {/* Optional Suffix */}
            <div className="space-y-1.5">
              <Label htmlFor={`${documentType}-suffix`} className="text-xs">
                Optional Suffix
              </Label>
              <Input
                id={`${documentType}-suffix`}
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="e.g., /2026-27"
                aria-invalid={Boolean(fieldErrors.suffix)}
                className="h-10 text-sm font-mono"
              />
              <p className="text-xs text-text-muted">
                Appended to the end of the number (e.g., /FY26).
              </p>
              {fieldErrors.suffix && (
                <p className="text-xs text-danger" role="alert">
                  {fieldErrors.suffix}
                </p>
              )}
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="flex flex-col justify-start">
            <DocumentNumberPreviewCard
              prefix={prefix}
              nextNumber={isNaN(numVal) ? 1 : numVal}
              padding={paddingVal}
              suffix={suffix}
              documentLabel={config.label}
            />
          </div>
        </div>
      </section>

      {/* 2. Default Notes & Terms Section */}
      <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Default Notes &amp; Terms
            </h2>
            <p className="text-xs text-text-secondary">
              Set standard customer-facing notes and legal terms automatically prefilled on new {config.label.toLowerCase()}s.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Default Notes */}
          <div className="space-y-1.5">
            <Label htmlFor={`${documentType}-notes`} className="text-xs">
              Default Notes
            </Label>
            <Textarea
              id={`${documentType}-notes`}
              value={defaultNotes}
              onChange={(e) => setDefaultNotes(e.target.value)}
              placeholder="Enter default notes to the customer..."
              rows={5}
              className="text-sm resize-none"
            />
            <p className="text-xs text-text-muted">
              These notes are prefilled when creating a new {config.label.toLowerCase()}. You can edit them for individual documents.
            </p>
            {fieldErrors.defaultNotes && (
              <p className="text-xs text-danger" role="alert">
                {fieldErrors.defaultNotes}
              </p>
            )}
          </div>

          {/* Default Terms & Conditions */}
          <div className="space-y-1.5">
            <Label htmlFor={`${documentType}-terms`} className="text-xs">
              Default Terms &amp; Conditions
            </Label>
            <Textarea
              id={`${documentType}-terms`}
              value={defaultTerms}
              onChange={(e) => setDefaultTerms(e.target.value)}
              placeholder="Enter standard payment terms, late fees, or return policies..."
              rows={5}
              className="text-sm resize-none"
            />
            <p className="text-xs text-text-muted">
              These terms are prefilled on new {config.label.toLowerCase()}s and can be customized for individual documents.
            </p>
            {fieldErrors.defaultTerms && (
              <p className="text-xs text-danger" role="alert">
                {fieldErrors.defaultTerms}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between border-t border-border/80">
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="inline-flex h-9 items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Reset to Defaults</span>
        </button>

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary disabled:opacity-50"
          >
            Cancel
          </button>

          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="h-10 px-5 text-sm shadow-xs"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save {config.label} Settings</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
