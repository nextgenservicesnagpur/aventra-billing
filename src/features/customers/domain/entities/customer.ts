export type CustomerType = "BUSINESS" | "INDIVIDUAL";

export type GstTreatment =
  | "REGISTERED_BUSINESS_REGULAR"
  | "CONSUMER_UNREGISTERED"
  | "OVERSEAS_EXPORT"
  | "SPECIAL_ECONOMIC_ZONE"
  | "DEEMED_EXPORT"
  | "COMPOSITION_SCHEME";

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export type CustomerAddress = {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pinCode: string;
  country: string;
};

export type Customer = {
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
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerListFilter = {
  query?: string;
  customerType?: CustomerType | "ALL";
  status?: CustomerStatus | "ALL";
  limit?: number;
  offset?: number;
};

/**
 * Derives a human-readable 1-to-2 letter uppercase initials code from a customer name.
 */
export const getCustomerInitials = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "CU";

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return (words[0]?.slice(0, 2) ?? "CU").toUpperCase();
  }

  const first = words[0]?.[0] ?? "";
  const second = words[words.length - 1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
};

/**
 * Formats a structured address into a clean single-line representation.
 */
export const formatCustomerAddress = (address?: Partial<CustomerAddress> | null): string => {
  if (!address) return "";

  const parts = [
    address.addressLine1?.trim(),
    address.addressLine2?.trim(),
    address.city?.trim(),
    address.state?.trim(),
    address.pinCode?.trim(),
  ].filter(Boolean);

  return parts.join(", ");
};

/**
 * Formats currency amount in Indian Rupee format or standard format.
 */
export const formatCurrency = (amount: number, currency: string = "INR"): string => {
  if (currency === "INR" || currency.startsWith("INR")) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.slice(0, 3),
    maximumFractionDigits: 2,
  }).format(amount);
};
