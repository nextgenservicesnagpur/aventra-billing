"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ProductDto } from "../../data/dto/product-dto";
import { ProductForm } from "../forms/ProductForm";

export type ProductEditPageProps = {
  product: ProductDto;
};

export const ProductEditPage = ({ product }: ProductEditPageProps) => {
  const isService = product.type === "SERVICE";
  const backHref = isService ? `/services/${product.id}` : `/products/${product.id}`;
  const title = isService ? `Edit Service` : `Edit Product`;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="space-y-1">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Details</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="text-xs text-text-secondary">
          Update the item&apos;s details, pricing, and settings.
        </p>
      </div>

      {/* Main form */}
      <ProductForm initialData={product} isEdit={true} defaultType={product.type} />
    </div>
  );
};
