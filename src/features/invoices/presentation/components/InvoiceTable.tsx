import Link from "next/link";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import { calculateInvoiceTotals, formatCurrency, formatInvoiceDate, type Invoice } from "../../domain/invoice";
import { StatusBadge } from "./StatusBadge";
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

type InvoiceTableProps = {
  invoices: Invoice[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  allOnPageSelected: boolean;
};

export const InvoiceTable = ({
  invoices,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allOnPageSelected,
}: InvoiceTableProps) => (
  <div className="overflow-hidden rounded-xl border border-border bg-surface-card transition-colors">
    <Table className="min-w-[960px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 px-4 py-3.5 text-center">
            <label htmlFor="select-all-invoices" className="sr-only">
              Select all invoices on this page
            </label>
            <Checkbox
              id="select-all-invoices"
              checked={allOnPageSelected && invoices.length > 0}
              onChange={onToggleSelectAll}
              className="rounded border-border bg-input transition-colors focus:ring-focus"
            />
          </TableHead>
          <TableHead className="px-4 py-3.5">Invoice No.</TableHead>
          <TableHead className="px-4 py-3.5">Customer</TableHead>
          <TableHead className="px-4 py-3.5">Issue Date</TableHead>
          <TableHead className="px-4 py-3.5">Due Date</TableHead>
          <TableHead className="px-4 py-3.5 text-right">Amount</TableHead>
          <TableHead className="px-4 py-3.5">Status</TableHead>
          <TableHead className="px-4 py-3.5 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          const totals = calculateInvoiceTotals(invoice);
          const isSelected = selectedIds.has(invoice.id);

          return (
            <TableRow
              key={invoice.id}
              className={cn(
                "transition-colors",
                isSelected ? "bg-surface-alt/50 hover:bg-surface-alt/70" : "hover:bg-surface-alt/40",
              )}
            >
              {/* Selection checkbox */}
              <TableCell className="w-12 px-4 py-3.5 text-center">
                <label htmlFor={`select-invoice-${invoice.id}`} className="sr-only">
                  Select invoice {invoice.number}
                </label>
                <Checkbox
                  id={`select-invoice-${invoice.id}`}
                  checked={isSelected}
                  onChange={() => onToggleSelect(invoice.id)}
                  className="rounded border-border bg-input transition-colors focus:ring-focus"
                />
              </TableCell>

              {/* Invoice Number */}
              <TableCell className="px-4 py-3.5 font-medium text-text-primary whitespace-nowrap">
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="hover:text-primary-light transition-colors"
                >
                  {invoice.number}
                </Link>
              </TableCell>

              {/* Customer with email */}
              <TableCell className="px-4 py-3.5">
                <p className="font-medium text-text-primary leading-snug">{invoice.customer}</p>
                {invoice.customerEmail && (
                  <p className="text-xs text-text-muted leading-tight mt-0.5">{invoice.customerEmail}</p>
                )}
              </TableCell>

              {/* Issue Date */}
              <TableCell className="px-4 py-3.5 text-text-secondary whitespace-nowrap">
                {formatInvoiceDate(invoice.issueDate)}
              </TableCell>

              {/* Due Date */}
              <TableCell className="px-4 py-3.5 text-text-secondary whitespace-nowrap">
                {formatInvoiceDate(invoice.dueDate)}
              </TableCell>

              {/* Amount */}
              <TableCell className="px-4 py-3.5 text-right font-medium text-text-primary whitespace-nowrap tabular-nums">
                {formatCurrency(totals.total)}
              </TableCell>

              {/* Status */}
              <TableCell className="px-4 py-3.5 whitespace-nowrap">
                <StatusBadge status={invoice.status} />
              </TableCell>

              {/* Actions */}
              <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                <div className="inline-flex items-center justify-end gap-1">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    aria-label={`View invoice ${invoice.number}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                    title="View invoice"
                  >
                    <Eye size={16} />
                  </Link>

                  {invoice.status === "Draft" ? (
                    <Link
                      href={`/invoices/new?edit=${invoice.id}`}
                      aria-label={`Edit draft invoice ${invoice.number}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                      title="Edit draft"
                    >
                      <Pencil size={15} />
                    </Link>
                  ) : (
                    <Link
                      href={`/invoices/${invoice.id}`}
                      aria-label={`More actions for invoice ${invoice.number}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                      title="Actions"
                    >
                      <MoreHorizontal size={16} />
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
