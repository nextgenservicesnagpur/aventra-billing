import { getInvoices } from "@/features/invoices/data/queries/get-invoices";
import { InvoiceListPage } from "@/features/invoices/presentation/page/InvoiceListPage";

export const dynamic = "force-dynamic";

export default async function InvoicesRoute() {
  const { invoices } = await getInvoices();
  return <InvoiceListPage initialInvoices={invoices} />;
}
