import { notFound } from "next/navigation";
import { getCustomer } from "@/features/customers/data/queries/get-customer";
import { CustomerDetailPage } from "@/features/customers/presentation/page/CustomerDetailPage";

export const dynamic = "force-dynamic";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  const customer = await getCustomer(resolvedParams.id);

  if (!customer) {
    notFound();
  }

  return <CustomerDetailPage customer={customer} />;
}
