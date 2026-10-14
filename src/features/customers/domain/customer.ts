export type CustomerType = "Business" | "Individual";

export type GstTreatment =
  | "Registered Business (Regular)"
  | "Consumer / Unregistered"
  | "Overseas / Export"
  | "Special Economic Zone (SEZ)"
  | "Deemed Export"
  | "Composition Scheme";

export type CustomerStatus = "Active" | "Inactive";

export type CustomerAddress = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
};

export type CustomerAdditionalSettings = {
  paymentTerms: string;
  creditLimit?: number | null;
  defaultDiscount?: number | null;
  defaultTaxPreference: string;
  priceList: string;
};

export type Customer = {
  id: string;
  name: string;
  customerType: CustomerType;
  gstTreatment: GstTreatment;
  status: CustomerStatus;
  contactPerson?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  billingAddress: CustomerAddress;
  shippingAddress: CustomerAddress;
  sameAsBillingAddress: boolean;
  gstin?: string;
  pan?: string;
  currency: string;
  placeOfSupply: string;
  additionalSettings: CustomerAdditionalSettings;
  internalNotes?: string;
  tags: string[];
  outstandingBalance: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomerFilterOptions = {
  query?: string;
  customerType?: CustomerType | "All";
  status?: CustomerStatus | "All";
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
export const formatCustomerAddress = (address?: Partial<CustomerAddress>): string => {
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
 * Formats an amount using Indian Rupee format or standard currency notation.
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
