import { Plus, Trash2 } from "lucide-react";
import {
  formatCreditNoteCurrency,
  lineTax,
  lineTaxable,
  roundCurrency,
  type CreditNoteLineItem,
} from "../../domain/credit-note";
import { Input } from "@/shared/components/form/Input";

export type CreditNoteItemsSectionProps = {
  items: CreditNoteLineItem[];
  onUpdateLine: (id: string, patch: Partial<CreditNoteLineItem>) => void;
  onRemoveLine: (id: string) => void;
  onAddLine?: () => void;
  originalInvoiceItems?: Array<{
    id: string;
    item: string;
    description?: string;
    hsnSac?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
  }>;
  onRestoreLine?: (item: {
    id: string;
    item: string;
    description?: string;
    hsnSac?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
  }) => void;
  errors: Record<string, string>;
};

export const CreditNoteItemsSection = ({
  items,
  onUpdateLine,
  onRemoveLine,
  onAddLine,
  originalInvoiceItems = [],
  onRestoreLine,
  errors,
}: CreditNoteItemsSectionProps) => {
  // Find which original invoice items are currently not in the credit note items
  const missingOriginalItems = originalInvoiceItems.filter(
    (orig) => !items.some((it) => it.invoiceItemId === orig.id),
  );

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface-card p-4 sm:p-5 transition-colors">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            Credit Items & Adjustments
          </h2>
          <p className="text-xs text-text-secondary">
            Adjust quantities or prices for full or partial credits against the original invoice items.
          </p>
        </div>
        {onAddLine && (
          <button
            type="button"
            onClick={onAddLine}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Add Custom Line</span>
          </button>
        )}
      </div>

      {errors.items && (
        <p className="rounded-lg border border-error/40 bg-error/15 px-3 py-2 text-xs text-error">
          {errors.items}
        </p>
      )}

      {/* Items table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-text-muted">
              <th className="pb-3 pr-4">Item & Description</th>
              <th className="pb-3 px-3 w-24 text-right">Qty</th>
              <th className="pb-3 px-3 w-28 text-right">Rate (₹)</th>
              <th className="pb-3 px-3 w-24 text-right">Disc %</th>
              <th className="pb-3 px-3 w-24 text-right">Tax %</th>
              <th className="pb-3 pl-3 pr-2 w-32 text-right">Total (₹)</th>
              <th className="pb-3 pl-2 w-10 text-center">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-text-muted">
                  No line items added. Select an original invoice or click &ldquo;Add Custom Line&rdquo; to begin.
                </td>
              </tr>
            ) : (
              items.map((line, idx) => {
                const taxable = lineTaxable(line);
                const tax = lineTax(line);
                const total = roundCurrency(taxable + tax);

              return (
                <tr key={line.id} className="align-top group">
                  {/* Item name and description */}
                  <td className="py-3 pr-4">
                    <Input
                      type="text"
                      value={line.item}
                      onChange={(e) => onUpdateLine(line.id, { item: e.target.value })}
                      placeholder="Item name or service"
                      className="h-9 text-sm font-medium"
                      aria-label={`Item ${idx + 1} name`}
                    />
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) =>
                        onUpdateLine(line.id, { description: e.target.value })
                      }
                      placeholder="Optional description"
                      aria-label={`Item ${idx + 1} description`}
                      className="mt-1.5 w-full rounded-md border border-border/60 bg-transparent px-2.5 py-1 text-xs text-text-secondary placeholder:text-text-muted focus:border-border focus:outline-hidden"
                    />
                    {errors[`item-${idx}`] && (
                      <p className="mt-1 text-xs text-error">{errors[`item-${idx}`]}</p>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 text-right">
                    <Input
                      type="number"
                      step="any"
                      min="0.001"
                      value={line.quantity || ""}
                      onChange={(e) =>
                        onUpdateLine(line.id, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 text-right text-sm tabular-nums"
                      aria-label={`Item ${idx + 1} quantity`}
                    />
                    {errors[`quantity-${idx}`] && (
                      <p className="mt-1 text-xs text-error text-right">
                        {errors[`quantity-${idx}`]}
                      </p>
                    )}
                  </td>

                  {/* Unit price */}
                  <td className="py-3 px-3 text-right">
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={line.unitPrice || ""}
                      onChange={(e) =>
                        onUpdateLine(line.id, {
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 text-right text-sm tabular-nums"
                      aria-label={`Item ${idx + 1} unit price`}
                    />
                    {errors[`price-${idx}`] && (
                      <p className="mt-1 text-xs text-error text-right">
                        {errors[`price-${idx}`]}
                      </p>
                    )}
                  </td>

                  {/* Discount % */}
                  <td className="py-3 px-3 text-right">
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={line.discount ?? 0}
                      onChange={(e) =>
                        onUpdateLine(line.id, {
                          discount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 text-right text-sm tabular-nums"
                      aria-label={`Item ${idx + 1} discount`}
                    />
                  </td>

                  {/* Tax Rate % */}
                  <td className="py-3 px-3 text-right">
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={line.taxRate ?? 18}
                      onChange={(e) =>
                        onUpdateLine(line.id, {
                          taxRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 text-right text-sm tabular-nums"
                      aria-label={`Item ${idx + 1} tax rate`}
                    />
                  </td>

                  {/* Line Total */}
                  <td className="py-3 pl-3 pr-2 text-right">
                    <div className="pt-2 font-medium text-text-primary tabular-nums">
                      {formatCreditNoteCurrency(total)}
                    </div>
                    <div className="text-[11px] text-text-muted tabular-nums">
                      Tax: {formatCreditNoteCurrency(tax)}
                    </div>
                  </td>

                  {/* Remove Button */}
                  <td className="py-3 pl-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(line.id)}
                      aria-label={`Remove line ${idx + 1}`}
                      className="mt-1.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-alt hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      {/* Restore missing original items */}
      {missingOriginalItems.length > 0 && onRestoreLine && (
        <div className="mt-3 rounded-lg border border-border/80 bg-surface-alt/40 p-3">
          <p className="text-xs font-medium text-text-secondary">
            Excluded items from original invoice:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missingOriginalItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onRestoreLine(item)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-text-primary transition-colors hover:border-primary-light hover:text-primary-light"
              >
                <Plus size={13} />
                <span>Include {item.item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
