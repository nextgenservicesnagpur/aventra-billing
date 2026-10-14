import type { Customer } from "./customer";

export type CustomerValidationErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s-]{7,16}$/;
const GSTIN_REGEX =
  /^[0-9]{2}(?:[A-Z]{5}[0-9]{4}[A-Z]|[A-Z]{4}[0-9]{5}[A-Z])[1-9A-Z][0-9A-Z]{2}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

export const validateCustomer = (
  customer: Partial<Customer>,
): { isValid: boolean; errors: CustomerValidationErrors } => {
  const errors: CustomerValidationErrors = {};

  // Customer Name
  if (!customer.name || customer.name.trim().length === 0) {
    errors.name = "Customer name is required.";
  } else if (customer.name.trim().length < 2) {
    errors.name = "Customer name must be at least 2 characters.";
  }

  // Email
  if (customer.email && customer.email.trim().length > 0) {
    if (!EMAIL_REGEX.test(customer.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
  }

  // Phone
  if (customer.phone && customer.phone.trim().length > 0) {
    const digitsOnly = customer.phone.replace(/[\s+-]/g, "");
    if (!PHONE_REGEX.test(customer.phone.trim()) || digitsOnly.length < 7) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }
  }

  // Alternate Phone
  if (customer.alternatePhone && customer.alternatePhone.trim().length > 0) {
    const digitsOnly = customer.alternatePhone.replace(/[\s+-]/g, "");
    if (!PHONE_REGEX.test(customer.alternatePhone.trim()) || digitsOnly.length < 7) {
      errors.alternatePhone = "Please enter a valid alternate phone number.";
    }
  }

  // GSTIN
  const gstinTrimmed = customer.gstin?.trim()?.toUpperCase();
  if (customer.gstTreatment === "Registered Business (Regular)") {
    if (!gstinTrimmed) {
      errors.gstin = "GSTIN is required for registered businesses.";
    } else if (!GSTIN_REGEX.test(gstinTrimmed)) {
      errors.gstin = "GSTIN must be a valid 15-character format (e.g., 27AABCG9912D1Z9).";
    }
  } else if (gstinTrimmed && !GSTIN_REGEX.test(gstinTrimmed)) {
    errors.gstin = "GSTIN must be a valid 15-character format (e.g., 27AABCG9912D1Z9).";
  }

  // PAN
  const panTrimmed = customer.pan?.trim()?.toUpperCase();
  if (
    panTrimmed &&
    !PAN_REGEX.test(panTrimmed) &&
    !TAN_REGEX.test(panTrimmed)
  ) {
    errors.pan = "PAN must be a valid 10-character code (e.g., AABCG9912D).";
  }

  // Credit Limit
  if (
    customer.additionalSettings?.creditLimit !== undefined &&
    customer.additionalSettings?.creditLimit !== null
  ) {
    if (customer.additionalSettings.creditLimit < 0) {
      errors.creditLimit = "Credit limit cannot be negative.";
    }
  }

  // Default Discount
  if (
    customer.additionalSettings?.defaultDiscount !== undefined &&
    customer.additionalSettings?.defaultDiscount !== null
  ) {
    const discount = customer.additionalSettings.defaultDiscount;
    if (discount < 0 || discount > 100) {
      errors.defaultDiscount = "Default discount must be between 0% and 100%.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
