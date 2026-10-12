/**
 * Indian tax identifiers as domain value objects. The GSTIN is the source
 * of truth: it normalizes (trim + uppercase), enforces the 15-character
 * GSTIN structure, and yields the embedded PAN. All layers — Zod trust
 * boundaries, persistence, and presentation feedback — reuse these exact
 * functions; no layer re-implements the format or extraction rules.
 */

/** State code (2) + PAN (10) + entity number (1) + "Z" + checksum (1). */
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/** Five letters, four digits, one letter. */
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** Characters 3–12 (1-based) of the GSTIN. */
const PAN_FROM_GSTIN_START = 2;
const PAN_FROM_GSTIN_END = 12;

export const GSTIN_LENGTH = 15;
export const PAN_LENGTH = 10;

/** Canonical stored form: surrounding whitespace removed, uppercase. */
export const normalizeGstin = (input: string): string =>
  input.trim().toUpperCase();

/** Canonical PAN form: surrounding whitespace removed, uppercase. */
export const normalizePan = (input: string): string =>
  input.trim().toUpperCase();

/** Structural GSTIN check against the exact 15-character format. */
export const isValidGstin = (value: string): boolean =>
  value.length === GSTIN_LENGTH && GSTIN_PATTERN.test(value);

/** Structural PAN check against the exact 10-character format. */
export const isValidPan = (value: string): boolean =>
  value.length === PAN_LENGTH && PAN_PATTERN.test(value);

/**
 * Derives the PAN embedded in a GSTIN. Returns null for anything that is
 * not a structurally valid GSTIN (incomplete, malformed, or with a PAN
 * segment that does not itself satisfy the PAN format) — callers must
 * treat null as "no PAN exists for this input".
 */
export const derivePanFromGstin = (gstNumber: string): string | null => {
  const normalized = normalizeGstin(gstNumber);
  if (!isValidGstin(normalized)) return null;
  const pan = normalized.slice(PAN_FROM_GSTIN_START, PAN_FROM_GSTIN_END);
  return isValidPan(pan) ? pan : null;
};
