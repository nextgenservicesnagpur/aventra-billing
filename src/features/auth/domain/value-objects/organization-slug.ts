export const MAX_SLUG_LENGTH = 60;
export const MAX_SLUG_ATTEMPTS = 10;
export const FALLBACK_SLUG = "organization";

/**
 * Organization slug value object. Deterministic, lowercase, URL-safe, and
 * Unicode-tolerant: NFKD decomposition transliterates accented Latin
 * characters before remaining non-ASCII marks are dropped, so names in
 * other scripts fall back cleanly. Collision handling appends an explicit
 * numeric suffix; callers check availability and never silently overwrite.
 */
export const createOrganizationSlug = (organizationName: string): string => {
  const normalized = organizationName
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-$/g, "");
  return normalized === "" ? FALLBACK_SLUG : normalized;
};

export const withOrganizationSlugSuffix = (
  baseSlug: string,
  attempt: number,
): string => (attempt <= 1 ? baseSlug : `${baseSlug}-${attempt}`);
