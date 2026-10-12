import { ValidationError } from "../errors/auth-errors";

const MAX_EMAIL_LENGTH = 320;

/**
 * Email address value object. Normalizes (trim + lowercase) before any
 * application check so every layer compares the same value. Enforces a
 * minimal structural invariant; full format validation happens at trust
 * boundaries with Zod.
 */
export const normalizeEmail = (input: string): string =>
  input.trim().toLowerCase();

const hasEmailStructure = (value: string): boolean => {
  if (value.length === 0 || value.length > MAX_EMAIL_LENGTH) {
    return false;
  }
  if (value.includes(" ")) {
    return false;
  }
  const atIndex = value.indexOf("@");
  return (
    atIndex > 0 &&
    value.indexOf("@", atIndex + 1) === -1 &&
    value.indexOf(".", atIndex + 1) > atIndex + 1
  );
};

export const createEmailAddress = (input: string): string => {
  const normalized = normalizeEmail(input);
  if (!hasEmailStructure(normalized)) {
    throw new ValidationError("Enter a valid email address.", {
      email: ["Enter a valid email address."],
    });
  }
  return normalized;
};
