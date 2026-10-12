import { Building2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type WorkspaceContextProps = {
  name: string;
  className?: string;
};

/**
 * Compact organization context for the header. Deliberately a static
 * label today — no switching affordance is shown until real multi-org
 * support exists. The shape is ready to grow (logo, metadata, switcher)
 * without changing the header contract.
 */
export const WorkspaceContext = ({ name, className }: WorkspaceContextProps) => (
  <div className={cn("hidden items-center gap-3 lg:flex", className)}>
    <span aria-hidden="true" className="h-4 w-px bg-border" />
    <span className="sr-only">Current organization</span>
    <Building2
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-text-muted"
    />
    <span className="max-w-40 truncate text-sm font-medium text-text-secondary">
      {name}
    </span>
  </div>
);
