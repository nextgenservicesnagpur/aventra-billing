"use server";

import { revalidatePath } from "next/cache";
import { resolveCustomerContext } from "../context/customer-context";
import { customerRepository } from "../../infrastructure/repositories/prisma-customer-repository";
import { updateCustomerSchema } from "../validators/customer-schemas";
import { toCustomerDto } from "../mappers/customer-mappers";
import { CustomerNotFoundError } from "../../domain/errors/customer-errors";
import type { CustomerActionResult, UpdateCustomerInput, CustomerDto } from "../dto/customer-dto";

export const updateCustomerAction = async (
  id: string,
  input: UpdateCustomerInput,
): Promise<CustomerActionResult<CustomerDto>> => {
  try {
    const parseResult = updateCustomerSchema.safeParse(input);
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
    const existing = await customerRepository.findById(organizationId, id);
    if (!existing) {
      throw new CustomerNotFoundError(id);
    }

    const data = parseResult.data;

    const finalShippingAddress =
      data.sameAsBillingAddress === true
        ? data.billingAddress
          ? { ...data.billingAddress }
          : existing.billingAddress
        : data.shippingAddress !== undefined
          ? data.shippingAddress ?? existing.shippingAddress
          : existing.shippingAddress;

    const updated = await customerRepository.update(organizationId, id, {
      name: data.name,
      customerType: data.customerType,
      gstTreatment: data.gstTreatment,
      status: data.status,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      billingAddress: data.billingAddress,
      shippingAddress: finalShippingAddress,
      sameAsBillingAddress: data.sameAsBillingAddress,
      gstin: data.gstin,
      pan: data.pan,
      currency: data.currency,
      placeOfSupply: data.placeOfSupply,
      paymentTerms: data.paymentTerms,
      creditLimit: data.creditLimit,
      defaultDiscount: data.defaultDiscount,
      defaultTaxPreference: data.defaultTaxPreference,
      priceList: data.priceList,
      internalNotes: data.internalNotes,
      tags: data.tags,
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);

    return {
      success: true,
      data: toCustomerDto(updated),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
};
