import { describe, expect, it } from "vitest";
import { createOnboardingValues, onboardingSteps, type OnboardingStep, type OnboardingValues } from "../view-models/onboarding-form";
import { validateOnboardingStep } from "./onboarding-validation";
import { indiaStateOptions } from "../view-models/india-address-options";

const getStep = (id: OnboardingStep["id"]) => {
  const step = onboardingSteps.find((candidate) => candidate.id === id);
  if (!step) throw new Error(`Missing step: ${id}`);
  return step;
};
const validOrganization = (): OnboardingValues => ({ ...createOnboardingValues("Nextgen Services"), businessEmail: "billing@example.com", phone: "+91 9876543210", industry: "Professional services", companySize: "2–10 employees", country: "India", state: "Maharashtra", city: "Mumbai", postalCode: "400001", businessAddress: "10 Business Road" });

describe("Onboarding presentation validation", () => {
  it("keeps Organization separate from Address in the four-step flow", () => {
    expect(onboardingSteps.map((step) => step.id)).toEqual(["organization", "address", "tax", "subscription"]);
    const errors = validateOnboardingStep(getStep("organization"), createOnboardingValues("Nextgen Services"));
    expect(errors.businessEmail).toBeDefined();
    expect(errors.country).toBeUndefined();
    expect(errors.businessAddress).toBeUndefined();
    expect(validateOnboardingStep(getStep("organization"), validOrganization())).toEqual({});
  });
  it("requires the registered address in its own step", () => {
    const errors = validateOnboardingStep(getStep("address"), createOnboardingValues("Nextgen Services"));
    expect(errors.country).toBeUndefined();
    expect(errors.state).toBeDefined();
    expect(errors.businessAddress).toBeDefined();
    expect(validateOnboardingStep(getStep("address"), validOrganization())).toEqual({});
  });
  it("preselects India and accepts only Indian state or territory choices", () => {
    expect(createOnboardingValues("").country).toBe("India");
    expect(indiaStateOptions).toHaveLength(36);
    expect(indiaStateOptions).toContain("Maharashtra");
    expect(indiaStateOptions).toContain("Ladakh");
    expect(validateOnboardingStep(getStep("address"), { ...validOrganization(), country: "United States", state: "California" })).toMatchObject({ country: expect.any(String), state: expect.any(String) });
  });
  it("accepts an optional website but rejects malformed or unsafe URLs", () => {
    for (const website of ["not a URL", "javascript:alert(1)"]) expect(validateOnboardingStep(getStep("organization"), { ...validOrganization(), website }).website).toBeDefined();
    expect(validateOnboardingStep(getStep("organization"), { ...validOrganization(), website: "https://example.com" })).toEqual({});
  });
  it("rejects invalid email addresses and select values", () => {
    const errors = validateOnboardingStep(getStep("organization"), { ...validOrganization(), businessEmail: "invalid", industry: "not an option" });
    expect(errors.businessEmail).toBeDefined();
    expect(errors.industry).toBeDefined();
  });
  it("uses only GST/PAN fields in Tax & Compliance", () => {
    expect(getStep("tax").groups.flatMap((group) => group.fields.map((field) => field.id))).toEqual([
      "gstNumber",
      "panNumber",
      "registeredBusinessName",
    ]);
  });
  it("requires GST, surfaces format errors, and keeps PAN quiet until GST is valid", () => {
    const empty = validateOnboardingStep(getStep("tax"), createOnboardingValues(""));
    expect(empty.gstNumber).toBeDefined();
    expect(empty.panNumber).toBeUndefined();
    expect(validateOnboardingStep(getStep("tax"), { ...createOnboardingValues(""), gstNumber: "22ABC" })).toEqual({
      gstNumber: "Invalid GST number.",
    });
    expect(validateOnboardingStep(getStep("tax"), { ...createOnboardingValues(""), gstNumber: "INVALIDGST123" })).toMatchObject({
      gstNumber: "Invalid GST number.",
    });
  });
  it("accepts a valid synced GSTIN/PAN pair and rejects a mismatched PAN", () => {
    const values = { ...createOnboardingValues(""), gstNumber: "22ABCDE1234F1Z5", panNumber: "ABCDE1234F" };
    expect(validateOnboardingStep(getStep("tax"), values)).toEqual({});
    expect(validateOnboardingStep(getStep("tax"), { ...values, panNumber: "XYZAB5678C" })).toMatchObject({
      panNumber: "Invalid PAN number.",
    });
  });
  it("requires a UI plan choice, cycle and consent", () => {
    const step = getStep("subscription");
    const values = createOnboardingValues("");
    expect(validateOnboardingStep(step, values)).toMatchObject({ plan: expect.any(String), acceptTerms: expect.any(String) });
    expect(validateOnboardingStep(step, { ...values, plan: "business", acceptTerms: "true" })).toEqual({});
    expect(validateOnboardingStep(step, { ...values, plan: "fake-plan", billingCycle: "invalid" })).toHaveProperty("billingCycle");
  });
});
