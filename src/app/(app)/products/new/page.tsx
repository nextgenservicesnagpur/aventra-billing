import { ProductCreatePage } from "@/features/products/presentation/page/ProductCreatePage";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return <ProductCreatePage type="PRODUCT" />;
}
