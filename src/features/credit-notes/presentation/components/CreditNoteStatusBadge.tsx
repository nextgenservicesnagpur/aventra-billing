import type { CreditNoteStatus } from "../../domain/credit-note";
import { cn } from "@/shared/utils/cn";

const statusDotClass: Record<CreditNoteStatus, string> = {
  Draft: "bg-text-muted",
  Issued: "bg-success",
  Cancelled: "bg-danger",
};

const statusBadgeClass: Record<CreditNoteStatus, string> = {
  Draft: "bg-surface-alt/80 text-text-secondary border-border/80",
  Issued: "bg-success/10 text-success border-success/25",
  Cancelled: "bg-danger/10 text-danger border-danger/25",
};

export const CreditNoteStatusBadge = ({
  status,
}: {
  status: CreditNoteStatus;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
      statusBadgeClass[status],
    )}
  >
    <span
      className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusDotClass[status])}
      aria-hidden="true"
    />
    <span>{status}</span>
  </span>
);
