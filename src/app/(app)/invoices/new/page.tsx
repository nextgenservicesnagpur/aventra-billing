import { getCustomers } from "@/features/customers/data/queries/get-customers";
import { getProducts } from "@/features/products/data/queries/get-products";
import { getSupplierTaxContext } from "@/features/invoices/data/queries/get-supplier-tax-context";
import { getBillingSettings } from "@/features/billing-settings/data/queries/get-billing-settings";
import { getInvoiceById } from "@/features/invoices/data/queries/get-invoice-by-id";
import { InvoiceCreatePage } from "@/features/invoices/presentation/page/InvoiceCreatePage";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string }> | { edit?: string };
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const editId = resolvedParams?.edit;

  const [{ customers }, { products }, supplierTax, invoiceSettings, existingInvoice] =
    await Promise.all([
      getCustomers(),
      getProducts({ status: "ACTIVE" }),
      getSupplierTaxContext(),
      getBillingSettings("INVOICE"),
      editId ? getInvoiceById(editId) : Promise.resolve(null),
    ]);

  return (
    <InvoiceCreatePage
      initialCustomers={customers}
      initialProducts={products}
      supplierState={supplierTax.state}
      supplierGstin={supplierTax.gstNumber}
      supplierName={supplierTax.organizationName}
      initialDefaultNotes={invoiceSettings.defaultNotes || ""}
      initialDefaultTerms={invoiceSettings.defaultTerms || ""}
      initialInvoiceNumber={invoiceSettings.previewNumber}
      initialInvoice={existingInvoice ?? undefined}
    />
  );
}
