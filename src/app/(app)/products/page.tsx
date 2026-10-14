import { getProducts } from "@/features/products/data/queries/get-products";
import { ProductListPage } from "@/features/products/presentation/page/ProductListPage";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { products } = await getProducts({ type: "PRODUCT" });

  return <ProductListPage initialProducts={products} itemType="PRODUCT" />;
}
