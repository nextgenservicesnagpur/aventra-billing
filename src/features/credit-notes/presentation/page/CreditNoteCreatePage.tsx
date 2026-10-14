"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Eye, FileText, Info, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  calculateCreditNoteTotals,
  formatCreditNoteCurrency,
  CREDIT_NOTE_REASONS,
  type CreditNote,
  type CreditNoteLineItem,
} from "../../domain/credit-note";
import {
  createCreditNoteAction,
  updateCreditNoteAction,
} from "../../data/mutations/credit-note-mutations";
import type { EligibleInvoiceSummaryDto } from "../../data/dto/credit-note-dto";
import { CreditNoteItemsSection } from "../components/CreditNoteItemsSection";
import { CreditNoteDocument } from "../components/CreditNoteDocument";
import { Input, Label, Select, Textarea } from "@/shared/components/form";

const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export type CreditNoteCreatePageProps = {
  eligibleInvoices?: EligibleInvoiceSummaryDto[];
  preselectedInvoiceId?: string;
  initialInvoiceId?: string;
  previewCreditNoteNumber?: string;
  initialDefaultNotes?: string;
  initialDefaultTerms?: string;
  supplierName?: string;
  existingCreditNote?: CreditNote;
};

export const CreditNoteCreatePage = ({
  eligibleInvoices = [],
  preselectedInvoiceId,
  initialInvoiceId: initialInvoiceIdProp,
  previewCreditNoteNumber = "CN-0001",
  initialDefaultNotes = "",
  initialDefaultTerms = "",
  supplierName,
  existingCreditNote,
}: CreditNoteCreatePageProps) => {
  const router = useRouter();

  const candidateId = preselectedInvoiceId || initialInvoiceIdProp;
  // Issue 1 Fix: Only preselect if editing existing note or when trusted preselectedInvoiceId is present and in eligible list
  const initialInvoiceId =
    existingCreditNote?.invoiceId ||
    (candidateId && eligibleInvoices.some((inv) => inv.id === candidateId)
      ? candidateId
      : "");

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(initialInvoiceId);
  const selectedInvoice = useMemo(
    () => eligibleInvoices.find((inv) => inv.id === selectedInvoiceId),
    [eligibleInvoices, selectedInvoiceId],
  );

  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Credit Note Form State
  const [creditNoteNumber, setCreditNoteNumber] = useState<string>(
    () => existingCreditNote?.creditNoteNumber || previewCreditNoteNumber || "",
  );
  const [issueDate, setIssueDate] = useState<string>(
    () => existingCreditNote?.issueDate || getTodayDateString(),
  );
  const [reason, setReason] = useState<string>(
    () => existingCreditNote?.reason || CREDIT_NOTE_REASONS[0] || "Sales return / Defective goods",
  );
  const [customReason, setCustomReason] = useState<string>("");
  const [notes, setNotes] = useState<string>(
    () => existingCreditNote?.notes ?? initialDefaultNotes,
  );
  const [terms, setTerms] = useState<string>(
    () => existingCreditNote?.terms ?? initialDefaultTerms,
  );

  // Initialize Line Items: empty if no invoice is selected; populate from invoice when selected
  const [items, setItems] = useState<CreditNoteLineItem[]>(() => {
    if (existingCreditNote) {
      return existingCreditNote.items;
    }
    const initialInv = eligibleInvoices.find((inv) => inv.id === initialInvoiceId);
    if (initialInv && initialInv.items.length > 0) {
      return initialInv.items.map((it, idx) => ({
        id: `cn_line_${idx + 1}_${Date.now()}`,
        invoiceItemId: it.id,
        productId: it.productId,
        item: it.item,
        description: it.description || "",
        hsnSac: it.hsnSac,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        taxRate: it.taxRate,
      }));
    }
    return [];
  });

  // When user switches invoice, re-seed items from that invoice or clear if unselected
  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    const inv = eligibleInvoices.find((i) => i.id === invoiceId);
    if (inv && inv.items.length > 0) {
      setItems(
        inv.items.map((it, idx) => ({
          id: `cn_line_${idx + 1}_${Date.now()}`,
          invoiceItemId: it.id,
          productId: it.productId,
          item: it.item,
          description: it.description || "",
          hsnSac: it.hsnSac,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          taxRate: it.taxRate,
        })),
      );
    } else {
      setItems([]);
    }
    setErrors({});
    setSubmitError(null);
  };

  const updateLine = (id: string, patch: Partial<CreditNoteLineItem>) => {
    setItems((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
  };

  const addLine = () => {
    const nextId = `cn_line_${items.length + 1}_${Date.now().toString().slice(-4)}`;
    setItems((current) => [
      ...current,
      {
        id: nextId,
        item: "Additional Adjustment",
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: selectedInvoice?.taxMode === "IGST" ? 18 : 18,
      },
    ]);
  };

  const restoreLine = (orig: {
    id: string;
    item: string;
    description?: string;
    hsnSac?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
  }) => {
    const nextId = `cn_line_${items.length + 1}_${Date.now().toString().slice(-4)}`;
    setItems((current) => [
      ...current,
      {
        id: nextId,
        invoiceItemId: orig.id,
        item: orig.item,
        description: orig.description || "",
        hsnSac: orig.hsnSac,
        quantity: orig.quantity,
        unitPrice: orig.unitPrice,
        discount: orig.discount,
        taxRate: orig.taxRate,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (items.length <= 1) return;
    setItems((current) => current.filter((line) => line.id !== id));
  };

  const totals = useMemo(
    () =>
      calculateCreditNoteTotals({
        items,
        taxMode: selectedInvoice?.taxMode || "CGST_SGST",
      }),
    [items, selectedInvoice?.taxMode],
  );

  // Compute remaining balance check
  const remainingAllowance = useMemo(() => {
    if (!selectedInvoice) return 0;
    // If editing existing draft, this draft's prior total is included in allowance
    const priorDraftAmount = existingCreditNote ? existingCreditNote.total : 0;
    return selectedInvoice.remainingCreditableAmount + priorDraftAmount;
  }, [selectedInvoice, existingCreditNote]);

  const isOverCredited = totals.total > remainingAllowance + 0.001;

  const effectiveReason = reason === "Other" && customReason.trim() ? customReason.trim() : reason;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedInvoiceId) {
      newErrors.invoiceId = "Select an original invoice to credit.";
    }
    if (!issueDate) {
      newErrors.issueDate = "Issue date is required.";
    }
    if (!effectiveReason.trim()) {
      newErrors.reason = "Credit reason is required.";
    }
    if (items.length === 0) {
      newErrors.items = "Add at least one line item.";
    }
    if (totals.total <= 0) {
      newErrors.total = "Credit note total must be greater than zero.";
    }
    if (isOverCredited) {
      newErrors.total = `Credit note amount (${formatCreditNoteCurrency(
        totals.total,
      )}) exceeds available invoice balance (${formatCreditNoteCurrency(remainingAllowance)}).`;
    }

    items.forEach((line, index) => {
      if (!line.item.trim()) {
        newErrors[`item-${index}`] = "Item name is required.";
      }
      if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
        newErrors[`quantity-${index}`] = "Quantity must be > 0.";
      }
      if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) {
        newErrors[`price-${index}`] = "Price cannot be negative.";
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setSubmitError(
        Object.values(newErrors)[0] || "Please review the highlighted form errors.",
      );
      setPreview(false);
      return false;
    }
    return true;
  };

  const handleSave = async (statusToSet: "Draft" | "Issued") => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        invoiceId: selectedInvoiceId,
        creditNoteNumber: existingCreditNote ? creditNoteNumber.trim() : undefined,
        issueDate,
        status: statusToSet,
        reason: effectiveReason,
        notes,
        terms,
        items: items.map((it) => ({
          id: it.id,
          invoiceItemId: it.invoiceItemId,
          productId: it.productId,
          item: it.item,
          description: it.description,
          hsnSac: it.hsnSac,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          taxRate: it.taxRate,
        })),
      };

      const result = existingCreditNote
        ? await updateCreditNoteAction({ ...payload, id: existingCreditNote.id })
        : await createCreditNoteAction(payload);

      if (!result.success) {
        setSubmitError(result.error || "Failed to save credit note.");
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        setIsSubmitting(false);
        return;
      }

      if (statusToSet === "Issued") {
        router.push(`/credit-notes/${result.data?.id}`);
      } else {
        router.push("/credit-notes?saved=1");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected server error occurred.";
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };

  // Preview Mode
  if (preview && selectedInvoice) {
    const previewModel: CreditNote = {
      id: existingCreditNote?.id || "preview-id",
      creditNoteNumber: creditNoteNumber || previewCreditNoteNumber,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      customerId: selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      customerEmail: selectedInvoice.customerEmail || "",
      customerAddress: selectedInvoice.customerAddress || "",
      customerGstin: selectedInvoice.customerGstin || "",
      customerPlaceOfSupply: selectedInvoice.customerPlaceOfSupply,
      issueDate,
      status: "Draft",
      reason: effectiveReason,
      taxMode: selectedInvoice.taxMode,
      currency: "INR (₹)",
      subtotal: totals.subtotal,
      lineDiscountTotal: totals.discount,
      taxableAmount: totals.taxable,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      totalTax: totals.tax,
      total: totals.total,
      notes,
      terms,
      items,
    };

    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            <span>Back to edit</span>
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting || isOverCredited}
              onClick={() => handleSave("Draft")}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar size={16} className="text-text-muted" />
              <span>{isSubmitting ? "Saving..." : "Save as Draft"}</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting || isOverCredited}
              onClick={() => handleSave("Issued")}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? "Issuing..." : "Issue Credit Note"}</span>
            </button>
          </div>
        </div>
        <CreditNoteDocument creditNote={previewModel} supplierName={supplierName} />
      </section>
    );
  }

  // Guard: No eligible invoices to credit
  if (eligibleInvoices.length === 0 && !existingCreditNote) {
    return (
      <section className="space-y-6">
        <div>
          <Link
            href="/credit-notes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-light transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft size={16} />
            <span>Back to Credit Notes</span>
          </Link>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-surface-card px-6 py-16 text-center">
          <FileText className="mx-auto text-text-muted" size={28} />
          <h2 className="mt-4 font-heading text-xl font-semibold text-text-primary">
            No eligible invoices found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Credit notes can only be issued against issued, partially paid, or paid invoices.
            Please issue an invoice first before creating a credit note.
          </p>
          <Link
            href="/invoices"
            className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary-light active:bg-primary-dark"
          >
            <span>View Invoices</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* 1. Back Navigation */}
      <div>
        <Link
          href="/credit-notes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-light transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
        >
          <ArrowLeft size={16} />
          <span>Back to Credit Notes</span>
        </Link>
      </div>

      {/* 2. Page Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            {existingCreditNote ? "Edit Draft Credit Note" : "Create Credit Note"}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Issue a full or partial credit note against an eligible customer invoice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isSubmitting || isOverCredited}
            onClick={() => handleSave("Draft")}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calendar size={16} className="text-text-muted" />
            <span>{isSubmitting ? "Saving..." : "Save as Draft"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateForm()) setPreview(true);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            <Eye size={16} className="text-text-muted" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting || isOverCredited}
            onClick={() => handleSave("Issued")}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={16} />
            <span>{isSubmitting ? "Issuing..." : "Issue Credit Note"}</span>
          </button>
        </div>
      </header>

      {/* Global Submit Error Banner */}
      {submitError && (
        <div
          className="rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {/* Over-credit warning banner */}
      {isOverCredited && (
        <div
          className="rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error flex items-start gap-3"
          role="alert"
        >
          <Info size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Credit Limit Exceeded</p>
            <p className="mt-0.5 text-xs text-error/90">
              The total credit amount ({formatCreditNoteCurrency(totals.total)}) exceeds the
              remaining eligible credit balance ({formatCreditNoteCurrency(remainingAllowance)})
              for invoice {selectedInvoice?.invoiceNumber}. Please reduce quantities or amounts.
            </p>
          </div>
        </div>
      )}

      {/* 3. Original Invoice Selection & Snapshot Card */}
      <div className="rounded-xl border border-border bg-surface-card p-4 sm:p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          1. Original Invoice & Customer Reference
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Invoice Selection */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Label htmlFor="original-invoice-select">Select Original Invoice *</Label>
            <Select
              id="original-invoice-select"
              value={selectedInvoiceId}
              disabled={Boolean(existingCreditNote)}
              onChange={(val) => handleSelectInvoice(val)}
              className="mt-1 h-10"
            >
              <option value="">Select original invoice</option>
              {eligibleInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.customerName} ({formatCreditNoteCurrency(inv.total)})
                </option>
              ))}
            </Select>
            {errors.invoiceId && (
              <p className="mt-1 text-xs text-error">{errors.invoiceId}</p>
            )}
          </div>

          {/* Issue Date */}
          <div>
            <Label htmlFor="credit-note-date">Credit Note Issue Date *</Label>
            <Input
              id="credit-note-date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="mt-1 h-10 text-sm"
            />
            {errors.issueDate && (
              <p className="mt-1 text-xs text-error">{errors.issueDate}</p>
            )}
          </div>

          {/* Credit Note Number */}
          <div>
            <Label htmlFor="credit-note-number">Credit Note Number</Label>
            <Input
              id="credit-note-number"
              type="text"
              value={creditNoteNumber}
              onChange={(e) => setCreditNoteNumber(e.target.value)}
              readOnly={!existingCreditNote}
              disabled={!existingCreditNote}
              placeholder={previewCreditNoteNumber || "Auto-allocated sequence"}
              className="mt-1 h-10 text-sm font-mono opacity-80"
            />
            <p className="mt-1 text-[11px] text-text-muted">
              {existingCreditNote
                ? "Saved credit note identifier."
                : "Allocated automatically on save from Billing Settings sequence."}
            </p>
          </div>
        </div>

        {/* Selected Invoice Metadata Tile */}
        {selectedInvoice ? (
          <div className="mt-4 rounded-lg border border-border/80 bg-surface-alt/40 p-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div>
              <span className="text-text-muted block">Customer</span>
              <span className="font-semibold text-text-primary text-sm mt-0.5 block">
                {selectedInvoice.customerName}
              </span>
              {selectedInvoice.customerGstin && (
                <span className="text-text-secondary block mt-0.5">
                  GSTIN: {selectedInvoice.customerGstin}
                </span>
              )}
            </div>

            <div>
              <span className="text-text-muted block">Original Invoice Total</span>
              <span className="font-semibold text-text-primary text-sm mt-0.5 block tabular-nums">
                {formatCreditNoteCurrency(selectedInvoice.total)}
              </span>
              <span className="text-text-secondary block mt-0.5">
                Tax: {selectedInvoice.taxMode === "IGST" ? "IGST" : "CGST + SGST"}
              </span>
            </div>

            <div>
              <span className="text-text-muted block">Previously Credited</span>
              <span className="font-semibold text-text-primary text-sm mt-0.5 block tabular-nums">
                {formatCreditNoteCurrency(selectedInvoice.creditedTotal)}
              </span>
              <span className="text-text-secondary block mt-0.5">
                From issued notes
              </span>
            </div>

            <div className="rounded-md bg-surface p-2.5 border border-border/60">
              <span className="text-text-muted block font-medium">Available Credit Limit</span>
              <span className="font-bold text-success text-base mt-0.5 block tabular-nums">
                {formatCreditNoteCurrency(remainingAllowance)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-center text-xs text-text-muted">
            Select an original invoice above to load invoice details, line items, and creditable balance.
          </div>
        )}

        {/* Credit Reason */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          <div>
            <Label htmlFor="credit-reason-select">Reason for Credit Note *</Label>
            <Select
              id="credit-reason-select"
              value={reason}
              onChange={(val) => setReason(val)}
              className="mt-1 h-10"
            >
              {CREDIT_NOTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="Other">Other (Custom specification)</option>
            </Select>
          </div>

          {reason === "Other" && (
            <div>
              <Label htmlFor="custom-credit-reason">Specific Reason Details *</Label>
              <Input
                id="custom-credit-reason"
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter specific business reason..."
                className="mt-1 h-10 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Line Items Section */}
      <CreditNoteItemsSection
        items={items}
        onUpdateLine={updateLine}
        onRemoveLine={removeLine}
        onAddLine={addLine}
        originalInvoiceItems={selectedInvoice?.items}
        onRestoreLine={restoreLine}
        errors={errors}
      />

      {/* 5. Summary & Totals Box */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Notes and Terms */}
        <div className="space-y-4 rounded-xl border border-border bg-surface-card p-4 sm:p-5">
          <div>
            <Label htmlFor="credit-notes-notes">Internal Notes & Remarks</Label>
            <Textarea
              id="credit-notes-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal remarks or client notes..."
              rows={3}
              className="mt-1 text-sm"
            />
          </div>

          <div>
            <Label htmlFor="credit-notes-terms">Terms & Conditions</Label>
            <Textarea
              id="credit-notes-terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Terms of adjustment or refund..."
              rows={2}
              className="mt-1 text-sm"
            />
          </div>
        </div>

        {/* Financial Summary */}
        <div className="rounded-xl border border-border bg-surface-card p-4 sm:p-6 space-y-3">
          <h3 className="font-heading text-base font-semibold text-text-primary">
            Credit Summary & Taxes
          </h3>

          <div className="space-y-2 border-b border-border/70 pb-3 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Items Subtotal</span>
              <span className="tabular-nums font-medium text-text-primary">
                {formatCreditNoteCurrency(totals.subtotal)}
              </span>
            </div>

            {totals.discount > 0 && (
              <div className="flex justify-between text-text-secondary">
                <span>Total Discount</span>
                <span className="tabular-nums text-text-muted">
                  −{formatCreditNoteCurrency(totals.discount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-text-secondary">
              <span>Taxable Credit Amount</span>
              <span className="tabular-nums font-medium text-text-primary">
                {formatCreditNoteCurrency(totals.taxable)}
              </span>
            </div>

            {selectedInvoice?.taxMode === "IGST" ? (
              <div className="flex justify-between text-text-secondary">
                <span>IGST Total</span>
                <span className="tabular-nums font-medium text-text-primary">
                  {formatCreditNoteCurrency(totals.igst)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-text-secondary">
                  <span>CGST</span>
                  <span className="tabular-nums font-medium text-text-primary">
                    {formatCreditNoteCurrency(totals.cgst)}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>SGST</span>
                  <span className="tabular-nums font-medium text-text-primary">
                    {formatCreditNoteCurrency(totals.sgst)}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center rounded-lg bg-surface-alt px-3.5 py-3 text-base font-bold">
            <span className="text-text-primary">Total Credit</span>
            <span className="text-primary-light text-lg tabular-nums">
              {formatCreditNoteCurrency(totals.total)}
            </span>
          </div>

          <div className="pt-2 text-xs text-text-muted flex justify-between">
            <span>Remaining after this note:</span>
            <span
              className={`font-semibold tabular-nums ${
                isOverCredited ? "text-error" : "text-text-secondary"
              }`}
            >
              {formatCreditNoteCurrency(Math.max(0, remainingAllowance - totals.total))}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Actions Bar */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/credit-notes"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
        >
          <X size={15} />
          <span>Cancel</span>
        </Link>

        <button
          type="button"
          disabled={isSubmitting || isOverCredited}
          onClick={() => handleSave("Draft")}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calendar size={16} className="text-text-muted" />
          <span>{isSubmitting ? "Saving..." : "Save as Draft"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (validateForm()) setPreview(true);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
        >
          <Eye size={16} className="text-text-muted" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting || isOverCredited}
          onClick={() => handleSave("Issued")}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 size={16} />
          <span>{isSubmitting ? "Issuing..." : "Issue Credit Note"}</span>
        </button>
      </div>
    </section>
  );
};
