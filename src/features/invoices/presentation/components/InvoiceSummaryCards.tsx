import { ArrowUpRight, CheckCircle2, Clock, FileText } from "lucide-react";
import type { InvoiceSummary } from "../../domain/rules/invoice-filter";
import { formatCurrency } from "../../domain/invoice";

export const InvoiceSummaryCards = ({ summary }: { summary: InvoiceSummary }) => (
  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
    {/* Total Invoices */}
    <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface-card p-4 sm:p-5 transition-colors">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
        aria-hidden="true"
      >
        <FileText size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-secondary">Total Invoices</p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <p className="font-heading text-2xl font-bold tracking-tight text-text-primary">
            {summary.totalInvoices}
          </p>
          <div className="flex flex-col items-end text-right">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-success">
              <ArrowUpRight size={13} />
              +12%
            </span>
            <span className="text-[11px] text-text-muted">vs last month</span>
          </div>
        </div>
      </div>
    </div>

    {/* Drafts */}
    <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface-card p-4 sm:p-5 transition-colors">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
        aria-hidden="true"
      >
        <FileText size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-secondary">Drafts</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          {summary.drafts}
        </p>
        <p className="mt-1 text-xs text-text-muted">To be issued</p>
      </div>
    </div>

    {/* Outstanding */}
    <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface-card p-4 sm:p-5 transition-colors">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
        aria-hidden="true"
      >
        <Clock size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-secondary">Outstanding</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          {summary.outstandingCount}
        </p>
        <p className="mt-1 text-xs text-text-muted tabular-nums">
          {formatCurrency(summary.outstanding)}
        </p>
      </div>
    </div>

    {/* Paid */}
    <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface-card p-4 sm:p-5 transition-colors">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
        aria-hidden="true"
      >
        <CheckCircle2 size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-secondary">Paid</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          {summary.paidCount}
        </p>
        <p className="mt-1 text-xs text-text-muted tabular-nums">
          {formatCurrency(summary.paid)}
        </p>
      </div>
    </div>
  </div>
);
