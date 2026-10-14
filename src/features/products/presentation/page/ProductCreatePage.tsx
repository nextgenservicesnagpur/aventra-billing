"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ProductType } from "../../domain/entities/product";
import { ProductForm } from "../forms/ProductForm";

export type ProductCreatePageProps = {
  type?: ProductType;
};

export const ProductCreatePage = ({ type = "PRODUCT" }: ProductCreatePageProps) => {
  const isService = type === "SERVICE";
  const backHref = isService ? "/services" : "/products";
  const title = isService ? "Add Service" : "Add Product";
  const subtitle = isService
    ? "Create a service record for invoicing and account management."
    : "Create a product record for catalogue management and inventory tracking.";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="space-y-1">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to {isService ? "Services" : "Products"}</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="text-xs text-text-secondary">{subtitle}</p>
      </div>

      {/* Main Form */}
      <ProductForm defaultType={type} lockType={true} />
    </div>
  );
};
