import { getCustomers } from "@/features/customers/data/queries/get-customers";
import { CustomerListPage } from "@/features/customers/presentation/page/CustomerListPage";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const { customers } = await getCustomers();

  return <CustomerListPage initialCustomers={customers} />;
}
