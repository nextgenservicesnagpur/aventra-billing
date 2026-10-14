import {
  calculateCreditNoteTotals,
  formatCreditNoteCurrency,
  formatCreditNoteDate,
  lineSubtotal,
  type CreditNote,
} from "../../domain/credit-note";

export const CreditNoteDocument = ({
  creditNote,
  supplierName,
}: {
  creditNote: CreditNote;
  supplierName?: string;
}) => {
  const totals = calculateCreditNoteTotals(creditNote);

  return (
    <article
      className="overflow-hidden rounded-2xl bg-doc-paper text-doc-ink shadow-xl border border-doc-line/40"
      aria-label={`Credit note ${creditNote.creditNoteNumber} document`}
    >
      {/* Header */}
      <div className="bg-doc-header px-6 py-7 text-doc-header-text sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-doc-faint">
            {supplierName || "Aventra Billing"}
          </p>
          <span className="rounded-md border border-doc-line/60 bg-doc-paper/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-doc-faint">
            Credit Note · {creditNote.status}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold">{creditNote.creditNoteNumber}</h2>
            <p className="mt-1 text-xs text-doc-faint">
              Reason: {creditNote.reason}
            </p>
          </div>
          <p className="text-sm text-doc-faint">
            Issued {formatCreditNoteDate(creditNote.issueDate)}
          </p>
        </div>
      </div>

      {/* Parties & References */}
      <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-10 border-b border-doc-line">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-doc-muted">
            Credited to
          </p>
          <p className="mt-2 font-semibold">{creditNote.customerName}</p>
          {creditNote.customerEmail && (
            <p className="text-sm text-doc-muted">{creditNote.customerEmail}</p>
          )}
          {creditNote.customerAddress && (
            <p className="text-sm text-doc-muted">{creditNote.customerAddress}</p>
          )}
          {creditNote.customerGstin && (
            <p className="text-sm text-doc-muted">GSTIN: {creditNote.customerGstin}</p>
          )}
          {creditNote.customerPlaceOfSupply && (
            <p className="text-sm text-doc-muted">
              Place of Supply: {creditNote.customerPlaceOfSupply}
            </p>
          )}
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-doc-muted">
            Original Invoice Reference
          </p>
          <p className="mt-2 text-base font-bold text-doc-ink">
            {creditNote.invoiceNumber || creditNote.invoiceId}
          </p>
          <p className="mt-1 text-xs text-doc-muted">
            Tax Treatment: {creditNote.taxMode === "IGST" ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto px-6 sm:px-10">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-doc-line text-left text-xs uppercase tracking-widest text-doc-muted">
              <th className="py-3">Item / Description</th>
              <th className="py-3 text-right">Qty</th>
              <th className="py-3 text-right">Rate</th>
              <th className="py-3 text-right">Discount</th>
              <th className="py-3 text-right">Tax Rate</th>
              <th className="py-3 text-right">Credit Amount</th>
            </tr>
          </thead>
          <tbody>
            {creditNote.items.map((line) => (
              <tr key={line.id} className="border-b border-doc-line">
                <td className="py-4">
                  <p className="font-semibold">{line.item}</p>
                  {line.description && (
                    <p className="text-xs text-doc-muted">{line.description}</p>
                  )}
                  {line.hsnSac && (
                    <p className="text-[11px] text-doc-faint">HSN/SAC: {line.hsnSac}</p>
                  )}
                </td>
                <td className="py-4 text-right tabular-nums">{line.quantity}</td>
                <td className="py-4 text-right tabular-nums">
                  {formatCreditNoteCurrency(line.unitPrice)}
                </td>
                <td className="py-4 text-right tabular-nums">
                  {line.discount > 0 ? `${line.discount}%` : "—"}
                </td>
                <td className="py-4 text-right tabular-nums">{line.taxRate}%</td>
                <td className="py-4 text-right font-semibold tabular-nums">
                  {formatCreditNoteCurrency(lineSubtotal(line))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="ml-auto max-w-sm space-y-3 px-6 py-7 sm:px-10">
        <div className="flex justify-between text-sm text-doc-muted">
          <span>Subtotal</span>
          <span>{formatCreditNoteCurrency(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-sm text-doc-muted">
            <span>Discount</span>
            <span>−{formatCreditNoteCurrency(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-doc-muted">
          <span>Taxable Value</span>
          <span>{formatCreditNoteCurrency(totals.taxable)}</span>
        </div>
        {creditNote.taxMode === "IGST" ? (
          <div className="flex justify-between text-sm text-doc-muted">
            <span>IGST</span>
            <span>{formatCreditNoteCurrency(totals.igst)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm text-doc-muted">
              <span>CGST</span>
              <span>{formatCreditNoteCurrency(totals.cgst)}</span>
            </div>
            <div className="flex justify-between text-sm text-doc-muted">
              <span>SGST</span>
              <span>{formatCreditNoteCurrency(totals.sgst)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between rounded-xl bg-doc-total-band px-4 py-4 text-lg font-bold">
          <span>Total Credit</span>
          <span>{formatCreditNoteCurrency(totals.total)}</span>
        </div>
      </div>

      {/* Notes & Terms */}
      {(creditNote.notes || creditNote.terms) && (
        <div className="grid gap-5 border-t border-doc-line bg-doc-card px-6 py-6 text-sm sm:grid-cols-2 sm:px-10">
          <div>
            <p className="font-semibold">Notes</p>
            <p className="mt-1 text-doc-muted">{creditNote.notes || "—"}</p>
          </div>
          <div>
            <p className="font-semibold">Terms</p>
            <p className="mt-1 text-doc-muted">{creditNote.terms || "—"}</p>
          </div>
        </div>
      )}
    </article>
  );
};
