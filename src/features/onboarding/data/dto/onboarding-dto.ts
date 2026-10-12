import type { OnboardingErrorCode } from "../../domain/errors/onboarding-errors";
import type { billingCycles, subscriptionPlans } from "../validators/onboarding-schemas";

/**
 * Serializable result envelope for onboarding server operations. Success
 * carries minimal safe data; failure carries a stable machine code, a
 * user-safe message, and optional per-field messages. Never contains
 * provider internals or raw database records.
 */
export type OnboardingActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: OnboardingErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export type OnboardingSectionId =
  | "organization"
  | "address"
  | "tax"
  | "subscription";

export type OnboardingCompletedSections = {
  organization: boolean;
  address: boolean;
  tax: boolean;
  subscription: boolean;
};

/** Presentation-native field values (plain strings, JSON-safe). */
export type OnboardingFieldValues = Record<string, string>;

export type SubscriptionPlanId = (typeof subscriptionPlans)[number];
export type BillingCycleValue = (typeof billingCycles)[number];

/**
 * Server-rendered onboarding state used to hydrate and resume the form:
 * which sections are stored, which step to open, and the saved values.
 */
export type OnboardingViewState = {
  status: "IN_PROGRESS" | "COMPLETED";
  currentStep: number;
  completed: OnboardingCompletedSections;
  values: OnboardingFieldValues;
  plan: SubscriptionPlanId | null;
  billingCycle: BillingCycleValue | null;
};

export type SaveStepResult = {
  stepId: OnboardingSectionId;
  completed: OnboardingCompletedSections;
  currentStep: number;
  values: OnboardingFieldValues;
};

export type CompleteOnboardingResult = {
  status: "COMPLETED";
  plan: SubscriptionPlanId;
  billingCycle: BillingCycleValue;
};
