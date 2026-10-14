import { notFound } from "next/navigation";
import { getCustomer } from "@/features/customers/data/queries/get-customer";
import { CustomerCreatePage } from "@/features/customers/presentation/page/CustomerCreatePage";

export const dynamic = "force-dynamic";

export default async function CustomerEditRoute({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  const customer = await getCustomer(resolvedParams.id);

  if (!customer) {
    notFound();
  }

  return <CustomerCreatePage initialData={customer} isEdit />;
}
