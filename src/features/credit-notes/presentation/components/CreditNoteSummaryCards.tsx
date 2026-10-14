import { CheckCircle2, FileText, Undo2 } from "lucide-react";
import type { CreditNoteSummary } from "../../domain/rules/credit-note-filter";
import { formatCreditNoteCurrency } from "../../domain/credit-note";

export const CreditNoteSummaryCards = ({
  summary,
}: {
  summary: CreditNoteSummary;
}) => (
  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
    {/* Total Credit Notes */}
    <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface-card p-4 sm:p-5 transition-colors">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
        aria-hidden="true"
      >
        <FileText size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-secondary">Total Credit Notes</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          {summary.totalCreditNotes}
        </p>
        <p className="mt-1 text-xs text-text-muted">All recorded documents</p>
      </div>
    </div>

    {/* Total Credited */}
    <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface-card p-4 sm:p-5 transition-colors">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
        aria-hidden="true"
      >
        <Undo2 size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-secondary">Total Credited Value</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          {formatCreditNoteCurrency(summary.totalCreditedAmount)}
        </p>
        <p className="mt-1 text-xs text-text-muted">Issued credits</p>
      </div>
    </div>

    {/* Issued Notes */}
    <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface-card p-4 sm:p-5 transition-colors">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
        aria-hidden="true"
      >
        <CheckCircle2 size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-secondary">Issued Notes</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          {summary.issuedCount}
        </p>
        <p className="mt-1 text-xs text-text-muted tabular-nums">
          {formatCreditNoteCurrency(summary.issuedAmount)}
        </p>
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
        <p className="text-xs font-medium text-text-secondary">Draft Notes</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          {summary.draftCount}
        </p>
        <p className="mt-1 text-xs text-text-muted tabular-nums">
          {formatCreditNoteCurrency(summary.draftAmount)}
        </p>
      </div>
    </div>
  </div>
);
