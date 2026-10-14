import type { InvoiceStatus } from "../../domain/invoice";
import { cn } from "@/shared/utils/cn";

const statusDotClass: Record<InvoiceStatus, string> = {
  Draft: "bg-text-muted",
  Issued: "bg-info",
  "Partially Paid": "bg-warning",
  Paid: "bg-success",
  Overdue: "bg-danger",
  Cancelled: "bg-danger",
};

const statusBadgeClass: Record<InvoiceStatus, string> = {
  Draft: "bg-surface-alt/80 text-text-secondary border-border/80",
  Issued: "bg-info/10 text-info border-info/20",
  "Partially Paid": "bg-warning/10 text-warning border-warning/25",
  Paid: "bg-success/10 text-success border-success/25",
  Overdue: "bg-danger/10 text-danger border-danger/25",
  Cancelled: "bg-danger/10 text-danger border-danger/25",
};

export const StatusBadge = ({ status }: { status: InvoiceStatus }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
      statusBadgeClass[status],
    )}
  >
    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusDotClass[status])} aria-hidden="true" />
    <span>{status}</span>
  </span>
);
