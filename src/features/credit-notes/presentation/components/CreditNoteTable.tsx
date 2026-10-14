import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import {
  formatCreditNoteCurrency,
  formatCreditNoteDate,
  type CreditNote,
} from "../../domain/credit-note";
import { CreditNoteStatusBadge } from "./CreditNoteStatusBadge";
import { cn } from "@/shared/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/table/Table";
import { Checkbox } from "@/shared/components/form/Checkbox";

export type CreditNoteTableProps = {
  creditNotes: CreditNote[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  allOnPageSelected: boolean;
};

export const CreditNoteTable = ({
  creditNotes,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allOnPageSelected,
}: CreditNoteTableProps) => (
  <div className="overflow-hidden rounded-xl border border-border bg-surface-card transition-colors">
    <Table className="min-w-[960px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 px-4 py-3.5 text-center">
            <label htmlFor="select-all-credit-notes" className="sr-only">
              Select all credit notes on this page
            </label>
            <Checkbox
              id="select-all-credit-notes"
              checked={allOnPageSelected && creditNotes.length > 0}
              onChange={onToggleSelectAll}
              className="rounded border-border bg-input transition-colors focus:ring-focus"
            />
          </TableHead>
          <TableHead className="px-4 py-3.5">Credit Note No.</TableHead>
          <TableHead className="px-4 py-3.5">Original Invoice</TableHead>
          <TableHead className="px-4 py-3.5">Customer</TableHead>
          <TableHead className="px-4 py-3.5">Issue Date</TableHead>
          <TableHead className="px-4 py-3.5">Reason</TableHead>
          <TableHead className="px-4 py-3.5 text-right">Amount</TableHead>
          <TableHead className="px-4 py-3.5">Status</TableHead>
          <TableHead className="px-4 py-3.5 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {creditNotes.map((note) => {
          const isSelected = selectedIds.has(note.id);

          return (
            <TableRow
              key={note.id}
              className={cn(
                "transition-colors",
                isSelected
                  ? "bg-surface-alt/50 hover:bg-surface-alt/70"
                  : "hover:bg-surface-alt/40",
              )}
            >
              {/* Checkbox */}
              <TableCell className="w-12 px-4 py-3.5 text-center">
                <label htmlFor={`select-credit-note-${note.id}`} className="sr-only">
                  Select credit note {note.creditNoteNumber}
                </label>
                <Checkbox
                  id={`select-credit-note-${note.id}`}
                  checked={isSelected}
                  onChange={() => onToggleSelect(note.id)}
                  className="rounded border-border bg-input transition-colors focus:ring-focus"
                />
              </TableCell>

              {/* Credit Note Number */}
              <TableCell className="px-4 py-3.5 font-medium text-text-primary whitespace-nowrap">
                <Link
                  href={`/credit-notes/${note.id}`}
                  className="hover:text-primary-light transition-colors"
                >
                  {note.creditNoteNumber}
                </Link>
              </TableCell>

              {/* Original Invoice */}
              <TableCell className="px-4 py-3.5 whitespace-nowrap">
                <Link
                  href={`/invoices/${note.invoiceId}`}
                  className="text-primary-light hover:underline font-medium text-xs sm:text-sm"
                >
                  {note.invoiceNumber || "View Invoice"}
                </Link>
              </TableCell>

              {/* Customer */}
              <TableCell className="px-4 py-3.5">
                <p className="font-medium text-text-primary leading-snug">{note.customerName}</p>
                {note.customerEmail && (
                  <p className="text-xs text-text-muted leading-tight mt-0.5">
                    {note.customerEmail}
                  </p>
                )}
              </TableCell>

              {/* Issue Date */}
              <TableCell className="px-4 py-3.5 text-text-secondary whitespace-nowrap">
                {formatCreditNoteDate(note.issueDate)}
              </TableCell>

              {/* Reason */}
              <TableCell className="px-4 py-3.5 text-text-secondary max-w-[180px] truncate">
                <span title={note.reason}>{note.reason}</span>
              </TableCell>

              {/* Amount */}
              <TableCell className="px-4 py-3.5 text-right font-medium text-text-primary whitespace-nowrap tabular-nums">
                {formatCreditNoteCurrency(note.total)}
              </TableCell>

              {/* Status */}
              <TableCell className="px-4 py-3.5 whitespace-nowrap">
                <CreditNoteStatusBadge status={note.status} />
              </TableCell>

              {/* Actions */}
              <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/credit-notes/${note.id}`}
                    aria-label={`View credit note ${note.creditNoteNumber}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    <Eye size={15} />
                  </Link>
                  {note.status === "Draft" && (
                    <Link
                      href={`/credit-notes/new?edit=${note.id}`}
                      aria-label={`Edit draft credit note ${note.creditNoteNumber}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      <Pencil size={15} />
                    </Link>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);
