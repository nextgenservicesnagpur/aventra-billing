"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerForm } from "../forms/CustomerForm";
import type { CustomerDto } from "../../data/dto/customer-dto";

export type CustomerCreatePageProps = {
  initialData?: CustomerDto | null;
  isEdit?: boolean;
};

export const CustomerCreatePage = ({
  initialData,
  isEdit = false,
}: CustomerCreatePageProps) => {
  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="space-y-1">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Customers</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {isEdit ? "Edit Customer" : "Add Customer"}
        </h1>
        <p className="text-xs text-text-secondary">
          {isEdit
            ? "Update the customer's details and settings."
            : "Create a customer record for invoicing and account management."}
        </p>
      </div>

      {/* Main Form */}
      <CustomerForm initialData={initialData} isEdit={isEdit} />
    </div>
  );
};
