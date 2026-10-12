import { describe, expect, it } from "vitest";
import { ValidationError } from "../../domain/errors/onboarding-errors";
import {
  addressDetailsSchema,
  completionSchema,
  organizationDetailsSchema,
  parseOnboardingInput,
  savableStepSchema,
  taxDetailsSchema,
} from "./onboarding-schemas";

const validOrganization = {
  legalName: "  Nextgen Services  ",
  displayName: "Nextgen",
  businessEmail: "billing@nextgen.example",
  phone: "+91 98765 43210",
  industry: "Technology",
  companySize: "11–50 employees",
  website: "https://nextgen.example",
};

const validAddress = {
  country: "India",
  state: "Karnataka",
  city: "Bengaluru",
  postalCode: "560001",
  businessAddress: "12 MG Road",
};

const parseFailure = (schema: Parameters<typeof parseOnboardingInput>[0], input: unknown) => {
  try {
    parseOnboardingInput(schema, input);
    return null;
  } catch (error) {
    if (error instanceof ValidationError) return error;
    throw error;
  }
};

describe("onboarding trust-boundary validation", () => {
  it("accepts a valid organization payload and trims free text", () => {
    const parsed = parseOnboardingInput(
      organizationDetailsSchema,
      validOrganization,
    );
    expect(parsed.legalName).toBe("Nextgen Services");
    expect(parsed.displayName).toBe("Nextgen");
  });

  it("rejects whitespace-only required fields", () => {
    const failure = parseFailure(organizationDetailsSchema, {
      ...validOrganization,
      legalName: "   ",
    });
    expect(failure?.code).toBe("VALIDATION_FAILED");
    expect(failure?.fieldErrors.legalName).toBeDefined();
  });

  it("rejects malformed email, phone, and website values", () => {
    const failure = parseFailure(organizationDetailsSchema, {
      ...validOrganization,
      businessEmail: "not-an-email",
      phone: "call-me",
      website: "ftp://nextgen.example",
    });
    expect(failure?.fieldErrors.businessEmail).toBeDefined();
    expect(failure?.fieldErrors.phone).toBeDefined();
    expect(failure?.fieldErrors.website).toBeDefined();
  });

  it("allows an empty website but not a missing required address", () => {
    const parsed = parseOnboardingInput(organizationDetailsSchema, {
      ...validOrganization,
      website: "",
    });
    expect(parsed.website).toBe("");

    const failure = parseFailure(addressDetailsSchema, {
      ...validAddress,
      city: "",
    });
    expect(failure?.fieldErrors.city).toBeDefined();
  });

  it("rejects invalid postal codes and too-long addresses", () => {
    const failure = parseFailure(addressDetailsSchema, {
      ...validAddress,
      postalCode: "560 0!1",
      businessAddress: "x".repeat(501),
    });
    expect(failure?.fieldErrors.postalCode).toBeDefined();
    expect(failure?.fieldErrors.businessAddress).toBeDefined();
  });

  it("accepts a valid GST payload with derived PAN and optional business name", () => {
    const parsed = parseOnboardingInput(taxDetailsSchema, {
      gstNumber: " 22abcde1234f1z5 ",
      panNumber: "abcde1234f",
      registeredBusinessName: "Nextgen Services",
    });
    expect(parsed.gstNumber).toBe("22ABCDE1234F1Z5");
    expect(parsed.panNumber).toBe("ABCDE1234F");
    expect(parsed.registeredBusinessName).toBe("Nextgen Services");
  });

  it("requires GST and rejects malformed or wrong-length GSTINs", () => {
    const missing = parseFailure(taxDetailsSchema, { panNumber: "ABCDE1234F" });
    expect(missing?.fieldErrors.gstNumber).toBeDefined();

    for (const gstNumber of ["22ABC", "INVALIDGST123", "22AAAAA0000A1Z", "22AAAAA0000A1Z55"]) {
      const failure = parseFailure(taxDetailsSchema, { gstNumber });
      expect(failure?.fieldErrors.gstNumber).toEqual([
        "Invalid GST number.",
      ]);
    }
  });

  it("accepts an omitted derived PAN but rejects a mismatched one", () => {
    const omitted = parseOnboardingInput(taxDetailsSchema, {
      gstNumber: "22ABCDE1234F1Z5",
    });
    expect(omitted.panNumber).toBeUndefined();

    const blank = parseOnboardingInput(taxDetailsSchema, {
      gstNumber: "22ABCDE1234F1Z5",
      panNumber: "",
    });
    expect(blank.panNumber).toBe("");

    const failure = parseFailure(taxDetailsSchema, {
      gstNumber: "22ABCDE1234F1Z5",
      panNumber: "XYZAB5678C",
    });
    expect(failure?.fieldErrors.panNumber).toEqual(["Invalid PAN number."]);
  });

  it("keeps registered business name optional but bounded", () => {
    const parsed = parseOnboardingInput(taxDetailsSchema, {
      gstNumber: "22ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
    });
    expect(parsed.registeredBusinessName).toBeUndefined();

    const failure = parseFailure(taxDetailsSchema, {
      gstNumber: "22ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
      registeredBusinessName: "x".repeat(101),
    });
    expect(failure?.fieldErrors.registeredBusinessName).toBeDefined();
  });

  it("only accepts the savable step ids", () => {
    expect(
      parseOnboardingInput(savableStepSchema, { stepId: "address" }).stepId,
    ).toBe("address");
    const failure = parseFailure(savableStepSchema, {
      stepId: "subscription",
    });
    expect(failure?.fieldErrors.stepId).toBeDefined();
  });

  it("requires a known plan, billing cycle, and accepted terms to complete", () => {
    const parsed = parseOnboardingInput(completionSchema, {
      plan: "business",
      billingCycle: "Monthly",
      acceptTerms: "true",
    });
    expect(parsed.plan).toBe("business");

    const unknownPlan = parseFailure(completionSchema, {
      plan: "free-forever",
      billingCycle: "Monthly",
      acceptTerms: "true",
    });
    expect(unknownPlan?.fieldErrors.plan).toBeDefined();

    const rejectedTerms = parseFailure(completionSchema, {
      plan: "starter",
      billingCycle: "Yearly",
      acceptTerms: "false",
    });
    expect(rejectedTerms?.fieldErrors.acceptTerms).toBeDefined();
  });
});
