import { notFound } from "next/navigation";
import { getProductById } from "@/features/products/data/queries/get-product-by-id";
import { ProductDetailPage } from "@/features/products/presentation/page/ProductDetailPage";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailPage product={product} />;
}
