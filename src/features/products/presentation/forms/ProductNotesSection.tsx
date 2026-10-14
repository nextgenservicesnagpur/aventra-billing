"use client";

import { FileText } from "lucide-react";
import { Label, Textarea } from "@/shared/components/form";

export type ProductNotesSectionProps = {
  internalNotes: string;
  onInternalNotesChange: (val: string) => void;
  errors?: Record<string, string>;
};

export const ProductNotesSection = ({
  internalNotes,
  onInternalNotesChange,
  errors = {},
}: ProductNotesSectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <FileText size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Internal Notes
          </h2>
          <p className="text-xs text-text-secondary">
            Add internal comments, vendor references, or notes for your team.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <Label htmlFor="internal-notes" className="text-xs">
          Internal Notes (Not visible on customer invoices)
        </Label>
        <Textarea
          id="internal-notes"
          value={internalNotes}
          onChange={(e) => onInternalNotesChange(e.target.value)}
          placeholder="Enter any internal notes..."
          rows={3}
          className="text-sm resize-none"
        />
        {errors.internalNotes && (
          <p className="text-xs text-danger" role="alert">
            {errors.internalNotes}
          </p>
        )}
      </div>
    </section>
  );
};
