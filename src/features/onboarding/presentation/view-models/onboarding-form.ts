import type { HTMLInputTypeAttribute } from "react";
import { indiaStateOptions } from "./india-address-options";

export type OnboardingValues = Record<string, string>;
export type OnboardingErrors = Record<string, string>;
export type OnboardingField = {
  id: string;
  label: string;
  kind?: "input" | "select" | "textarea" | "checkbox";
  inputType?: HTMLInputTypeAttribute;
  autoComplete?: string;
  placeholder?: string;
  options?: readonly string[];
  required?: boolean;
  fullWidth?: boolean;
  readOnly?: boolean;
  defaultValue?: string;
  icon?: "business" | "name" | "email" | "phone" | "industry" | "team" | "website";
};
export type OnboardingGroup = { title: string; fields: readonly OnboardingField[] };
export type OnboardingStep = {
  id: "organization" | "address" | "tax" | "subscription";
  label: string;
  heading: string;
  description: string;
  groups: readonly OnboardingGroup[];
};

export const onboardingSteps: readonly OnboardingStep[] = [
  {
    id: "organization", label: "Organization", heading: "Organization details",
    description: "Set up the basic information about your business.",
    groups: [
      { title: "", fields: [
        { id: "legalName", label: "Legal business name", required: true, autoComplete: "organization", icon: "business" },
        { id: "displayName", label: "Display name", required: true, icon: "name" },
        { id: "businessEmail", label: "Business email", inputType: "email", autoComplete: "email", required: true, placeholder: "billing@company.com", icon: "email" },
        { id: "phone", label: "Phone", inputType: "tel", autoComplete: "tel", required: true, placeholder: "+91 98765 43210", icon: "phone" },
        { id: "industry", label: "Industry", kind: "select", required: true, icon: "industry", options: ["Professional services", "Technology", "Retail & commerce", "Manufacturing", "Healthcare", "Education", "Construction", "Other"] },
        { id: "companySize", label: "Company size", kind: "select", required: true, icon: "team", options: ["Just me", "2–10 employees", "11–50 employees", "51–200 employees", "201+ employees"] },
        { id: "website", label: "Website", inputType: "url", autoComplete: "url", placeholder: "https://company.com", icon: "website" },
      ] },
    ],
  },
  {
    id: "address", label: "Address", heading: "Business address",
    description: "Add the registered address for your business.",
    groups: [
      { title: "", fields: [
        { id: "country", label: "Country", kind: "select", required: true, options: ["India"], defaultValue: "India" },
        { id: "state", label: "State / Province", kind: "select", options: indiaStateOptions, required: true },
        { id: "city", label: "City", autoComplete: "address-level2", required: true },
        { id: "postalCode", label: "Postal code", autoComplete: "postal-code", required: true },
        { id: "businessAddress", label: "Registered / Business address", kind: "textarea", autoComplete: "street-address", required: true, fullWidth: true },
      ] },
    ],
  },
  {
    id: "tax", label: "Tax & Compliance", heading: "Tax & compliance",
    description: "Add the registration details that apply to your business.",
    groups: [
      { title: "", fields: [
        { id: "gstNumber", label: "GST number", required: true, fullWidth: true },
        { id: "panNumber", label: "PAN number", required: true, readOnly: true, fullWidth: true },
        { id: "registeredBusinessName", label: "Registered business name", fullWidth: true },
      ] },
    ],
  },
  {
    id: "subscription", label: "Subscription", heading: "Choose your subscription",
    description: "Select a plan and billing cycle, then review your setup.",
    groups: [
      { title: "", fields: [
        { id: "acceptTerms", label: "I accept the subscription terms.", kind: "checkbox", required: true, fullWidth: true },
      ] },
    ],
  },
];

/**
 * Presentation defaults for a fresh run; stored server state is layered
 * over these by the form. Never persisted or sent to a server on its own.
 */
export const createOnboardingValues = (
  organizationName: string,
  businessEmail = "",
): OnboardingValues => {
  const values: OnboardingValues = {};
  for (const step of onboardingSteps) {
    for (const group of step.groups) {
      for (const field of group.fields) values[field.id] = field.defaultValue ?? "";
    }
  }
  return {
    ...values,
    legalName: organizationName,
    displayName: organizationName,
    registeredBusinessName: organizationName,
    businessEmail,
    plan: "",
    billingCycle: "Monthly",
  };
};
