import { describe, expect, it } from "vitest";
import {
  FALLBACK_SLUG,
  MAX_SLUG_LENGTH,
  createOrganizationSlug,
  withOrganizationSlugSuffix,
} from "./organization-slug";

describe("createOrganizationSlug", () => {
  it("lowercases and hyphenates names", () => {
    expect(createOrganizationSlug("Acme Corporation")).toBe(
      "acme-corporation",
    );
  });

  it("transliterates diacritics and drops other scripts", () => {
    expect(createOrganizationSlug("Café München!")).toBe("cafe-munchen");
    expect(createOrganizationSlug("北京公司")).toBe(FALLBACK_SLUG);
  });

  it("collapses separators and trims edges", () => {
    expect(createOrganizationSlug("  --Acme__  Corp--  ")).toBe("acme-corp");
  });

  it("falls back for empty input and caps length", () => {
    expect(createOrganizationSlug("   ")).toBe(FALLBACK_SLUG);
    expect(createOrganizationSlug("!!!")).toBe(FALLBACK_SLUG);
    expect(createOrganizationSlug("a".repeat(200)).length).toBeLessThanOrEqual(
      MAX_SLUG_LENGTH,
    );
  });
});

describe("withOrganizationSlugSuffix", () => {
  it("keeps the base slug on the first attempt", () => {
    expect(withOrganizationSlugSuffix("acme", 1)).toBe("acme");
  });

  it("appends an explicit counter afterwards", () => {
    expect(withOrganizationSlugSuffix("acme", 2)).toBe("acme-2");
    expect(withOrganizationSlugSuffix("acme", 10)).toBe("acme-10");
  });
});
