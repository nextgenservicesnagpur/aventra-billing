import { describe, expect, it } from "vitest";
import {
  derivePanFromGstin,
  isValidGstin,
  isValidPan,
  normalizeGstin,
  normalizePan,
} from "./gstin";

describe("GSTIN normalization", () => {
  it("uppercases and trims surrounding whitespace", () => {
    expect(normalizeGstin("  22aaaaa0000a1z5 ")).toBe("22AAAAA0000A1Z5");
    expect(normalizeGstin("\t27ABCDE1234F1Z5\n")).toBe("27ABCDE1234F1Z5");
  });

  it("normalizes PAN the same way", () => {
    expect(normalizePan(" abcde1234f ")).toBe("ABCDE1234F");
  });
});

describe("GSTIN validation", () => {
  it("accepts exactly 15 characters in the Indian GSTIN structure", () => {
    expect(isValidGstin("22AAAAA0000A1Z5")).toBe(true);
    expect(isValidGstin("27ABCDE1234F1Z5")).toBe(true);
    expect(isValidGstin("29AAAAA0000A1Z5")).toBe(true);
  });

  it("rejects shorter and longer values", () => {
    expect(isValidGstin("22AAAAA0000A1Z")).toBe(false);
    expect(isValidGstin("22AAAAA0000A1Z55")).toBe(false);
    expect(isValidGstin("")).toBe(false);
  });

  it("rejects arbitrary or malformed alphanumeric strings", () => {
    expect(isValidGstin("INVALIDGST123")).toBe(false);
    expect(isValidGstin("22AAAAA0000A1Z55")).toBe(false);
    expect(isValidGstin("22aaaaa0000a1z5")).toBe(false);
    expect(isValidGstin("22AAAAA0000A1Z5 ")).toBe(false);
    expect(isValidGstin("ABCDEFGHIJKL123")).toBe(false);
  });

  it("requires uppercase input, callers normalize first", () => {
    expect(isValidGstin(normalizeGstin(" 22aaaaa0000a1z5 "))).toBe(true);
  });
});

describe("PAN validation", () => {
  it("accepts the standard PAN structure", () => {
    expect(isValidPan("ABCDE1234F")).toBe(true);
    expect(isValidPan("AAAAA0000A")).toBe(true);
  });

  it("rejects malformed PANs", () => {
    expect(isValidPan("ABCDE1234")).toBe(false);
    expect(isValidPan("ABCDE12345F")).toBe(false);
    expect(isValidPan("abcde1234f")).toBe(false);
    expect(isValidPan("ABC1E2345F")).toBe(false);
  });
});

describe("PAN extraction from GSTIN", () => {
  it("extracts characters 3–12 regardless of state code", () => {
    expect(derivePanFromGstin("22ABCDE1234F1Z5")).toBe("ABCDE1234F");
    expect(derivePanFromGstin("27ABCDE1234F1Z5")).toBe("ABCDE1234F");
    expect(derivePanFromGstin("29AAAAA0000A1Z5")).toBe("AAAAA0000A");
  });

  it("extracts from normalized input", () => {
    expect(derivePanFromGstin(" 22abcde1234f1z5 ")).toBe("ABCDE1234F");
  });

  it("returns null for invalid or incomplete GSTINs — no PAN derivation", () => {
    expect(derivePanFromGstin("22ABC")).toBeNull();
    expect(derivePanFromGstin("INVALIDGST123")).toBeNull();
    expect(derivePanFromGstin("")).toBeNull();
  });
});
