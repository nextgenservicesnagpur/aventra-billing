import type { CustomerType, GstTreatment, CustomerStatus, CustomerAddress } from "../../domain/entities/customer";

export type CustomerDto = {
  id: string;
  organizationId: string;
  name: string;
  customerType: CustomerType;
  gstTreatment: GstTreatment;
  status: CustomerStatus;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  billingAddress: CustomerAddress;
  shippingAddress: CustomerAddress;
  sameAsBillingAddress: boolean;
  gstin?: string | null;
  pan?: string | null;
  currency: string;
  placeOfSupply: string;
  paymentTerms: string;
  creditLimit?: number | null;
  defaultDiscount?: number | null;
  defaultTaxPreference: string;
  priceList: string;
  internalNotes?: string | null;
  tags: string[];
  outstandingBalance?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerInput = {
  name: string;
  customerType?: CustomerType;
  gstTreatment?: GstTreatment;
  status?: CustomerStatus;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  billingAddress: CustomerAddress;
  shippingAddress?: CustomerAddress | null;
  sameAsBillingAddress?: boolean;
  gstin?: string | null;
  pan?: string | null;
  currency?: string;
  placeOfSupply?: string;
  paymentTerms?: string;
  creditLimit?: number | null;
  defaultDiscount?: number | null;
  defaultTaxPreference?: string;
  priceList?: string;
  internalNotes?: string | null;
  tags?: string[];
};

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export type CustomerFilterInput = {
  query?: string;
  customerType?: CustomerType | "ALL";
  status?: CustomerStatus | "ALL";
  page?: number;
  pageSize?: number;
};

export type CustomerActionResult<T = CustomerDto> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
};
