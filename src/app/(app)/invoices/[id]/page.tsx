import { notFound } from "next/navigation";
import { getInvoiceById } from "@/features/invoices/data/queries/get-invoice-by-id";
import { getCreditNotes } from "@/features/credit-notes/data/queries/get-credit-notes";
import { InvoiceDetailPage } from "@/features/invoices/presentation/page/InvoiceDetailPage";

export const dynamic = "force-dynamic";

type InvoiceDetailRouteProps = {
  params: Promise<{ id: string }> | { id: string };
};

const InvoiceDetailRoute = async ({ params }: InvoiceDetailRouteProps) => {
  const resolvedParams = await params;
  const invoice = await getInvoiceById(resolvedParams.id);

  if (!invoice) {
    notFound();
  }

  const { creditNotes } = await getCreditNotes({ invoiceId: invoice.id });
  const relatedCreditNotes = creditNotes.map((cn) => ({
    id: cn.id,
    creditNoteNumber: cn.creditNoteNumber,
    issueDate: cn.issueDate,
    total: cn.total,
    status: cn.status,
  }));

  return (
    <InvoiceDetailPage
      initialInvoice={invoice}
      relatedCreditNotes={relatedCreditNotes}
    />
  );
};

export default InvoiceDetailRoute;

