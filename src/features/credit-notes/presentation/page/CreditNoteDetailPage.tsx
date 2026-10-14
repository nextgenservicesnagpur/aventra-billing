"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Pencil, Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/form/Button";
import {
  formatCreditNoteCurrency,
  formatCreditNoteDate,
  calculateCreditNoteTotals,
  type CreditNote,
} from "../../domain/credit-note";
import { CreditNoteDocument } from "../components/CreditNoteDocument";
import { CreditNoteStatusBadge } from "../components/CreditNoteStatusBadge";
import {
  deleteCreditNoteAction,
  issueCreditNoteAction,
} from "../../data/mutations/credit-note-mutations";

export type CreditNoteDetailPageProps = {
  initialCreditNote?: CreditNote | null;
  supplierName?: string;
};

export const CreditNoteDetailPage = ({
  initialCreditNote,
  supplierName,
}: CreditNoteDetailPageProps) => {
  const router = useRouter();
  const [creditNote, setCreditNote] = useState<CreditNote | null | undefined>(
    initialCreditNote,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!creditNote) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-card px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Credit note not found
        </h1>
        <p className="mx-auto mt-2 max-w-md text-text-secondary">
          The requested credit note does not exist or does not belong to your organization.
        </p>
        <Link
          href="/credit-notes"
          className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary-light active:bg-primary-dark"
        >
          <ArrowLeft size={17} />
          <span>Return to credit notes</span>
        </Link>
      </div>
    );
  }

  const totals = calculateCreditNoteTotals(creditNote);

  const handleIssue = async () => {
    if (!confirm("Are you sure you want to finalize and issue this credit note? Once issued, its financial values become immutable.")) {
      return;
    }

    setIsProcessing(true);
    setActionError(null);

    const result = await issueCreditNoteAction(creditNote.id);
    if (!result.success) {
      setActionError(result.error || "Failed to issue credit note.");
      setIsProcessing(false);
      return;
    }

    setCreditNote(result.data);
    setIsProcessing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this draft credit note? This action cannot be undone.")) {
      return;
    }

    setIsProcessing(true);
    setActionError(null);

    const result = await deleteCreditNoteAction(creditNote.id);
    if (!result.success) {
      setActionError(result.error || "Failed to delete credit note.");
      setIsProcessing(false);
      return;
    }

    router.push("/credit-notes");
  };

  return (
    <section className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/credit-notes"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            <span>Back to credit notes</span>
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              {creditNote.creditNoteNumber}
            </h1>
            <CreditNoteStatusBadge status={creditNote.status} />
          </div>
          <p className="mt-2 text-text-secondary">
            {creditNote.customerName} · Issued {formatCreditNoteDate(creditNote.issueDate)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {creditNote.status === "Draft" ? (
            <>
              <Button
                variant="secondary"
                disabled={isProcessing}
                onClick={handleDelete}
                className="px-3 text-danger hover:text-danger-light"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </Button>

              <Link
                href={`/credit-notes/new?edit=${creditNote.id}`}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface-alt px-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
              >
                <Pencil size={15} />
                <span>Edit Draft</span>
              </Link>

              <Button
                variant="primary"
                disabled={isProcessing}
                onClick={handleIssue}
                className="px-4"
              >
                <CheckCircle2 size={16} />
                <span>{isProcessing ? "Issuing..." : "Issue Credit Note"}</span>
              </Button>
            </>
          ) : (
            <>
              <Link
                href={`/invoices/${creditNote.invoiceId}`}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface-alt px-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
              >
                <span>View Invoice ({creditNote.invoiceNumber || "Details"})</span>
              </Link>
              <Button
                variant="secondary"
                onClick={() => window.print()}
                className="px-4"
              >
                <Printer size={16} />
                <span>Print Document</span>
              </Button>
            </>
          )}
        </div>
      </header>

      {actionError && (
        <div
          className="rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {/* Financial Stat Tiles */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Credit Note Total</p>
          <p className="mt-1 font-heading text-xl font-bold tabular-nums">
            {formatCreditNoteCurrency(totals.total)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Taxable Amount</p>
          <p className="mt-1 font-heading text-xl font-bold tabular-nums">
            {formatCreditNoteCurrency(totals.taxable)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Total Tax Credited</p>
          <p className="mt-1 font-heading text-xl font-bold tabular-nums">
            {formatCreditNoteCurrency(totals.tax)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Original Invoice</p>
          <Link
            href={`/invoices/${creditNote.invoiceId}`}
            className="mt-1 block font-heading text-xl font-bold text-primary-light hover:underline"
          >
            {creditNote.invoiceNumber || "Invoice"}
          </Link>
        </div>
      </div>

      {/* Rendered Document */}
      <CreditNoteDocument creditNote={creditNote} supplierName={supplierName} />
    </section>
  );
};
