import type { Customer, GstTreatment } from "../entities/customer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s-]{7,16}$/;
const GSTIN_REGEX =
  /^[0-9]{2}(?:[A-Z]{5}[0-9]{4}[A-Z]|[A-Z]{4}[0-9]{5}[A-Z])[1-9A-Z][0-9A-Z]{2}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

export const GSTIN_LENGTH = 15;
export const PAN_LENGTH = 10;
export const TAN_LENGTH = 10;

/** Valid 2-digit Indian GST state and territory codes */
export const VALID_GST_STATE_CODES = new Set([
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "37", "38", "97", "99",
]);

export const isGstinRequired = (treatment: GstTreatment): boolean => {
  return (
    treatment === "REGISTERED_BUSINESS_REGULAR" ||
    treatment === "SPECIAL_ECONOMIC_ZONE" ||
    treatment === "COMPOSITION_SCHEME"
  );
};

export const isValidGstStateCode = (code: string): boolean => {
  return VALID_GST_STATE_CODES.has(code);
};

export const isValidPanFormat = (pan: string): boolean => {
  const cleaned = pan.trim().toUpperCase();
  return (
    cleaned.length === PAN_LENGTH &&
    (PAN_REGEX.test(cleaned) || TAN_REGEX.test(cleaned))
  );
};

export const isValidTanFormat = (tan: string): boolean => {
  const cleaned = tan.trim().toUpperCase();
  return cleaned.length === TAN_LENGTH && TAN_REGEX.test(cleaned);
};

export const isValidGstinFormat = (gstin: string): boolean => {
  const cleaned = gstin.trim().toUpperCase();
  if (cleaned.length !== GSTIN_LENGTH || !GSTIN_REGEX.test(cleaned)) {
    return false;
  }
  const stateCode = cleaned.slice(0, 2);
  if (!isValidGstStateCode(stateCode)) {
    return false;
  }
  const embeddedId = cleaned.slice(2, 12);
  return isValidPanFormat(embeddedId);
};

export const isValidGstin = isValidGstinFormat;
export const isValidPan = isValidPanFormat;

/**
 * Extracts the 10-character PAN/TAN embedded in an Indian GSTIN (characters 3-12).
 * Returns null if the candidate PAN/TAN segment is not structurally valid.
 */
export const derivePanFromGstin = (gstNumber: string): string | null => {
  const cleaned = gstNumber.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length >= 12) {
    const candidatePan = cleaned.slice(2, 12);
    if (isValidPanFormat(candidatePan)) {
      return candidatePan;
    }
  }
  return null;
};

export const isValidEmailFormat = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

export const isValidPhoneFormat = (phone: string): boolean => {
  const digitsOnly = phone.replace(/[\s+-]/g, "");
  return PHONE_REGEX.test(phone.trim()) && digitsOnly.length >= 7;
};

export const validateCustomerInvariants = (
  customer: Partial<Customer>,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Customer Name
  if (!customer.name || customer.name.trim().length === 0) {
    errors.name = "Customer name is required.";
  } else if (customer.name.trim().length < 2) {
    errors.name = "Customer name must be at least 2 characters.";
  }

  // Email
  if (customer.email && customer.email.trim().length > 0) {
    if (!isValidEmailFormat(customer.email)) {
      errors.email = "Please enter a valid email address.";
    }
  }

  // Phone
  if (customer.phone && customer.phone.trim().length > 0) {
    if (!isValidPhoneFormat(customer.phone)) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }
  }

  // Alternate Phone
  if (customer.alternatePhone && customer.alternatePhone.trim().length > 0) {
    if (!isValidPhoneFormat(customer.alternatePhone)) {
      errors.alternatePhone = "Please enter a valid alternate phone number.";
    }
  }

  // GSTIN
  const gstinTrimmed = customer.gstin?.replace(/\s+/g, "")?.toUpperCase();
  if (customer.gstTreatment && isGstinRequired(customer.gstTreatment)) {
    if (!gstinTrimmed) {
      errors.gstin = "GSTIN is required for registered businesses.";
    } else if (!isValidGstinFormat(gstinTrimmed)) {
      errors.gstin = "GSTIN must be a valid 15-character format (e.g., 27AABCG9912D1Z9).";
    }
  } else if (gstinTrimmed && gstinTrimmed.length > 0 && !isValidGstinFormat(gstinTrimmed)) {
    errors.gstin = "GSTIN must be a valid 15-character format (e.g., 27AABCG9912D1Z9).";
  }

  // PAN
  const panTrimmed = customer.pan?.replace(/\s+/g, "")?.toUpperCase();
  if (panTrimmed && panTrimmed.length > 0) {
    if (!isValidPanFormat(panTrimmed)) {
      errors.pan = "PAN must be a valid 10-character code (e.g., AABCG9912D).";
    } else if (gstinTrimmed && isValidGstinFormat(gstinTrimmed)) {
      const derived = derivePanFromGstin(gstinTrimmed);
      if (derived && derived !== panTrimmed) {
        errors.pan = `PAN does not match the PAN embedded in the GSTIN (${derived}).`;
      }
    }
  }

  // Credit Limit
  if (customer.creditLimit !== undefined && customer.creditLimit !== null) {
    if (customer.creditLimit < 0) {
      errors.creditLimit = "Credit limit cannot be negative.";
    }
  }

  // Default Discount
  if (customer.defaultDiscount !== undefined && customer.defaultDiscount !== null) {
    if (customer.defaultDiscount < 0 || customer.defaultDiscount > 100) {
      errors.defaultDiscount = "Default discount must be between 0% and 100%.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
