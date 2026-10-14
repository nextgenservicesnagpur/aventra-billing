"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/shared/components/form/Button";
import { cn } from "@/shared/utils/cn";
import { formatCurrency, formatInvoiceDate, calculateInvoiceTotals, type Invoice } from "../../domain/invoice";
import { useInvoiceWorkspace } from "../hooks/InvoiceWorkspaceProvider";
import { InvoiceDocument } from "../components/InvoiceDocument";
import { StatusBadge } from "../components/StatusBadge";

export type RelatedCreditNoteSummary = {
  id: string;
  creditNoteNumber: string;
  issueDate: string;
  total: number;
  status: string;
};

export type InvoiceDetailPageProps = {
  initialInvoice?: Invoice | null;
  relatedCreditNotes?: RelatedCreditNoteSummary[];
};

export const InvoiceDetailPage = ({
  initialInvoice,
  relatedCreditNotes = [],
}: InvoiceDetailPageProps) => {
  const params = useParams<{ id: string }>();
  const { getInvoice } = useInvoiceWorkspace();
  const invoice = initialInvoice ?? (params?.id ? getInvoice(params.id) : undefined);

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-card px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Invoice not found
        </h1>
        <p className="mx-auto mt-2 max-w-md text-text-secondary">
          The requested invoice does not exist or does not belong to your organization.
        </p>
        <Link
          href="/invoices"
          className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary-light active:bg-primary-dark"
        >
          <ArrowLeft size={17} />
          <span>Return to invoices</span>
        </Link>
      </div>
    );
  }

  const totals = calculateInvoiceTotals(invoice);
  const remainingCreditable = Math.max(0, totals.total - (totals.creditedAmount ?? 0));
  const isEligibleForCredit =
    invoice.status !== "Draft" &&
    invoice.status !== "Cancelled" &&
    remainingCreditable > 0;

  return (
    <section className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            <span>Back to invoices</span>
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              {invoice.number}
            </h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="mt-2 text-text-secondary">
            {invoice.customer} · Due {formatInvoiceDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {isEligibleForCredit && (
            <Link
              href={`/credit-notes/new?invoiceId=${invoice.id}`}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface-alt px-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
            >
              <span>Create Credit Note</span>
            </Link>
          )}
          <Button variant="secondary" onClick={() => window.print()} className="px-4">
            <Printer size={17} />
            <span>Browser print</span>
          </Button>
        </div>
      </header>

      <div
        className={cn(
          "grid gap-3",
          totals.creditedAmount && totals.creditedAmount > 0
            ? "sm:grid-cols-4"
            : "sm:grid-cols-3",
        )}
      >
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-sm text-text-secondary">Invoice total</p>
          <p className="mt-1 font-heading text-xl font-bold">{formatCurrency(totals.total)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-sm text-text-secondary">Paid</p>
          <p className="mt-1 font-heading text-xl font-bold">{formatCurrency(invoice.amountPaid)}</p>
        </div>
        {totals.creditedAmount !== undefined && totals.creditedAmount > 0 && (
          <div className="rounded-xl border border-border bg-surface-card p-4">
            <p className="text-sm text-text-secondary">Credited</p>
            <p className="mt-1 font-heading text-xl font-bold">{formatCurrency(totals.creditedAmount)}</p>
          </div>
        )}
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <p className="text-sm text-text-secondary">Balance due</p>
          <p className="mt-1 font-heading text-xl font-bold">{formatCurrency(totals.balance)}</p>
        </div>
      </div>

      {relatedCreditNotes.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-card p-4 sm:p-5">
          <h2 className="font-heading text-base font-semibold text-text-primary">
            Related Credit Notes ({relatedCreditNotes.length})
          </h2>
          <div className="mt-3 divide-y divide-border/60">
            {relatedCreditNotes.map((cn) => (
              <div
                key={cn.id}
                className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
              >
                <div>
                  <Link
                    href={`/credit-notes/${cn.id}`}
                    className="font-medium text-primary-light hover:underline"
                  >
                    {cn.creditNoteNumber}
                  </Link>
                  <span className="ml-2 text-xs text-text-muted">
                    Issued {formatInvoiceDate(cn.issueDate)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums text-text-primary">
                    {formatCurrency(cn.total)}
                  </span>
                  <span className="rounded-md border border-border/80 bg-surface-alt/60 px-2 py-0.5 text-xs text-text-secondary">
                    {cn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <InvoiceDocument invoice={invoice} />
    </section>
  );
};
