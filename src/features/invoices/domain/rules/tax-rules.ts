import type { TaxMode } from "../invoice";

export type GstStateInfo = {
  code: string;
  name: string;
};

/**
 * Standard 2-digit GST state and Union Territory codes (01 to 38, 97, 99).
 * Authoritative Indian GST mapping.
 */
export const GST_STATE_MAP: Record<string, GstStateInfo> = {
  "01": { code: "01", name: "Jammu and Kashmir" },
  "02": { code: "02", name: "Himachal Pradesh" },
  "03": { code: "03", name: "Punjab" },
  "04": { code: "04", name: "Chandigarh" },
  "05": { code: "05", name: "Uttarakhand" },
  "06": { code: "06", name: "Haryana" },
  "07": { code: "07", name: "Delhi" },
  "08": { code: "08", name: "Rajasthan" },
  "09": { code: "09", name: "Uttar Pradesh" },
  "10": { code: "10", name: "Bihar" },
  "11": { code: "11", name: "Sikkim" },
  "12": { code: "12", name: "Arunachal Pradesh" },
  "13": { code: "13", name: "Nagaland" },
  "14": { code: "14", name: "Manipur" },
  "15": { code: "15", name: "Mizoram" },
  "16": { code: "16", name: "Tripura" },
  "17": { code: "17", name: "Meghalaya" },
  "18": { code: "18", name: "Assam" },
  "19": { code: "19", name: "West Bengal" },
  "20": { code: "20", name: "Jharkhand" },
  "21": { code: "21", name: "Odisha" },
  "22": { code: "22", name: "Chhattisgarh" },
  "23": { code: "23", name: "Madhya Pradesh" },
  "24": { code: "24", name: "Gujarat" },
  "25": { code: "25", name: "Daman and Diu" },
  "26": { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
  "27": { code: "27", name: "Maharashtra" },
  "28": { code: "28", name: "Andhra Pradesh" },
  "29": { code: "29", name: "Karnataka" },
  "30": { code: "30", name: "Goa" },
  "31": { code: "31", name: "Lakshadweep" },
  "32": { code: "32", name: "Kerala" },
  "33": { code: "33", name: "Tamil Nadu" },
  "34": { code: "34", name: "Puducherry" },
  "35": { code: "35", name: "Andaman and Nicobar Islands" },
  "36": { code: "36", name: "Telangana" },
  "37": { code: "37", name: "Andhra Pradesh" },
  "38": { code: "38", name: "Ladakh" },
  "97": { code: "97", name: "Other Territory" },
  "99": { code: "99", name: "Centre Jurisdiction / Other Territory / Export" },
};

/** Lookup map normalizing state name strings and common aliases to 2-digit GST state codes */
const STATE_NAME_TO_CODE: Record<string, string> = {
  "jammu and kashmir": "01",
  "jammu & kashmir": "01",
  "himachal pradesh": "02",
  "punjab": "03",
  "chandigarh": "04",
  "uttarakhand": "05",
  "uttaranchal": "05",
  "haryana": "06",
  "delhi": "07",
  "nct of delhi": "07",
  "rajasthan": "08",
  "uttar pradesh": "09",
  "bihar": "10",
  "sikkim": "11",
  "arunachal pradesh": "12",
  "nagaland": "13",
  "manipur": "14",
  "mizoram": "15",
  "tripura": "16",
  "meghalaya": "17",
  "assam": "18",
  "west bengal": "19",
  "jharkhand": "20",
  "odisha": "21",
  "orissa": "21",
  "chhattisgarh": "22",
  "madhya pradesh": "23",
  "gujarat": "24",
  "daman and diu": "25",
  "daman & diu": "25",
  "dadra and nagar haveli and daman and diu": "26",
  "dadra & nagar haveli and daman & diu": "26",
  "dadra and nagar haveli": "26",
  "dadra & nagar haveli": "26",
  "maharashtra": "27",
  "andhra pradesh": "37",
  "karnataka": "29",
  "goa": "30",
  "lakshadweep": "31",
  "kerala": "32",
  "tamil nadu": "33",
  "puducherry": "34",
  "pondicherry": "34",
  "andaman and nicobar islands": "35",
  "andaman & nicobar islands": "35",
  "telangana": "36",
  "ladakh": "38",
  "other territory": "97",
  "other territory / export": "99",
  "export": "99",
};

/**
 * Normalizes any state representation (code, code-state, name, or GSTIN prefix)
 * into a canonical 2-digit GST state code.
 */
export const normalizeGstStateCode = (input?: string | null): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;

  // 1. Exactly 2 digits (e.g., "27", "29", "07")
  if (/^\d{2}$/.test(trimmed)) {
    if (trimmed in GST_STATE_MAP) {
      return trimmed;
    }
    return null;
  }

  // 2. 2 digits followed by separator (e.g., "27-Maharashtra", "29_Karnataka", "07 Delhi")
  const sepMatch = trimmed.match(/^(\d{2})[-_\s/]/);
  if (sepMatch && sepMatch[1]) {
    const code = sepMatch[1];
    if (code in GST_STATE_MAP) {
      return code;
    }
  }

  // 3. 15-character GSTIN (e.g. "27NGPI00837E1D7", "29AABCA1234F1Z5")
  if (/^\d{2}[A-Za-z0-9]{13}$/.test(trimmed)) {
    const code = trimmed.slice(0, 2);
    if (code in GST_STATE_MAP) {
      return code;
    }
  }

  // Normalize plain state name (case-insensitive, strip redundant punctuation)
  const normalized = trimmed
    .toLowerCase()
    .replace(/[^\w\s&/]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized in STATE_NAME_TO_CODE) {
    return STATE_NAME_TO_CODE[normalized] ?? null;
  }

  // Partial match on state name (e.g., "Maharashtra, India" -> "maharashtra")
  for (const [name, code] of Object.entries(STATE_NAME_TO_CODE)) {
    if (normalized.startsWith(name) || normalized.includes(name)) {
      return code;
    }
  }

  return null;
};

/**
 * Returns the canonical GST state information for a given state code or representation.
 */
export const getGstStateInfo = (input?: string | null): GstStateInfo | null => {
  const code = normalizeGstStateCode(input);
  if (!code) return null;
  return GST_STATE_MAP[code] ?? null;
};

export type DetermineTaxModeParams = {
  supplierState?: string | null;
  supplierGstin?: string | null;
  customerPlaceOfSupply?: string | null;
  customerGstin?: string | null;
  customerState?: string | null;
  gstTreatment?: string | null;
};

export type TaxDeterminationResult = {
  taxMode: TaxMode;
  isInterState: boolean;
  supplierStateCode: string | null;
  customerStateCode: string | null;
  supplierStateName?: string;
  customerStateName?: string;
  reason: string;
  isValid: boolean;
  error?: string;
};

/**
 * Authoritative GST Tax Mode determination based on supplier state and customer Place of Supply.
 *
 * Rules:
 * 1. Special Economic Zone (SEZ) supplies are deemed inter-state (IGST) under IGST Act § 7(5)(b).
 * 2. Overseas Exports are deemed inter-state (IGST) under IGST Act § 7(5)(a).
 * 3. Domestic supply where Supplier State == Customer Place of Supply is intra-state (CGST + SGST).
 * 4. Domestic supply where Supplier State != Customer Place of Supply is inter-state (IGST).
 * 5. Missing or invalid supplier state or customer Place of Supply produces an error.
 */
export const determineTaxMode = ({
  supplierState,
  supplierGstin,
  customerPlaceOfSupply,
  customerGstin,
  customerState,
  gstTreatment,
}: DetermineTaxModeParams): TaxDeterminationResult => {
  // 1. Resolve Supplier GST State Code (from GSTIN prefix or configured state)
  const supplierCode =
    normalizeGstStateCode(supplierGstin) ?? normalizeGstStateCode(supplierState);

  // 2. Resolve Customer Place of Supply State Code (priority: placeOfSupply -> GSTIN -> address state)
  const customerCode =
    normalizeGstStateCode(customerPlaceOfSupply) ??
    normalizeGstStateCode(customerGstin) ??
    normalizeGstStateCode(customerState);

  const supplierInfo = supplierCode ? GST_STATE_MAP[supplierCode] : undefined;
  const customerInfo = customerCode ? GST_STATE_MAP[customerCode] : undefined;

  // 3. Special GST Treatments
  if (gstTreatment === "SPECIAL_ECONOMIC_ZONE") {
    return {
      taxMode: "IGST",
      isInterState: true,
      supplierStateCode: supplierCode,
      customerStateCode: customerCode,
      supplierStateName: supplierInfo?.name,
      customerStateName: customerInfo?.name,
      reason: "Supply to Special Economic Zone (SEZ) is deemed inter-state supply (IGST).",
      isValid: true,
    };
  }

  if (gstTreatment === "OVERSEAS_EXPORT" || customerCode === "99") {
    return {
      taxMode: "IGST",
      isInterState: true,
      supplierStateCode: supplierCode,
      customerStateCode: customerCode ?? "99",
      supplierStateName: supplierInfo?.name,
      customerStateName: "Other Territory / Export",
      reason: "Export and overseas supplies are treated as inter-state supply (IGST).",
      isValid: true,
    };
  }

  // 4. Validate presence of required registration and Place of Supply
  if (!supplierCode) {
    return {
      taxMode: "CGST_SGST",
      isInterState: false,
      supplierStateCode: null,
      customerStateCode: customerCode,
      reason: "Supplier GST registration state is missing or invalid.",
      isValid: false,
      error: "Supplier GST registration state is required to determine tax treatment.",
    };
  }

  if (!customerCode) {
    return {
      taxMode: "CGST_SGST",
      isInterState: false,
      supplierStateCode: supplierCode,
      customerStateCode: null,
      supplierStateName: supplierInfo?.name,
      reason: "Customer Place of Supply is missing or invalid.",
      isValid: false,
      error: "Customer Place of Supply is required to determine tax treatment.",
    };
  }

  // 5. Compare Supplier State vs Customer Place of Supply
  if (supplierCode === customerCode) {
    return {
      taxMode: "CGST_SGST",
      isInterState: false,
      supplierStateCode: supplierCode,
      customerStateCode: customerCode,
      supplierStateName: supplierInfo?.name,
      customerStateName: customerInfo?.name,
      reason: `Intra-state supply within ${supplierInfo?.name ?? supplierCode} (CGST + SGST applied).`,
      isValid: true,
    };
  }

  return {
    taxMode: "IGST",
    isInterState: true,
    supplierStateCode: supplierCode,
    customerStateCode: customerCode,
    supplierStateName: supplierInfo?.name,
    customerStateName: customerInfo?.name,
    reason: `Inter-state supply from ${supplierInfo?.name ?? supplierCode} to ${customerInfo?.name ?? customerCode} (IGST applied).`,
    isValid: true,
  };
};

export type TaxBreakdown = {
  taxableAmount: number;
  taxRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
};

/**
 * Calculates line-level or invoice-level GST breakdown without floating-point errors.
 */
export const calculateTaxBreakdown = (
  taxableAmount: number,
  taxRate: number,
  taxMode: TaxMode,
): TaxBreakdown => {
  const roundedTaxable = Math.round((taxableAmount + Number.EPSILON) * 100) / 100;
  const rawTotalTax = (roundedTaxable * taxRate) / 100;
  const totalTax = Math.round((rawTotalTax + Number.EPSILON) * 100) / 100;

  if (taxMode === "IGST") {
    return {
      taxableAmount: roundedTaxable,
      taxRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: totalTax,
      totalTax,
    };
  }

  const cgstAmount = Math.round((totalTax / 2 + Number.EPSILON) * 100) / 100;
  const sgstAmount = Math.round((totalTax - cgstAmount + Number.EPSILON) * 100) / 100;

  return {
    taxableAmount: roundedTaxable,
    taxRate,
    cgstAmount,
    sgstAmount,
    igstAmount: 0,
    totalTax,
  };
};

/**
 * Server-side validation of invoice tax configuration against authoritative business rules.
 */
export const validateServerTaxDecision = (params: {
  invoiceTaxMode: TaxMode;
  supplierState?: string | null;
  supplierGstin?: string | null;
  customerPlaceOfSupply?: string | null;
  customerGstin?: string | null;
  customerState?: string | null;
  gstTreatment?: string | null;
}): { isValid: boolean; expectedTaxMode: TaxMode; error?: string } => {
  const decision = determineTaxMode(params);

  if (!decision.isValid) {
    return {
      isValid: false,
      expectedTaxMode: decision.taxMode,
      error: decision.error,
    };
  }

  if (params.invoiceTaxMode !== decision.taxMode) {
    return {
      isValid: false,
      expectedTaxMode: decision.taxMode,
      error: `Tax treatment mismatch: based on Place of Supply (${decision.customerStateCode}), expected ${decision.taxMode} but invoice specified ${params.invoiceTaxMode}.`,
    };
  }

  return {
    isValid: true,
    expectedTaxMode: decision.taxMode,
  };
};
