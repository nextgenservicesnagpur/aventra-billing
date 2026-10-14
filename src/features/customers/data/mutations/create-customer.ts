"use server";

import { revalidatePath } from "next/cache";
import { resolveCustomerContext } from "../context/customer-context";
import { customerRepository } from "../../infrastructure/repositories/prisma-customer-repository";
import { createCustomerSchema } from "../validators/customer-schemas";
import { toCustomerDto } from "../mappers/customer-mappers";
import type { CustomerActionResult, CreateCustomerInput, CustomerDto } from "../dto/customer-dto";
import type { Customer } from "../../domain/entities/customer";

export const createCustomerAction = async (
  input: CreateCustomerInput,
): Promise<CustomerActionResult<CustomerDto>> => {
  try {
    const parseResult = createCustomerSchema.safeParse(input);
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

    const { organizationId } = await resolveCustomerContext();
    const data = parseResult.data;

    const finalShippingAddress = data.sameAsBillingAddress
      ? { ...data.billingAddress }
      : data.shippingAddress ?? { ...data.billingAddress };

    const newCustomer: Customer = {
      id: `cust_${crypto.randomUUID()}`,
      organizationId,
      name: data.name,
      customerType: data.customerType,
      gstTreatment: data.gstTreatment,
      status: data.status,
      contactPerson: data.contactPerson ?? null,
      email: data.email || null,
      phone: data.phone || null,
      alternatePhone: data.alternatePhone || null,
      billingAddress: data.billingAddress,
      shippingAddress: finalShippingAddress,
      sameAsBillingAddress: data.sameAsBillingAddress,
      gstin: data.gstin || null,
      pan: data.pan || null,
      currency: data.currency,
      placeOfSupply: data.placeOfSupply,
      paymentTerms: data.paymentTerms,
      creditLimit: data.creditLimit ?? null,
      defaultDiscount: data.defaultDiscount ?? null,
      defaultTaxPreference: data.defaultTaxPreference,
      priceList: data.priceList,
      internalNotes: data.internalNotes ?? null,
      tags: data.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await customerRepository.create(newCustomer);
    revalidatePath("/customers");

    return {
      success: true,
      data: toCustomerDto(saved),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};
