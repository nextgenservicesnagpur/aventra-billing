import { notFound } from "next/navigation";
import { getCreditNoteById } from "@/features/credit-notes/data/queries/get-credit-note-by-id";
import { getSupplierTaxContext } from "@/features/invoices/data/queries/get-supplier-tax-context";
import { CreditNoteDetailPage } from "@/features/credit-notes/presentation/page/CreditNoteDetailPage";

export const dynamic = "force-dynamic";

type CreditNoteDetailRouteProps = {
  params: Promise<{ id: string }> | { id: string };
};

const CreditNoteDetailRoute = async ({ params }: CreditNoteDetailRouteProps) => {
  const resolvedParams = await params;
  const [creditNote, supplierTax] = await Promise.all([
    getCreditNoteById(resolvedParams.id),
    getSupplierTaxContext(),
  ]);

  if (!creditNote) {
    notFound();
  }

  return (
    <CreditNoteDetailPage
      initialCreditNote={creditNote}
      supplierName={supplierTax.organizationName}
    />
  );
};

export default CreditNoteDetailRoute;
