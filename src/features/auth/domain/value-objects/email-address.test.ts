import { describe, expect, it } from "vitest";
import { ValidationError } from "../errors/auth-errors";
import { createEmailAddress, normalizeEmail } from "./email-address";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Owner@Acme.TEST  ")).toBe("owner@acme.test");
  });
});

describe("createEmailAddress", () => {
  it("returns the normalized address for valid input", () => {
    expect(createEmailAddress("  Owner@Acme.TEST  ")).toBe(
      "owner@acme.test",
    );
  });

  it("rejects malformed addresses with a domain error", () => {
    for (const input of ["", "nope", "a@b", "a b@c.com", "@c.com"]) {
      expect(() => createEmailAddress(input)).toThrowError(ValidationError);
    }
  });
});
