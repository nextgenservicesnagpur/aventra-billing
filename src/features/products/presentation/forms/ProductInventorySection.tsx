"use client";

import { Boxes, Info } from "lucide-react";
import { Checkbox, Input, Label } from "@/shared/components/form";

export type ProductInventorySectionProps = {
  trackInventory: boolean;
  onTrackInventoryChange: (val: boolean) => void;
  reorderPoint: number | string;
  onReorderPointChange: (val: string) => void;
  errors?: Record<string, string>;
};

export const ProductInventorySection = ({
  trackInventory,
  onTrackInventoryChange,
  reorderPoint,
  onReorderPointChange,
  errors = {},
}: ProductInventorySectionProps) => {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-primary-light">
          <Boxes size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Inventory Settings
          </h2>
          <p className="text-xs text-text-secondary">
            Configure stock tracking preferences and low-stock reorder thresholds.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Track Inventory toggle without unnecessary outer box */}
        <label
          htmlFor="track-inventory"
          className="flex cursor-pointer items-start gap-3"
        >
          <Checkbox
            id="track-inventory"
            checked={trackInventory}
            onChange={(e) => onTrackInventoryChange(e.target.checked)}
            className="mt-0.5"
          />
          <div className="space-y-0.5 select-none">
            <span className="text-sm font-medium text-text-primary">
              Enable Inventory Tracking for this Product
            </span>
            <p className="text-xs text-text-secondary">
              Track stock levels, reorder points, and physical quantities across warehouses.
            </p>
          </div>
        </label>

        {trackInventory && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
            {/* Reorder Point */}
            <div className="space-y-1.5">
              <Label htmlFor="reorder-point" className="text-xs">
                Low Stock Alert Threshold (Reorder Point)
              </Label>
              <Input
                id="reorder-point"
                type="number"
                min="0"
                step="1"
                value={reorderPoint}
                onChange={(e) => onReorderPointChange(e.target.value)}
                placeholder="e.g., 10"
                aria-invalid={Boolean(errors.reorderPoint)}
                className="h-10 text-sm"
              />
              {errors.reorderPoint && (
                <p className="text-xs text-danger" role="alert">
                  {errors.reorderPoint}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
          <Info size={14} className="shrink-0 text-text-muted" />
          <span>
            Opening stock balances and adjustments are recorded through authorized inventory stock movements.
          </span>
        </div>
      </div>
    </section>
  );
};
