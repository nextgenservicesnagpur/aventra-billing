"use client";

import { useState, type KeyboardEvent } from "react";
import { Tags, X } from "lucide-react";
import { Input, Label, Textarea } from "@/shared/components/form";

export type CustomerNotesSectionProps = {
  internalNotes: string;
  onInternalNotesChange: (val: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
};

export const CustomerNotesSection = ({
  internalNotes,
  onInternalNotesChange,
  tags,
  onTagsChange,
}: CustomerNotesSectionProps) => {
  const [tagInput, setTagInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,+|,+$/g, "");
      if (trimmed && !tags.includes(trimmed)) {
        onTagsChange([...tags, trimmed]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <Tags size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Notes &amp; Tags
          </h2>
          <p className="text-xs text-text-secondary">
            Add internal notes and tags for reference.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Internal Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-internal-notes" className="text-xs">
            Internal Notes
          </Label>
          <Textarea
            id="customer-internal-notes"
            rows={4}
            value={internalNotes}
            onChange={(e) => onInternalNotesChange(e.target.value)}
            placeholder="Enter any internal notes..."
            className="text-sm resize-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-tags-input" className="text-xs">
            Tags
          </Label>
          <Input
            id="customer-tags-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tags..."
            className="h-10 text-sm"
          />
          <p className="flex items-center gap-1 text-xs text-text-muted">
            <span aria-hidden="true">&#x21B5;</span> Press Enter to add a tag
          </p>

          {/* Tag Badges */}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-surface-alt px-2.5 py-1 text-xs font-medium text-text-secondary"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="cursor-pointer text-text-muted transition-colors hover:text-danger"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
