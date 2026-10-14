import { Eye, Hash } from "lucide-react";
import { formatDocumentNumber } from "../../domain/rules/billing-settings-rules";

export type DocumentNumberPreviewCardProps = {
  prefix: string;
  nextNumber: number;
  padding: number;
  suffix?: string | null;
  documentLabel?: string;
};

export const DocumentNumberPreviewCard = ({
  prefix,
  nextNumber,
  padding,
  suffix,
  documentLabel = "Document",
}: DocumentNumberPreviewCardProps) => {
  let previewText = "";
  let isError = false;

  try {
    previewText = formatDocumentNumber({
      prefix,
      nextNumber: nextNumber || 1,
      padding: padding || 4,
      suffix,
    });
  } catch {
    previewText = `${prefix || "???"}0001${suffix || ""}`;
    isError = true;
  }

  return (
    <div className="rounded-xl border border-border/80 bg-surface-alt/40 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <Eye size={14} className="text-primary-light" />
          <span>Next {documentLabel} Number Preview</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-light">
          <Hash size={11} />
          <span>Format Preview</span>
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div className="font-mono text-2xl font-bold tracking-tight text-primary-light sm:text-3xl">
          {previewText}
        </div>
        <div className="text-xs text-text-muted">
          Padded to {padding} digits {suffix ? `with suffix "${suffix}"` : "without suffix"}
        </div>
      </div>

      {isError && (
        <p className="mt-2 text-xs text-danger">
          Number format preview could not be generated with current input.
        </p>
      )}

      <p className="mt-3 text-xs text-text-muted border-t border-border/40 pt-2.5">
        Preview only — Document numbers are reserved and allocated when documents are finalized.
      </p>
    </div>
  );
};
