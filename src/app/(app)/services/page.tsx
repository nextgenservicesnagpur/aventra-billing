import { getProducts } from "@/features/products/data/queries/get-products";
import { ProductListPage } from "@/features/products/presentation/page/ProductListPage";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const { products } = await getProducts({ type: "SERVICE" });

  return <ProductListPage initialProducts={products} itemType="SERVICE" />;
}
