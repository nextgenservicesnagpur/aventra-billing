import { Layers, Plus, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import type { InvoiceLineItem } from "../../domain/invoice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/table";
import { Button, Input, Select } from "@/shared/components/form";

export type SampleProduct = {
  item: string;
  description: string;
  hsnSac: string;
  unitPrice: number;
  taxRate: number;
};

export const sampleProducts: SampleProduct[] = [
  { item: "Enterprise cloud integration", description: "Architecture and migration support", hsnSac: "998313", unitPrice: 125000, taxRate: 18 },
  { item: "Custom software maintenance", description: "Q1 infrastructure SLA", hsnSac: "998314", unitPrice: 85600, taxRate: 18 },
  { item: "Cross-border export logistics", description: "Maritime dispatch clearance", hsnSac: "996511", unitPrice: 248450, taxRate: 18 },
  { item: "POS modernization sprint", description: "Omnichannel inventory sync", hsnSac: "998319", unitPrice: 67230, taxRate: 18 },
  { item: "Brand strategy workshop", description: "Discovery and positioning workshop", hsnSac: "998311", unitPrice: 50000, taxRate: 18 },
  { item: "Product design sprint", description: "UX direction and prototype", hsnSac: "998312", unitPrice: 60000, taxRate: 18 },
  { item: "Cloud security audit", description: "SOC2 compliance review", hsnSac: "998315", unitPrice: 94500, taxRate: 18 },
];

const formatCurrencyExact = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

import type { ProductDto } from "@/features/products/data/dto/product-dto";

type InvoiceItemsSectionProps = {
  items: InvoiceLineItem[];
  onUpdateLine: (id: string, patch: Partial<InvoiceLineItem>) => void;
  onAddLine: () => void;
  onRemoveLine: (id: string) => void;
  availableProducts?: ProductDto[];
  errors?: Record<string, string>;
};

export const InvoiceItemsSection = ({
  items,
  onUpdateLine,
  onAddLine,
  onRemoveLine,
  availableProducts,
  errors = {},
}: InvoiceItemsSectionProps) => {
  const isCatalogueProvided = availableProducts !== undefined;
  const hasLiveCatalogue = Boolean(availableProducts && availableProducts.length > 0);
  const productsList = availableProducts ?? [];

  const handleSelectProduct = (lineId: string, productName: string) => {
    if (!productName) {
      onUpdateLine(lineId, { item: "", description: "", hsnSac: "", unitPrice: 0, taxRate: 0 });
      return;
    }

    if (isCatalogueProvided) {
      const realItem = productsList.find((p) => p.name === productName);
      if (realItem) {
        onUpdateLine(lineId, {
          item: realItem.name,
          description: realItem.description || realItem.name,
          hsnSac: realItem.hsnSac || "",
          unitPrice: realItem.sellingPrice,
          taxRate: realItem.taxRate,
        });
        return;
      }
      onUpdateLine(lineId, { item: productName });
      return;
    }

    const found = sampleProducts.find((p) => p.item === productName);
    if (found) {
      onUpdateLine(lineId, {
        item: found.item,
        description: found.description,
        hsnSac: found.hsnSac,
        unitPrice: found.unitPrice,
        taxRate: found.taxRate,
      });
    } else {
      onUpdateLine(lineId, { item: productName });
    }
  };


  return (
    <section className="rounded-xl border border-border bg-surface-card p-5 sm:p-6 transition-colors">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-alt/70 text-primary-light"
          aria-hidden="true"
        >
          <Layers size={19} />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight text-text-primary">
            Items
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">
            Add products or services to this invoice.
          </p>
        </div>
      </div>

      {errors.items && (
        <p className="mt-3 text-xs text-danger" role="alert">
          {errors.items}
        </p>
      )}

      {/* Items Entry Table with Proportional Balanced Column Widths */}
      <div className="mt-5">
        <Table className="min-w-[860px] table-fixed text-xs">
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-[4%] min-w-[36px] pb-3 text-center">
                #
              </TableHead>
              <TableHead scope="col" className="w-[36%] min-w-[240px] pb-3 pr-3">
                Item / Description
              </TableHead>
              <TableHead scope="col" className="w-[11%] min-w-[100px] pb-3 pr-3">
                HSN / SAC
              </TableHead>
              <TableHead scope="col" className="w-[8%] min-w-[75px] pb-3 pr-3 text-center">
                Qty
              </TableHead>
              <TableHead scope="col" className="w-[13%] min-w-[120px] pb-3 pr-3">
                Unit Price
              </TableHead>
              <TableHead scope="col" className="w-[8%] min-w-[80px] pb-3 pr-3">
                Discount
              </TableHead>
              <TableHead scope="col" className="w-[9%] min-w-[90px] pb-3 pr-3">
                Tax
              </TableHead>
              <TableHead scope="col" className="w-[11%] min-w-[110px] pb-3 pr-3 text-right">
                Amount
              </TableHead>
              <TableHead scope="col" className="w-[4%] min-w-[40px] pb-3 text-center">
                <span className="sr-only">Row action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((line, index) => {
              const subtotal = line.quantity * line.unitPrice;
              const taxable = subtotal * (1 - line.discount / 100);
              const lineTax = taxable * (line.taxRate / 100);
              const lineTotal = taxable + lineTax;

              const isMatchedItem = isCatalogueProvided
                ? productsList.some((p) => p.name === line.item)
                : sampleProducts.some((p) => p.item === line.item);

              return (
                <TableRow key={line.id} className="align-top hover:bg-surface-alt/30 transition-colors">
                  {/* # */}
                  <TableCell className="py-3.5 text-center font-medium text-text-secondary pt-5">
                    {index + 1}
                  </TableCell>

                  {/* ITEM / DESCRIPTION */}
                  <TableCell className="py-3.5 pr-3">
                    <div className="space-y-1.5">
                      <Select
                        aria-label={`Select product or service for item ${index + 1}`}
                        value={isMatchedItem ? line.item : line.item ? "__custom__" : ""}
                        onChange={(val) => {
                          if (val === "__custom__") {
                            onUpdateLine(line.id, { item: "Custom Service" });
                          } else {
                            handleSelectProduct(line.id, val);
                          }
                        }}
                        placeholder="Search product or service..."
                        className="h-9 text-xs"
                      >
                        <option value="">Search product or service...</option>
                        {hasLiveCatalogue ? (
                          productsList.map((p) => (
                            <option key={p.id} value={p.name}>
                              {`[${p.type === "PRODUCT" ? "Product" : "Service"}] ${p.name}${p.sku ? ` (${p.sku})` : ""} — ₹${p.sellingPrice}${p.unit ? ` / ${p.unit}` : ""}`}
                            </option>
                          ))
                        ) : isCatalogueProvided ? (
                          <option value="__no_items__" disabled>
                            No products or services in catalogue
                          </option>
                        ) : (
                          sampleProducts.map((p) => (
                            <option key={p.item} value={p.item}>
                              {p.item}
                            </option>
                          ))
                        )}
                        <option value="__custom__">Custom product/service...</option>
                      </Select>

                      {!isMatchedItem && line.item !== "" && (
                        <Input
                          type="text"
                          aria-label={`Item or service name for item ${index + 1}`}
                          value={line.item}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onUpdateLine(line.id, { item: e.target.value })
                          }
                          placeholder="Item name"
                          className="h-8 px-2.5 text-xs"
                        />
                      )}

                      <Input
                        type="text"
                        aria-label={`Description for item ${index + 1}`}
                        value={line.description}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          onUpdateLine(line.id, { description: e.target.value })
                        }
                        placeholder="Add a description (optional)"
                        className="h-8 px-2.5 text-xs text-text-secondary"
                      />

                      {(errors[`item-${index}`] || errors[`items.${index}.item`]) && (
                        <p className="text-[11px] text-danger" role="alert">
                          {errors[`item-${index}`] || errors[`items.${index}.item`]}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* HSN / SAC */}
                  <TableCell className="py-3.5 pr-3 pt-4">
                    <Input
                      type="text"
                      aria-label={`HSN or SAC code for item ${index + 1}`}
                      value={line.hsnSac || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onUpdateLine(line.id, { hsnSac: e.target.value })
                      }
                      placeholder="123456"
                      className="h-9 px-2.5 text-xs"
                    />
                  </TableCell>

                  {/* QTY */}
                  <TableCell className="py-3.5 pr-3 pt-4">
                    <Input
                      type="number"
                      aria-label={`Quantity for item ${index + 1}`}
                      min="1"
                      step="1"
                      value={line.quantity}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onUpdateLine(line.id, {
                          quantity: Math.max(1, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="h-9 px-2 text-center text-xs"
                    />
                    {(errors[`quantity-${index}`] || errors[`items.${index}.quantity`]) && (
                      <p className="mt-1 text-[11px] text-danger" role="alert">
                        {errors[`quantity-${index}`] || errors[`items.${index}.quantity`]}
                      </p>
                    )}
                  </TableCell>

                  {/* UNIT PRICE */}
                  <TableCell className="py-3.5 pr-3 pt-4">
                    <Input
                      type="number"
                      aria-label={`Unit price for item ${index + 1}`}
                      min="0"
                      step="0.01"
                      value={line.unitPrice === 0 ? "0.00" : line.unitPrice}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onUpdateLine(line.id, {
                          unitPrice: Math.max(0, parseFloat(e.target.value) || 0),
                        })
                      }
                      placeholder="0.00"
                      startIcon={<span className="text-xs">₹</span>}
                      className="h-9 text-xs tabular-nums"
                    />
                    {(errors[`price-${index}`] || errors[`items.${index}.unitPrice`]) && (
                      <p className="mt-1 text-[11px] text-danger" role="alert">
                        {errors[`price-${index}`] || errors[`items.${index}.unitPrice`]}
                      </p>
                    )}
                  </TableCell>

                  {/* DISCOUNT */}
                  <TableCell className="py-3.5 pr-3 pt-4">
                    <div className="relative">
                      <Input
                        type="number"
                        aria-label={`Discount percentage for item ${index + 1}`}
                        min="0"
                        max="100"
                        step="1"
                        value={line.discount}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          onUpdateLine(line.id, {
                            discount: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                          })
                        }
                        className="h-9 pr-6 text-xs tabular-nums"
                      />
                      <span
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted"
                        aria-hidden="true"
                      >
                        %
                      </span>
                    </div>
                  </TableCell>

                  {/* TAX */}
                  <TableCell className="py-3.5 pr-3 pt-4">
                    <Select
                      aria-label={`Tax rate for item ${index + 1}`}
                      value={String(line.taxRate)}
                      onChange={(val) =>
                        onUpdateLine(line.id, { taxRate: parseFloat(val) || 0 })
                      }
                      className="h-9 text-xs"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </Select>
                  </TableCell>

                  {/* AMOUNT */}
                  <TableCell className="py-3.5 pr-3 pt-5 text-right font-medium text-text-primary whitespace-nowrap text-xs sm:text-sm tabular-nums">
                    {formatCurrencyExact(lineTotal)}
                  </TableCell>

                  {/* REMOVE ACTION */}
                  <TableCell className="py-3.5 text-center pt-4">
                    <button
                      type="button"
                      aria-label={`Remove item ${index + 1}`}
                      onClick={() => onRemoveLine(line.id)}
                      disabled={items.length <= 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-alt hover:text-danger disabled:pointer-events-none disabled:opacity-25 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add Item button */}
      <Button
        variant="secondary"
        onClick={onAddLine}
        className="mt-4 px-3.5 py-2 text-xs"
      >
        <Plus size={14} className="text-primary-light" />
        <span>Add Item</span>
      </Button>
    </section>
  );
};
