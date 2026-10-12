import { subscriptionPlanOptions } from "../view-models/subscription-options";
import {
  derivePanFromGstin,
  isValidGstin,
  normalizeGstin,
  normalizePan,
} from "../../domain/value-objects/gstin";
import type { OnboardingErrors, OnboardingStep, OnboardingValues } from "../view-models/onboarding-form";

/** Immediate form feedback, not bank/tax validation or a server trust boundary. */
export const validateOnboardingStep = (step: OnboardingStep, values: OnboardingValues): OnboardingErrors => {
  const errors: OnboardingErrors = {};
  for (const group of step.groups) {
    for (const field of group.fields) {
      const value = (values[field.id] ?? "").trim();
      if (field.required && (field.kind === "checkbox" ? value !== "true" : !value)) {
        errors[field.id] = field.kind === "checkbox" ? "Please accept the terms to continue." : `Enter ${field.label.toLowerCase()}.`;
      } else if (value && field.kind === "select" && !field.options?.includes(value)) {
        errors[field.id] = "Choose an available option.";
      } else if (value && field.inputType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.id] = "Enter a valid business email.";
      } else if (value && field.inputType === "url") {
        try {
          const url = new URL(value);
          if (!["https:", "http:"].includes(url.protocol)) errors[field.id] = "Use an http:// or https:// website address.";
        } catch {
          errors[field.id] = "Enter a valid website address.";
        }
      }
    }
  }
  if (step.id === "tax") {
    const gstNumber = normalizeGstin(values.gstNumber ?? "");
    if (gstNumber !== "" && !isValidGstin(gstNumber)) errors.gstNumber = "Invalid GST number.";
    const derivedPan = derivePanFromGstin(gstNumber);
    const submittedPan = normalizePan(values.panNumber ?? "");
    if (submittedPan !== "" && derivedPan !== null && submittedPan !== derivedPan) {
      errors.panNumber = "Invalid PAN number.";
    }
    if (derivedPan === null && errors.gstNumber !== undefined) delete errors.panNumber;
  }
  if (step.id === "subscription") {
    if (!subscriptionPlanOptions.some((plan) => plan.id === values.plan)) errors.plan = "Choose a plan to continue.";
    if (!["Monthly", "Yearly"].includes(values.billingCycle ?? "")) errors.billingCycle = "Choose a billing cycle.";
  }
  return errors;
};
