import "server-only";

import { getPrisma } from "@/shared/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Customer, CustomerListFilter } from "../../domain/entities/customer";
import type { ICustomerRepository, CustomerListResult } from "../../domain/repositories/customer-repository";
import { toDomainCustomer } from "../mappers/prisma-customer-mapper";

export class PrismaCustomerRepository implements ICustomerRepository {
  async findById(organizationId: string, id: string): Promise<Customer | null> {
    const prisma = getPrisma();
    const row = await prisma.customer.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!row) return null;
    return toDomainCustomer(row);
  }

  async list(organizationId: string, filter?: CustomerListFilter): Promise<CustomerListResult> {
    const prisma = getPrisma();
    const where: Prisma.CustomerWhereInput = {
      organizationId,
    };

    if (filter?.customerType && filter.customerType !== "ALL") {
      where.customerType = filter.customerType;
    }

    if (filter?.status && filter.status !== "ALL") {
      where.status = filter.status;
    }

    if (filter?.query && filter.query.trim().length > 0) {
      const q = filter.query.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { contactPerson: { contains: q, mode: "insensitive" } },
        { gstin: { contains: q, mode: "insensitive" } },
      ];
    }

    const [rows, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: filter?.offset ?? 0,
        take: filter?.limit ?? 50,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers: rows.map(toDomainCustomer),
      totalCount,
    };
  }

  async create(customer: Customer): Promise<Customer> {
    const prisma = getPrisma();
    const row = await prisma.customer.create({
      data: {
        id: customer.id,
        organizationId: customer.organizationId,
        name: customer.name,
        customerType: customer.customerType,
        gstTreatment: customer.gstTreatment,
        status: customer.status,
        contactPerson: customer.contactPerson,
        email: customer.email,
        phone: customer.phone,
        alternatePhone: customer.alternatePhone,
        billingAddressLine1: customer.billingAddress.addressLine1,
        billingAddressLine2: customer.billingAddress.addressLine2,
        billingCity: customer.billingAddress.city,
        billingState: customer.billingAddress.state,
        billingPinCode: customer.billingAddress.pinCode,
        billingCountry: customer.billingAddress.country,
        sameAsBillingAddress: customer.sameAsBillingAddress,
        shippingAddressLine1: customer.shippingAddress.addressLine1,
        shippingAddressLine2: customer.shippingAddress.addressLine2,
        shippingCity: customer.shippingAddress.city,
        shippingState: customer.shippingAddress.state,
        shippingPinCode: customer.shippingAddress.pinCode,
        shippingCountry: customer.shippingAddress.country,
        gstin: customer.gstin,
        pan: customer.pan,
        currency: customer.currency,
        placeOfSupply: customer.placeOfSupply,
        paymentTerms: customer.paymentTerms,
        creditLimit: customer.creditLimit !== undefined && customer.creditLimit !== null ? customer.creditLimit : null,
        defaultDiscount: customer.defaultDiscount !== undefined && customer.defaultDiscount !== null ? customer.defaultDiscount : null,
        defaultTaxPreference: customer.defaultTaxPreference,
        priceList: customer.priceList,
        internalNotes: customer.internalNotes,
        tags: customer.tags,
      },
    });

    return toDomainCustomer(row);
  }

  async update(organizationId: string, id: string, updates: Partial<Customer>): Promise<Customer> {
    const prisma = getPrisma();
    const data: Prisma.CustomerUpdateInput = {};

    if (updates.name !== undefined) data.name = updates.name;
    if (updates.customerType !== undefined) data.customerType = updates.customerType;
    if (updates.gstTreatment !== undefined) data.gstTreatment = updates.gstTreatment;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.contactPerson !== undefined) data.contactPerson = updates.contactPerson;
    if (updates.email !== undefined) data.email = updates.email;
    if (updates.phone !== undefined) data.phone = updates.phone;
    if (updates.alternatePhone !== undefined) data.alternatePhone = updates.alternatePhone;

    if (updates.billingAddress) {
      data.billingAddressLine1 = updates.billingAddress.addressLine1;
      data.billingAddressLine2 = updates.billingAddress.addressLine2;
      data.billingCity = updates.billingAddress.city;
      data.billingState = updates.billingAddress.state;
      data.billingPinCode = updates.billingAddress.pinCode;
      data.billingCountry = updates.billingAddress.country;
    }

    if (updates.sameAsBillingAddress !== undefined) {
      data.sameAsBillingAddress = updates.sameAsBillingAddress;
    }

    if (updates.shippingAddress) {
      data.shippingAddressLine1 = updates.shippingAddress.addressLine1;
      data.shippingAddressLine2 = updates.shippingAddress.addressLine2;
      data.shippingCity = updates.shippingAddress.city;
      data.shippingState = updates.shippingAddress.state;
      data.shippingPinCode = updates.shippingAddress.pinCode;
      data.shippingCountry = updates.shippingAddress.country;
    }

    if (updates.gstin !== undefined) data.gstin = updates.gstin;
    if (updates.pan !== undefined) data.pan = updates.pan;
    if (updates.currency !== undefined) data.currency = updates.currency;
    if (updates.placeOfSupply !== undefined) data.placeOfSupply = updates.placeOfSupply;
    if (updates.paymentTerms !== undefined) data.paymentTerms = updates.paymentTerms;
    if (updates.creditLimit !== undefined) data.creditLimit = updates.creditLimit;
    if (updates.defaultDiscount !== undefined) data.defaultDiscount = updates.defaultDiscount;
    if (updates.defaultTaxPreference !== undefined) data.defaultTaxPreference = updates.defaultTaxPreference;
    if (updates.priceList !== undefined) data.priceList = updates.priceList;
    if (updates.internalNotes !== undefined) data.internalNotes = updates.internalNotes;
    if (updates.tags !== undefined) data.tags = updates.tags;

    const row = await prisma.customer.update({
      where: {
        id,
        organizationId,
      },
      data,
    });

    return toDomainCustomer(row);
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.customer.delete({
      where: {
        id,
        organizationId,
      },
    });
  }
}

export const customerRepository = new PrismaCustomerRepository();
