import { FileText } from "lucide-react";
import type { ChangeEvent } from "react";
import { Label, Textarea } from "@/shared/components/form";

type AdditionalInfoSectionProps = {
  notes: string;
  onNotesChange: (val: string) => void;
  terms: string;
  onTermsChange: (val: string) => void;
};

export const AdditionalInfoSection = ({
  notes,
  onNotesChange,
  terms,
  onTermsChange,
}: AdditionalInfoSectionProps) => (
  <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6 transition-colors">
    {/* Section Header */}
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
        aria-hidden="true"
      >
        <FileText size={19} />
      </div>
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight text-text-primary">
          Additional Information
        </h2>
        <p className="mt-0.5 text-xs text-text-secondary">
          Add notes, payment terms, or any other information.
        </p>
      </div>
    </div>

    {/* Two balanced columns */}
    <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Left: Notes to Customer */}
      <div>
        <Label
          htmlFor="invoice-notes-textarea"
          className="mb-1.5 block text-xs font-medium text-text-secondary"
        >
          Notes to Customer
        </Label>
        <Textarea
          id="invoice-notes-textarea"
          rows={4}
          value={notes}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onNotesChange(e.target.value)}
          placeholder="Enter any additional notes..."
          className="min-h-24 px-3.5 py-2.5 text-sm"
        />
      </div>

      {/* Right: Terms and Conditions */}
      <div>
        <Label
          htmlFor="invoice-terms-textarea"
          className="mb-1.5 block text-xs font-medium text-text-secondary"
        >
          Terms and Conditions
        </Label>
        <Textarea
          id="invoice-terms-textarea"
          rows={4}
          value={terms}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onTermsChange(e.target.value)}
          placeholder="Enter terms and conditions..."
          className="min-h-24 px-3.5 py-2.5 text-sm"
        />
      </div>
    </div>
  </section>
);
