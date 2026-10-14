import { BadgePercent, Tag, Truck } from "lucide-react";
import type { ChangeEvent } from "react";
import { Input, Label, Select } from "@/shared/components/form";

type AdditionalChargesAndDiscountSectionProps = {
  additionalCharges: number;
  onAdditionalChargesChange: (val: number) => void;
  additionalChargesLabel: string;
  onAdditionalChargesLabelChange: (val: string) => void;
  additionalDiscount: number;
  onAdditionalDiscountChange: (val: number) => void;
  additionalDiscountType: "percentage" | "fixed";
  onAdditionalDiscountTypeChange: (val: "percentage" | "fixed") => void;
  additionalDiscountLabel: string;
  onAdditionalDiscountLabelChange: (val: string) => void;
};

export const AdditionalChargesAndDiscountSection = ({
  additionalCharges,
  onAdditionalChargesChange,
  additionalChargesLabel,
  onAdditionalChargesLabelChange,
  additionalDiscount,
  onAdditionalDiscountChange,
  additionalDiscountType,
  onAdditionalDiscountTypeChange,
  additionalDiscountLabel,
  onAdditionalDiscountLabelChange,
}: AdditionalChargesAndDiscountSectionProps) => {
  const handleChargesInput = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.target.value);
    onAdditionalChargesChange(Number.isNaN(parsed) || parsed < 0 ? 0 : parsed);
  };

  const handleDiscountInput = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.target.value);
    onAdditionalDiscountChange(Number.isNaN(parsed) || parsed < 0 ? 0 : parsed);
  };

  return (
    <section className="flex h-full flex-col justify-between rounded-xl border border-border bg-surface-card p-5 sm:p-6 transition-colors">
      <div className="flex h-full flex-col">
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
            aria-hidden="true"
          >
            <BadgePercent size={19} />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight text-text-primary">
              Additional Charges &amp; Discount
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Add delivery fees, packaging charges, or apply an overall invoice discount.
            </p>
          </div>
        </div>

        {/* Two balanced panels: Charges on Left, Discount on Right */}
        <div className="mt-5 grid flex-1 grid-cols-1 gap-5 md:grid-cols-2">
          {/* Panel 1: Additional Charges */}
          <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-surface-alt/40 p-4">
            <div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-primary-light" />
                <h3 className="text-sm font-semibold text-text-primary">Additional Charges</h3>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">
                Shipping, handling, packaging, or extra service fees.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <Label
                    htmlFor="additional-charges-label"
                    className="mb-1.5 block text-xs font-medium text-text-secondary"
                  >
                    Charge Description
                  </Label>
                  <Input
                    id="additional-charges-label"
                    type="text"
                    value={additionalChargesLabel}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      onAdditionalChargesLabelChange(e.target.value)
                    }
                    placeholder="e.g. Shipping / Delivery"
                    className="h-9 px-3 text-sm"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="additional-charges-amount"
                    className="mb-1.5 block text-xs font-medium text-text-secondary"
                  >
                    Amount (₹)
                  </Label>
                  <Input
                    id="additional-charges-amount"
                    type="number"
                    min="0"
                    step="any"
                    value={additionalCharges === 0 ? "" : additionalCharges}
                    onChange={handleChargesInput}
                    placeholder="0.00"
                    startIcon={<span className="text-xs">₹</span>}
                    className="h-9 text-sm tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-text-muted">Presets:</span>
              {["Shipping", "Packaging", "Handling", "Delivery"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onAdditionalChargesLabelChange(preset)}
                  className="rounded-md border border-border/70 bg-surface px-2 py-0.5 text-[11px] text-text-secondary hover:border-primary-light hover:text-text-primary transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Panel 2: Additional Discount */}
          <div className="flex flex-col justify-between rounded-lg border border-border/70 bg-surface-alt/40 p-4">
            <div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-primary-light" />
                <h3 className="text-sm font-semibold text-text-primary">Additional Discount</h3>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">
                Apply a flat amount or percentage discount to the invoice.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <Label
                    htmlFor="additional-discount-label"
                    className="mb-1.5 block text-xs font-medium text-text-secondary"
                  >
                    Discount Reason
                  </Label>
                  <Input
                    id="additional-discount-label"
                    type="text"
                    value={additionalDiscountLabel}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      onAdditionalDiscountLabelChange(e.target.value)
                    }
                    placeholder="e.g. Seasonal Offer / Promo"
                    className="h-9 px-3 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label
                      htmlFor="additional-discount-type"
                      className="mb-1.5 block text-xs font-medium text-text-secondary"
                    >
                      Type
                    </Label>
                    <Select
                      id="additional-discount-type"
                      value={additionalDiscountType}
                      onChange={(val) =>
                        onAdditionalDiscountTypeChange(
                          val as "percentage" | "fixed",
                        )
                      }
                      className="h-9 text-xs"
                    >
                      <option value="fixed">Fixed (₹)</option>
                      <option value="percentage">Percent (%)</option>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="additional-discount-amount"
                      className="mb-1.5 block text-xs font-medium text-text-secondary"
                    >
                      {additionalDiscountType === "percentage" ? "Rate (%)" : "Amount (₹)"}
                    </Label>
                    <Input
                      id="additional-discount-amount"
                      type="number"
                      min="0"
                      max={additionalDiscountType === "percentage" ? "100" : undefined}
                      step="any"
                      value={additionalDiscount === 0 ? "" : additionalDiscount}
                      onChange={handleDiscountInput}
                      placeholder="0.00"
                      className="h-9 px-3 text-sm tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-text-muted">Presets:</span>
              {["Special Offer", "VIP Client", "Year-End Discount"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onAdditionalDiscountLabelChange(preset)}
                  className="rounded-md border border-border/70 bg-surface px-2 py-0.5 text-[11px] text-text-secondary hover:border-primary-light hover:text-text-primary transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
