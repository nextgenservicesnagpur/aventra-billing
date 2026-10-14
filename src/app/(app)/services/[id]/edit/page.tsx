import { notFound } from "next/navigation";
import { getProductById } from "@/features/products/data/queries/get-product-by-id";
import { ProductEditPage } from "@/features/products/presentation/page/ProductEditPage";

export const dynamic = "force-dynamic";

export default async function ServiceEditRoutePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductEditPage product={product} />;
}
