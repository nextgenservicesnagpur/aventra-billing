import { Calculator, Percent } from "lucide-react";
import type { InvoiceLineItem, InvoiceTotals, TaxMode } from "../../domain/invoice";

const formatCurrencyExact = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

type InvoiceSummarySectionProps = {
  totals: InvoiceTotals;
  taxMode?: TaxMode;
  onTaxModeChange?: (mode: TaxMode) => void;
  items?: InvoiceLineItem[];
};

type GstSlab = {
  rate: number;
  taxable: number;
  tax: number;
};

const calculateGstSlabs = (items: InvoiceLineItem[] = []): GstSlab[] => {
  const map = new Map<number, { taxable: number; tax: number }>();

  items.forEach((line) => {
    const subtotal = line.quantity * line.unitPrice;
    const itemDiscount = subtotal * (line.discount / 100);
    const taxable = Math.max(0, subtotal - itemDiscount);
    const tax = taxable * (line.taxRate / 100);

    const prev = map.get(line.taxRate) || { taxable: 0, tax: 0 };
    map.set(line.taxRate, {
      taxable: prev.taxable + taxable,
      tax: prev.tax + tax,
    });
  });

  return Array.from(map.entries())
    .map(([rate, data]) => ({
      rate,
      taxable: Math.round((data.taxable + Number.EPSILON) * 100) / 100,
      tax: Math.round((data.tax + Number.EPSILON) * 100) / 100,
    }))
    .sort((a, b) => b.rate - a.rate);
};

export const InvoiceSummarySection = ({
  totals,
  taxMode = "CGST_SGST",
  onTaxModeChange,
  items = [],
}: InvoiceSummarySectionProps) => {
  const slabs = calculateGstSlabs(items);
  const halfTax = Math.round((totals.tax / 2 + Number.EPSILON) * 100) / 100;
  const otherHalf = Math.round((totals.tax - halfTax + Number.EPSILON) * 100) / 100;

  return (
    <section className="flex h-full flex-col justify-between rounded-xl border border-border bg-surface-card p-5 sm:p-6 transition-colors">
      {/* Top Content: Header, Summary Rows, and GST Breakdown */}
      <div>
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
            aria-hidden="true"
          >
            <Calculator size={19} />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight text-text-primary">
              Invoice Summary
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Review the invoice totals and tax details.
            </p>
          </div>
        </div>

        {/* Summary rows */}
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Subtotal</span>
            <span className="font-medium text-text-primary tabular-nums">
              {formatCurrencyExact(totals.subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-text-secondary">
            <span>Discount</span>
            <span className="font-medium text-text-primary tabular-nums">
              {totals.discount > 0 ? `−${formatCurrencyExact(totals.discount)}` : formatCurrencyExact(0)}
            </span>
          </div>

          {totals.additionalCharges !== undefined && totals.additionalCharges > 0 && (
            <div className="flex items-center justify-between text-text-secondary">
              <span>Additional Charges</span>
              <span className="font-medium text-text-primary tabular-nums">
                +{formatCurrencyExact(totals.additionalCharges)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-text-secondary">
            <span>Taxable Amount</span>
            <span className="font-medium text-text-primary tabular-nums">
              {formatCurrencyExact(totals.taxable)}
            </span>
          </div>

          <div className="flex items-center justify-between text-text-secondary">
            <span>Tax Amount</span>
            <span className="font-medium text-text-primary tabular-nums">
              {formatCurrencyExact(totals.tax)}
            </span>
          </div>
        </div>

        {/* GST Summary Sub-Card */}
        <div className="mt-5 rounded-lg border border-border/80 bg-surface-alt/40 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Percent size={14} className="text-primary-light" />
              <span className="text-xs font-semibold text-text-primary">GST Summary</span>
            </div>

            {onTaxModeChange ? (
              <div className="flex rounded-md border border-border/70 bg-surface p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => onTaxModeChange("CGST_SGST")}
                  className={`rounded px-1.5 py-0.5 font-medium transition-colors ${
                    taxMode === "CGST_SGST"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  CGST+SGST
                </button>
                <button
                  type="button"
                  onClick={() => onTaxModeChange("IGST")}
                  className={`rounded px-1.5 py-0.5 font-medium transition-colors ${
                    taxMode === "IGST"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  IGST
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-medium text-text-muted">
                {taxMode === "IGST" ? "IGST (Inter-state)" : "CGST + SGST (Intra-state)"}
              </span>
            )}
          </div>

          {/* Tax Components */}
          <div className="space-y-1.5 text-xs pt-1 border-t border-border/50">
            {taxMode === "CGST_SGST" ? (
              <>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Central GST (CGST)</span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {formatCurrencyExact(halfTax)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>State GST (SGST)</span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {formatCurrencyExact(otherHalf)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between text-text-secondary">
                <span>Integrated GST (IGST)</span>
                <span className="font-medium text-text-primary tabular-nums">
                  {formatCurrencyExact(totals.tax)}
                </span>
              </div>
            )}

            {/* Slabs breakdown if tax > 0 */}
            {slabs.length > 0 && slabs.some((s) => s.tax > 0) && (
              <div className="pt-2 mt-2 border-t border-border/40 space-y-1">
                <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                  Rate Slabs
                </div>
                {slabs.map((slab) => (
                  <div
                    key={slab.rate}
                    className="flex items-center justify-between text-[11px] text-text-secondary"
                  >
                    <span>
                      GST @ {slab.rate}% (on {formatCurrencyExact(slab.taxable)})
                    </span>
                    <span className="font-medium text-text-primary tabular-nums">
                      {formatCurrencyExact(slab.tax)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Total - Pinned to bottom to match Additional Information height */}
      <div className="border-t border-border pt-4 mt-6 flex items-baseline justify-between">
        <span className="font-heading text-base font-semibold text-text-primary">Total Amount</span>
        <span className="font-heading text-2xl font-bold tracking-tight text-primary-light tabular-nums">
          {formatCurrencyExact(totals.total)}
        </span>
      </div>
    </section>
  );
};
