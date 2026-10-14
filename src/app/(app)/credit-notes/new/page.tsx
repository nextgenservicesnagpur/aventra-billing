import { getEligibleInvoicesForCredit } from "@/features/credit-notes/data/queries/get-eligible-invoices-for-credit";
import { getCreditNoteById } from "@/features/credit-notes/data/queries/get-credit-note-by-id";
import { getBillingSettings } from "@/features/billing-settings/data/queries/get-billing-settings";
import { getSupplierTaxContext } from "@/features/invoices/data/queries/get-supplier-tax-context";
import { CreditNoteCreatePage } from "@/features/credit-notes/presentation/page/CreditNoteCreatePage";

export const dynamic = "force-dynamic";

type NewCreditNotePageProps = {
  searchParams?:
    | Promise<{ invoiceId?: string; edit?: string }>
    | { invoiceId?: string; edit?: string };
};

const NewCreditNotePage = async ({ searchParams }: NewCreditNotePageProps) => {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const rawInvoiceId = resolvedParams?.invoiceId;
  const editId = resolvedParams?.edit;

  const [existingCreditNote, billingSettings, supplierTax] = await Promise.all([
    editId ? getCreditNoteById(editId) : Promise.resolve(null),
    getBillingSettings("CREDIT_NOTE"),
    getSupplierTaxContext(),
  ]);

  const eligibleInvoices = await getEligibleInvoicesForCredit({
    includeInvoiceId: existingCreditNote?.invoiceId,
  });

  // Authoritative server-side validation of preselected invoice parameter
  const validPreselectedId =
    rawInvoiceId && eligibleInvoices.some((inv) => inv.id === rawInvoiceId)
      ? rawInvoiceId
      : undefined;

  return (
    <CreditNoteCreatePage
      eligibleInvoices={eligibleInvoices}
      preselectedInvoiceId={validPreselectedId}
      previewCreditNoteNumber={billingSettings.previewNumber}
      initialDefaultNotes={billingSettings.defaultNotes || ""}
      initialDefaultTerms={billingSettings.defaultTerms || ""}
      supplierName={supplierTax.organizationName}
      existingCreditNote={existingCreditNote ?? undefined}
    />
  );
};

export default NewCreditNotePage;
