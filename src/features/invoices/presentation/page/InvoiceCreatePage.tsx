"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Eye, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateDueDate,
  calculateInvoiceTotals,
  getTodayDateString,
  validateInvoice,
  type Invoice,
  type InvoiceLineItem,
} from "../../domain/invoice";
import { determineTaxMode } from "../../domain/rules/tax-rules";
import { useInvoiceWorkspace } from "../hooks/InvoiceWorkspaceProvider";
import { InvoiceDocument } from "../components/InvoiceDocument";
import { CustomerSection, type SampleCustomer } from "../components/CustomerSection";
import { InvoiceItemsSection } from "../components/InvoiceItemsSection";
import { InvoiceSummarySection } from "../components/InvoiceSummarySection";
import { AdditionalInfoSection } from "../components/AdditionalInfoSection";
import { AdditionalChargesAndDiscountSection } from "../components/AdditionalChargesAndDiscountSection";
import { createInvoiceAction, updateInvoiceAction } from "../../data/mutations/invoice-mutations";
import type { CustomerDto } from "@/features/customers/data/dto/customer-dto";
import type { ProductDto } from "@/features/products/data/dto/product-dto";
import { formatCustomerAddress } from "@/features/customers/domain/entities/customer";

const initialLine = (id = "line-1"): InvoiceLineItem => ({
  id,
  item: "",
  description: "",
  hsnSac: "",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  taxRate: 18,
});

export type InvoiceCreatePageProps = {
  initialCustomers?: CustomerDto[];
  initialProducts?: ProductDto[];
  supplierState?: string;
  supplierGstin?: string;
  supplierName?: string;
  initialDefaultNotes?: string;
  initialDefaultTerms?: string;
  initialInvoiceNumber?: string;
  initialInvoice?: Invoice;
};

export const InvoiceCreatePage = ({
  initialCustomers = [],
  initialProducts = [],
  supplierState = "27-Maharashtra",
  supplierGstin,
  supplierName,
  initialDefaultNotes = "",
  initialDefaultTerms = "",
  initialInvoiceNumber,
  initialInvoice,
}: InvoiceCreatePageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getInvoice } = useInvoiceWorkspace();

  const editId = searchParams.get("edit");
  const existing = initialInvoice ?? (editId ? getInvoice(editId) : undefined);

  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const customers: SampleCustomer[] = useMemo(() => {
    return initialCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email || "",
      address: formatCustomerAddress(c.billingAddress),
      gstin: c.gstin || "",
      phone: c.phone || undefined,
      contactPerson: c.contactPerson || undefined,
      pan: c.pan || undefined,
      state: c.placeOfSupply || c.billingAddress.state,
      placeOfSupply: c.placeOfSupply || c.billingAddress.state || "",
      gstTreatment: c.gstTreatment,
      paymentTerms: c.paymentTerms || undefined,
    }));
  }, [initialCustomers]);

  const defaultIssueDate = getTodayDateString();
  const defaultTerms = "Net 15 days";
  const defaultDueDate = calculateDueDate(defaultIssueDate, defaultTerms);

  const [invoice, setInvoice] = useState<Invoice>(() =>
    existing ?? {
      id: "",
      number: initialInvoiceNumber || "",
      customer: "",
      customerEmail: "",
      customerAddress: "",
      customerGstin: "",
      customerPlaceOfSupply: "",
      issueDate: defaultIssueDate,
      dueDate: defaultDueDate,
      status: "Draft",
      taxMode: "CGST_SGST",
      notes: initialDefaultNotes,
      paymentTerms: defaultTerms,
      terms: initialDefaultTerms,
      amountPaid: 0,
      additionalCharges: 0,
      additionalChargesLabel: "",
      additionalDiscount: 0,
      additionalDiscountType: "fixed",
      additionalDiscountLabel: "",
      items: [initialLine("line-1")],
    },
  );

  const totals = calculateInvoiceTotals(invoice);

  const update = (patch: Partial<Invoice>) =>
    setInvoice((current) => ({ ...current, ...patch }));

  const updateLine = (id: string, patch: Partial<InvoiceLineItem>) =>
    update({
      items: invoice.items.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    });

  const addLine = () => {
    const nextId = `line-${invoice.items.length + 1}-${Date.now().toString().slice(-4)}`;
    update({ items: [...invoice.items, initialLine(nextId)] });
  };

  const removeLine = (id: string) => {
    if (invoice.items.length <= 1) return;
    update({ items: invoice.items.filter((line) => line.id !== id) });
  };

  const handleSelectCustomer = (cust: SampleCustomer | null) => {
    if (!cust) {
      update({
        customerId: undefined,
        customer: "",
        customerEmail: "",
        customerAddress: "",
        customerGstin: "",
        customerPlaceOfSupply: "",
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next.placeOfSupply;
        return next;
      });
    } else {
      const paymentTerms = cust.paymentTerms || invoice.paymentTerms || "Net 15 days";
      const dueDate = calculateDueDate(invoice.issueDate, paymentTerms);
      const placeOfSupply = cust.placeOfSupply || cust.state || "";

      // Authoritative Place of Supply & Tax Mode determination
      const taxDecision = determineTaxMode({
        supplierState,
        supplierGstin,
        customerPlaceOfSupply: placeOfSupply,
        customerGstin: cust.gstin,
        customerState: cust.state,
        gstTreatment: cust.gstTreatment,
      });

      update({
        customerId: cust.id,
        customer: cust.name,
        customerEmail: cust.email,
        customerAddress: cust.address,
        customerGstin: cust.gstin,
        customerPlaceOfSupply: placeOfSupply,
        taxMode: taxDecision.taxMode,
        paymentTerms,
        dueDate,
      });

      if (taxDecision.error) {
        setErrors((prev) => ({
          ...prev,
          placeOfSupply: taxDecision.error!,
        }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.placeOfSupply;
          return next;
        });
      }

      if (errors.customer || errors.dueDate) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.customer;
          delete next.dueDate;
          return next;
        });
      }
    }
  };

  const handleSaveDraft = async () => {
    const validationErrors: Record<string, string> = {};
    if (!invoice.customer.trim()) {
      validationErrors.customer = "Select a customer before saving.";
    }
    if (!invoice.issueDate) {
      validationErrors.issueDate = "Issue date is required.";
    }
    if (!invoice.dueDate) {
      validationErrors.dueDate = "Due date is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      setSubmitError(firstError || "Select a customer before saving.");
      setPreview(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const selectedCustomer = customers.find((c) => c.name === invoice.customer);
      const isExistingDraft = Boolean(existing?.id);

      const nonEmptyItems = invoice.items.filter(
        (it) => it.item.trim().length > 0 || it.unitPrice > 0,
      );
      const itemsToSave = nonEmptyItems.length > 0 ? nonEmptyItems : invoice.items;

      const payload = {
        ...(isExistingDraft ? { id: existing!.id } : {}),
        invoiceNumber: invoice.number || undefined,
        customerId: invoice.customerId || selectedCustomer?.id,
        customerName: invoice.customer,
        customerEmail: invoice.customerEmail,
        customerAddress: invoice.customerAddress,
        customerGstin: invoice.customerGstin,
        customerPlaceOfSupply: invoice.customerPlaceOfSupply,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paymentTerms: invoice.paymentTerms,
        status: "Draft" as const,
        taxMode: invoice.taxMode,
        notes: invoice.notes,
        terms: invoice.terms,
        amountPaid: invoice.amountPaid,
        additionalCharges: invoice.additionalCharges,
        additionalChargesLabel: invoice.additionalChargesLabel,
        additionalDiscount: invoice.additionalDiscount,
        additionalDiscountType: invoice.additionalDiscountType,
        additionalDiscountLabel: invoice.additionalDiscountLabel,
        items: itemsToSave.map((it) => ({
          id: it.id,
          item: it.item.trim() || "Item",
          description: it.description,
          hsnSac: it.hsnSac,
          quantity: it.quantity > 0 ? it.quantity : 1,
          unitPrice: it.unitPrice >= 0 ? it.unitPrice : 0,
          discount: it.discount,
          taxRate: it.taxRate,
        })),
      };

      const result = isExistingDraft && existing?.id
        ? await updateInvoiceAction({ ...payload, id: existing.id })
        : await createInvoiceAction(payload);

      if (!result.success) {
        setSubmitError(result.error || "Failed to save draft.");
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        setIsSubmitting(false);
        return;
      }

      router.push("/invoices?saved=1");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  const handleCreateInvoice = async () => {
    // Filter out trailing completely empty lines if at least one non-empty line exists
    const nonEmptyItems = invoice.items.filter(
      (it) => it.item.trim().length > 0 || it.unitPrice > 0,
    );
    const itemsToValidate = nonEmptyItems.length > 0 ? nonEmptyItems : invoice.items;

    const validation = validateInvoice({ ...invoice, items: itemsToValidate });

    if (invoice.customer) {
      const taxDecision = determineTaxMode({
        supplierState,
        supplierGstin,
        customerPlaceOfSupply: invoice.customerPlaceOfSupply,
        customerGstin: invoice.customerGstin,
      });
      if (taxDecision.error) {
        validation.placeOfSupply = taxDecision.error;
      }
    }

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      const firstError = Object.values(validation)[0];
      setSubmitError(firstError || "Please fill in all required fields before creating the invoice.");
      setPreview(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const selectedCustomer = customers.find((c) => c.name === invoice.customer);
      const isExistingDraft = Boolean(existing?.id);

      const payload = {
        ...(isExistingDraft ? { id: existing!.id } : {}),
        invoiceNumber: invoice.number || undefined,
        customerId: invoice.customerId || selectedCustomer?.id,
        customerName: invoice.customer,
        customerEmail: invoice.customerEmail,
        customerAddress: invoice.customerAddress,
        customerGstin: invoice.customerGstin,
        customerPlaceOfSupply: invoice.customerPlaceOfSupply,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paymentTerms: invoice.paymentTerms,
        status: "Issued" as const,
        taxMode: invoice.taxMode,
        notes: invoice.notes,
        terms: invoice.terms,
        amountPaid: invoice.amountPaid,
        additionalCharges: invoice.additionalCharges,
        additionalChargesLabel: invoice.additionalChargesLabel,
        additionalDiscount: invoice.additionalDiscount,
        additionalDiscountType: invoice.additionalDiscountType,
        additionalDiscountLabel: invoice.additionalDiscountLabel,
        items: itemsToValidate.map((it) => ({
          id: it.id,
          item: it.item,
          description: it.description,
          hsnSac: it.hsnSac,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          taxRate: it.taxRate,
        })),
      };

      const result = isExistingDraft && existing?.id
        ? await updateInvoiceAction({ ...payload, id: existing.id })
        : await createInvoiceAction(payload);

      if (!result.success) {
        setSubmitError(result.error || "Failed to create invoice.");
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        setIsSubmitting(false);
        return;
      }

      router.push(`/invoices/${result.data?.id ?? ""}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  // Guard against editing issued or paid invoices
  if (editId && (!existing || existing.status !== "Draft")) {
    return (
      <section className="space-y-4 rounded-xl border border-border bg-surface-card p-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Draft editing unavailable
        </h1>
        <p className="text-text-secondary">
          Only existing local drafts can be edited. Issued and paid invoices cannot be changed.
        </p>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-light hover:text-primary-foreground"
        >
          <ArrowLeft size={16} />
          <span>Back to Invoices</span>
        </Link>
      </section>
    );
  }

  // Preview Mode
  if (preview) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            <span>Back to edit</span>
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar size={16} className="text-text-muted" />
              <span>{isSubmitting ? "Saving..." : "Save as Draft"}</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCreateInvoice}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? "Creating..." : "Create Invoice"}</span>
            </button>
          </div>
        </div>
        <InvoiceDocument invoice={invoice} supplierName={supplierName} />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* 1. Back Navigation — strictly above the page heading */}
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-light transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
        >
          <ArrowLeft size={16} />
          <span>Back to Invoices</span>
        </Link>
      </div>

      {/* 2. Page Heading & Actions Row */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            {existing ? "Edit Draft" : "Create Invoice"}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Create a new customer invoice with items, taxes, and payment details.
          </p>
        </div>

        {/* Action buttons on the right */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveDraft}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calendar size={16} className="text-text-muted" />
            <span>{isSubmitting ? "Saving..." : "Save as Draft"}</span>
          </button>

          <button
            type="button"
            onClick={() => setPreview(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            <Eye size={16} className="text-text-muted" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCreateInvoice}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={16} />
            <span>{isSubmitting ? "Creating..." : "Create Invoice"}</span>
          </button>
        </div>
      </header>

      {submitError && (
        <div
          className="rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {/* 3. Invoice Details Section — Unified customer select, details below, and invoice metadata */}
      <CustomerSection
        selectedCustomer={invoice.customer}
        onSelectCustomer={handleSelectCustomer}
        customers={customers}
        error={errors.customer}
        invoiceNumber={invoice.number}
        onInvoiceNumberChange={(val) => update({ number: val })}
        issueDate={invoice.issueDate}
        onIssueDateChange={(val) => {
          const newDueDate = calculateDueDate(val, invoice.paymentTerms);
          update({ issueDate: val, dueDate: newDueDate });
          if (errors.issueDate || errors.dueDate) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.issueDate;
              delete next.dueDate;
              return next;
            });
          }
        }}
        dueDate={invoice.dueDate}
        onDueDateChange={(val) => {
          update({ dueDate: val });
          if (errors.dueDate) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.dueDate;
              return next;
            });
          }
        }}
        paymentTerms={invoice.paymentTerms}
        onPaymentTermsChange={(val) => {
          const newDueDate = calculateDueDate(invoice.issueDate, val);
          update({ paymentTerms: val, dueDate: newDueDate });
          if (errors.dueDate) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.dueDate;
              return next;
            });
          }
        }}
        errors={errors}
      />

      {/* 5. Items Section — Full Width */}
      <InvoiceItemsSection
        items={invoice.items}
        onUpdateLine={updateLine}
        onAddLine={addLine}
        onRemoveLine={removeLine}
        availableProducts={initialProducts}
        errors={errors}
      />

      {/* 6. Charges & Discount (left) and Invoice Summary (right) with identical matching height */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr] xl:grid-cols-[1.5fr_1fr] 2xl:grid-cols-[1.6fr_1fr] items-stretch">
        <AdditionalChargesAndDiscountSection
          additionalCharges={invoice.additionalCharges ?? 0}
          onAdditionalChargesChange={(val) => update({ additionalCharges: val })}
          additionalChargesLabel={invoice.additionalChargesLabel ?? ""}
          onAdditionalChargesLabelChange={(val) => update({ additionalChargesLabel: val })}
          additionalDiscount={invoice.additionalDiscount ?? 0}
          onAdditionalDiscountChange={(val) => update({ additionalDiscount: val })}
          additionalDiscountType={invoice.additionalDiscountType ?? "fixed"}
          onAdditionalDiscountTypeChange={(val) => update({ additionalDiscountType: val })}
          additionalDiscountLabel={invoice.additionalDiscountLabel ?? ""}
          onAdditionalDiscountLabelChange={(val) => update({ additionalDiscountLabel: val })}
        />
        <InvoiceSummarySection
          totals={totals}
          taxMode={invoice.taxMode}
          onTaxModeChange={(mode) => update({ taxMode: mode })}
          items={invoice.items}
        />
      </div>

      {/* 7. Additional Information Section — Full Width below */}
      <AdditionalInfoSection
        notes={invoice.notes}
        onNotesChange={(val) => update({ notes: val })}
        terms={invoice.terms}
        onTermsChange={(val) => update({ terms: val })}
      />

      {/* 8. Bottom Submit Error Alert */}
      {submitError && (
        <div
          className="rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {/* 9. Bottom Action Bar */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/invoices"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
        >
          <X size={15} />
          <span>Cancel</span>
        </Link>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSaveDraft}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calendar size={16} className="text-text-muted" />
          <span>{isSubmitting ? "Saving..." : "Save as Draft"}</span>
        </button>

        <button
          type="button"
          onClick={() => setPreview(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
        >
          <Eye size={16} className="text-text-muted" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleCreateInvoice}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 size={16} />
          <span>{isSubmitting ? "Creating..." : "Create Invoice"}</span>
        </button>
      </div>
    </section>
  );
};
