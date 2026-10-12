import { describe, expect, it } from "vitest";
import { ValidationError } from "../../domain/errors/onboarding-errors";
import { derivePanFromGstin } from "../../domain/value-objects/gstin";
import {
  normalizeStoredText,
  toBillingCycleEnum,
  toBillingCycleValue,
  toCompletedSections,
  toOnboardingViewState,
  toSubscriptionPlanEnum,
  toSubscriptionPlanId,
  toTaxProfileData,
  type OnboardingRecords,
} from "./onboarding-mappers";

const fullRecords: OnboardingRecords = {
  profile: {
    legalName: "Nextgen Services",
    displayName: "Nextgen",
    businessEmail: "billing@nextgen.example",
    phone: "+91 98765 43210",
    industry: "Technology",
    companySize: "11–50 employees",
    website: "https://nextgen.example",
  },
  address: {
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    postalCode: "560001",
    addressLine: "12 MG Road",
  },
  tax: {
    gstNumber: "22ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    registeredBusinessName: null,
  },
  onboarding: {
    status: "COMPLETED",
    currentStep: 3,
    plan: "BUSINESS",
    billingCycle: "YEARLY",
  },
};

const emptyRecords: OnboardingRecords = {
  profile: null,
  address: null,
  tax: null,
  onboarding: null,
};

describe("onboarding enum mappers", () => {
  it("round-trips plan and billing values between form and storage", () => {
    expect(toSubscriptionPlanEnum("starter")).toBe("STARTER");
    expect(toSubscriptionPlanEnum("enterprise")).toBe("ENTERPRISE");
    expect(toSubscriptionPlanId("BUSINESS")).toBe("business");
    expect(toBillingCycleEnum("Monthly")).toBe("MONTHLY");
    expect(toBillingCycleValue("YEARLY")).toBe("Yearly");
  });

  it("normalizes stored text: trims, and blanks to null", () => {
    expect(normalizeStoredText("  value  ")).toBe("value");
    expect(normalizeStoredText("   ")).toBeNull();
    expect(normalizeStoredText(null)).toBeNull();
    expect(normalizeStoredText(undefined)).toBeNull();
  });
});

describe("onboarding view-state mapper", () => {
  it("maps every stored row onto presentation field ids", () => {
    const state = toOnboardingViewState(fullRecords);
    expect(state.status).toBe("COMPLETED");
    expect(state.currentStep).toBe(3);
    expect(state.completed).toEqual({
      organization: true,
      address: true,
      tax: true,
      subscription: true,
    });
    expect(state.values.legalName).toBe("Nextgen Services");
    expect(state.values.businessAddress).toBe("12 MG Road");
    expect(state.values.gstNumber).toBe("22ABCDE1234F1Z5");
    expect(state.values.panNumber).toBe("ABCDE1234F");
    expect(state.values.registeredBusinessName).toBe("");
    expect(state.plan).toBe("business");
    expect(state.billingCycle).toBe("Yearly");
    expect(state.values.plan).toBe("business");
    expect(state.values.billingCycle).toBe("Yearly");
  });

  it("synthesizes a fresh in-progress state when nothing is stored", () => {
    const state = toOnboardingViewState(emptyRecords);
    expect(state.status).toBe("IN_PROGRESS");
    expect(state.currentStep).toBe(0);
    expect(state.values).toEqual({});
    expect(state.plan).toBeNull();
    expect(state.billingCycle).toBeNull();
    expect(toCompletedSections(emptyRecords)).toEqual({
      organization: false,
      address: false,
      tax: false,
      subscription: false,
    });
  });

  it("marks subscription only when a plan is actually stored", () => {
    const sections = toCompletedSections({
      ...fullRecords,
      onboarding: {
        status: "IN_PROGRESS",
        currentStep: 3,
        plan: null,
        billingCycle: null,
      },
    });
    expect(sections.subscription).toBe(false);
    expect(sections.organization).toBe(true);
  });
});

describe("tax profile persistence mapping", () => {
  it("normalizes GSTIN and always persists the derived PAN", () => {
    const stored = toTaxProfileData({
      gstNumber: " 22abcde1234f1z5 ",
      panNumber: "ABCDE1234F",
      registeredBusinessName: "  Nextgen Services  ",
    });
    expect(stored).toEqual({
      gstNumber: "22ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
      registeredBusinessName: "Nextgen Services",
    });
    expect(stored.panNumber).toBe(
      derivePanFromGstin(stored.gstNumber),
    );
  });

  it("ignores client-supplied PAN text so GSTIN stays the source of truth", () => {
    const stored = toTaxProfileData({
      gstNumber: "27ABCDE1234F1Z5",
      panNumber: "XYZAB5678C",
    });
    expect(stored.panNumber).toBe("ABCDE1234F");
    expect(stored.gstNumber).toBe("27ABCDE1234F1Z5");
  });

  it("stores a blank registered business name as null", () => {
    expect(
      toTaxProfileData({
        gstNumber: "22ABCDE1234F1Z5",
        panNumber: "ABCDE1234F",
        registeredBusinessName: "",
      }).registeredBusinessName,
    ).toBeNull();
  });

  it("rejects persistence when the GSTIN yields no valid PAN", () => {
    expect(() =>
      toTaxProfileData({
        gstNumber: "22ABC",
        panNumber: "ABCDE1234F",
      }),
    ).toThrowError(ValidationError);
  });
});
