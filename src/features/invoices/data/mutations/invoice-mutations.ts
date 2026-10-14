"use server";

import { revalidatePath } from "next/cache";
import { resolveInvoiceContext } from "../context/invoice-context";
import { invoiceRepository } from "../../infrastructure/repositories/prisma-invoice-repository";
import { customerRepository } from "@/features/customers/infrastructure/repositories/prisma-customer-repository";
import { billingSettingsRepository } from "@/features/billing-settings/infrastructure/repositories/prisma-billing-settings-repository";
import { getSupplierTaxContext } from "../queries/get-supplier-tax-context";
import {
  calculateInvoiceTotals,
  lineTax,
  lineTaxable,
  type Invoice,
  type InvoiceLineItem,
} from "../../domain/invoice";
import { determineTaxMode } from "../../domain/rules/tax-rules";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from "../validators/invoice-schemas";
import type {
  CreateInvoiceInputDto,
  InvoiceActionResult,
  UpdateInvoiceInputDto,
} from "../dto/invoice-dto";
import {
  DuplicateInvoiceNumberError,
  InvalidCustomerReferenceError,
  InvalidInvoiceStatusTransitionError,
  InvoiceNotFoundError,
} from "../../domain/errors/invoice-errors";

export const createInvoiceAction = async (
  input: CreateInvoiceInputDto,
): Promise<InvoiceActionResult<Invoice>> => {
  try {
    const parseResult = createInvoiceSchema.safeParse(input);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const pathKey = issue.path.join(".");
        fieldErrors[pathKey] = issue.message;
      }
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors,
      };
    }

    const { organizationId } = await resolveInvoiceContext();
    const data = parseResult.data;

    // 1. Verify customer belongs to this organization if customerId is provided
    let verifiedCustomer = null;
    if (data.customerId) {
      verifiedCustomer = await customerRepository.findById(organizationId, data.customerId);
      if (!verifiedCustomer) {
        throw new InvalidCustomerReferenceError(data.customerId);
      }
    }

    // 2. Authoritative Place of Supply & Tax Mode determination
    const supplierTax = await getSupplierTaxContext();
    const placeOfSupply =
      data.customerPlaceOfSupply ||
      verifiedCustomer?.placeOfSupply ||
      verifiedCustomer?.billingAddress.state ||
      "";

    const taxDecision = determineTaxMode({
      supplierState: supplierTax.state,
      supplierGstin: supplierTax.gstNumber,
      customerPlaceOfSupply: placeOfSupply,
      customerGstin: data.customerGstin || verifiedCustomer?.gstin,
      customerState: verifiedCustomer?.billingAddress.state,
      gstTreatment: verifiedCustomer?.gstTreatment,
    });

    const taxMode = taxDecision.taxMode;

    // 3. Prepare domain line items & server-side recalculations
    const domainItems: InvoiceLineItem[] = data.items.map((it, idx) => ({
      id: it.id || `line-${idx + 1}-${crypto.randomUUID().slice(0, 8)}`,
      item: it.item,
      description: it.description || "",
      hsnSac: it.hsnSac || undefined,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discount: it.discount,
      taxRate: it.taxRate,
    }));

    // Authoritative totals calculation
    const calculatedTotals = calculateInvoiceTotals({
      items: domainItems,
      amountPaid: data.amountPaid,
      taxMode,
      additionalCharges: data.additionalCharges,
      additionalDiscount: data.additionalDiscount,
      additionalDiscountType: data.additionalDiscountType,
    });

    // Compute line-level amounts for snapshot persistence
    const repositoryItems = domainItems.map((it, idx) => {
      const taxable = lineTaxable(it);
      const taxAmt = lineTax(it);
      const lineTot = taxable + taxAmt;
      return {
        id: `item_${crypto.randomUUID()}`,
        productId: data.items[idx]?.productId ?? null,
        item: it.item,
        description: it.description ?? null,
        hsnSac: it.hsnSac ?? null,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        taxRate: it.taxRate,
        taxableAmount: taxable,
        taxAmount: taxAmt,
        lineTotal: lineTot,
        sortOrder: idx,
      };
    });

    // 4. Authoritative sequence allocation via BillingSettings
    const allocated = await billingSettingsRepository.allocateNextNumber(
      organizationId,
      "INVOICE",
    );

    const finalInvoiceNumber = allocated.allocatedNumber;
    const invoiceId = `inv_${crypto.randomUUID()}`;

    const saved = await invoiceRepository.create({
      id: invoiceId,
      organizationId,
      invoiceNumber: finalInvoiceNumber,
      customerId: data.customerId ?? null,
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerAddress: data.customerAddress || null,
      customerGstin: data.customerGstin || null,
      customerPlaceOfSupply: placeOfSupply || null,
      issueDate: new Date(`${data.issueDate}T00:00:00.000Z`),
      dueDate: new Date(`${data.dueDate}T00:00:00.000Z`),
      paymentTerms: data.paymentTerms,
      status: data.status,
      taxMode,
      currency: "INR (₹)",
      subtotal: calculatedTotals.subtotal,
      lineDiscountTotal: calculatedTotals.discount - (calculatedTotals.additionalDiscount ?? 0),
      additionalDiscount: calculatedTotals.additionalDiscount ?? 0,
      additionalDiscountType: data.additionalDiscountType,
      additionalDiscountLabel: data.additionalDiscountLabel || null,
      additionalCharges: calculatedTotals.additionalCharges ?? 0,
      additionalChargesLabel: data.additionalChargesLabel || null,
      taxableAmount: calculatedTotals.taxable,
      cgst: calculatedTotals.cgst,
      sgst: calculatedTotals.sgst,
      igst: calculatedTotals.igst,
      totalTax: calculatedTotals.tax,
      total: calculatedTotals.total,
      amountPaid: data.amountPaid,
      notes: data.notes || null,
      terms: data.terms || null,
      items: repositoryItems,
    });

    revalidatePath("/invoices");
    revalidatePath("/invoices/new");
    revalidatePath("/settings/billing");
    revalidatePath(`/invoices/${saved.id}`);

    return {
      success: true,
      data: saved,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};

export const updateInvoiceAction = async (
  input: UpdateInvoiceInputDto,
): Promise<InvoiceActionResult<Invoice>> => {
  try {
    const parseResult = updateInvoiceSchema.safeParse(input);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const pathKey = issue.path.join(".");
        fieldErrors[pathKey] = issue.message;
      }
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors,
      };
    }

    const { organizationId } = await resolveInvoiceContext();
    const data = parseResult.data;

    const existing = await invoiceRepository.findById(organizationId, data.id);
    if (!existing) {
      throw new InvoiceNotFoundError(data.id);
    }

    // Only Draft invoices can be updated
    if (existing.status !== "Draft") {
      throw new InvalidInvoiceStatusTransitionError(existing.status, "edit");
    }

    // 1. Verify customer
    let verifiedCustomer = null;
    if (data.customerId) {
      verifiedCustomer = await customerRepository.findById(organizationId, data.customerId);
      if (!verifiedCustomer) {
        throw new InvalidCustomerReferenceError(data.customerId);
      }
    }

    // 2. Authoritative tax determination
    const supplierTax = await getSupplierTaxContext();
    const placeOfSupply =
      data.customerPlaceOfSupply ||
      verifiedCustomer?.placeOfSupply ||
      verifiedCustomer?.billingAddress.state ||
      "";

    const taxDecision = determineTaxMode({
      supplierState: supplierTax.state,
      supplierGstin: supplierTax.gstNumber,
      customerPlaceOfSupply: placeOfSupply,
      customerGstin: data.customerGstin || verifiedCustomer?.gstin,
      customerState: verifiedCustomer?.billingAddress.state,
      gstTreatment: verifiedCustomer?.gstTreatment,
    });

    const taxMode = taxDecision.taxMode;

    // 3. Recalculate totals
    const domainItems: InvoiceLineItem[] = data.items.map((it, idx) => ({
      id: it.id || `line-${idx + 1}-${crypto.randomUUID().slice(0, 8)}`,
      item: it.item,
      description: it.description || "",
      hsnSac: it.hsnSac || undefined,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discount: it.discount,
      taxRate: it.taxRate,
    }));

    const calculatedTotals = calculateInvoiceTotals({
      items: domainItems,
      amountPaid: data.amountPaid,
      taxMode,
      additionalCharges: data.additionalCharges,
      additionalDiscount: data.additionalDiscount,
      additionalDiscountType: data.additionalDiscountType,
    });

    // Retain existing number unless a non-conflicting manual number is provided
    let finalInvoiceNumber = existing.number;
    if (data.invoiceNumber && data.invoiceNumber !== existing.number) {
      const existingConflict = await invoiceRepository.findByNumber(organizationId, data.invoiceNumber);
      if (existingConflict && existingConflict.id !== existing.id) {
        throw new DuplicateInvoiceNumberError(data.invoiceNumber);
      }
      finalInvoiceNumber = data.invoiceNumber;
    }

    const repositoryItems = domainItems.map((it, idx) => {
      const taxable = lineTaxable(it);
      const taxAmt = lineTax(it);
      const lineTot = taxable + taxAmt;
      return {
        id: `item_${crypto.randomUUID()}`,
        productId: data.items[idx]?.productId ?? null,
        item: it.item,
        description: it.description ?? null,
        hsnSac: it.hsnSac ?? null,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        taxRate: it.taxRate,
        taxableAmount: taxable,
        taxAmount: taxAmt,
        lineTotal: lineTot,
        sortOrder: idx,
      };
    });

    const updated = await invoiceRepository.update(organizationId, data.id, {
      id: data.id,
      organizationId,
      invoiceNumber: finalInvoiceNumber,
      customerId: data.customerId ?? null,
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerAddress: data.customerAddress || null,
      customerGstin: data.customerGstin || null,
      customerPlaceOfSupply: placeOfSupply || null,
      issueDate: new Date(`${data.issueDate}T00:00:00.000Z`),
      dueDate: new Date(`${data.dueDate}T00:00:00.000Z`),
      paymentTerms: data.paymentTerms,
      status: data.status,
      taxMode,
      currency: "INR (₹)",
      subtotal: calculatedTotals.subtotal,
      lineDiscountTotal: calculatedTotals.discount - (calculatedTotals.additionalDiscount ?? 0),
      additionalDiscount: calculatedTotals.additionalDiscount ?? 0,
      additionalDiscountType: data.additionalDiscountType,
      additionalDiscountLabel: data.additionalDiscountLabel || null,
      additionalCharges: calculatedTotals.additionalCharges ?? 0,
      additionalChargesLabel: data.additionalChargesLabel || null,
      taxableAmount: calculatedTotals.taxable,
      cgst: calculatedTotals.cgst,
      sgst: calculatedTotals.sgst,
      igst: calculatedTotals.igst,
      totalTax: calculatedTotals.tax,
      total: calculatedTotals.total,
      amountPaid: data.amountPaid,
      notes: data.notes || null,
      terms: data.terms || null,
      items: repositoryItems,
    });

    revalidatePath("/invoices");
    revalidatePath("/invoices/new");
    revalidatePath("/settings/billing");
    revalidatePath(`/invoices/${updated.id}`);

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};

export const deleteInvoiceAction = async (
  id: string,
): Promise<InvoiceActionResult<{ id: string }>> => {
  try {
    const { organizationId } = await resolveInvoiceContext();

    const existing = await invoiceRepository.findById(organizationId, id);
    if (!existing) {
      throw new InvoiceNotFoundError(id);
    }

    if (existing.status !== "Draft") {
      throw new InvalidInvoiceStatusTransitionError(existing.status, "delete");
    }

    await invoiceRepository.delete(organizationId, id);

    revalidatePath("/invoices");

    return {
      success: true,
      data: { id },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};
