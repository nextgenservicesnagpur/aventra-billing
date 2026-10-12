import { ValidationError } from "../../domain/errors/onboarding-errors";
import {
  derivePanFromGstin,
  normalizeGstin,
} from "../../domain/value-objects/gstin";
import type {
  BillingCycleValue,
  OnboardingCompletedSections,
  OnboardingFieldValues,
  SubscriptionPlanId,
} from "../dto/onboarding-dto";
import type { TaxDetailsInput } from "../validators/onboarding-schemas";

/**
 * Selected-column shapes for the onboarding rows. Declared structurally
 * so mappers stay pure and testable without a database connection; the
 * query layer is responsible for selecting exactly these fields.
 */
export type OrganizationProfileRecord = {
  legalName: string;
  displayName: string;
  businessEmail: string;
  phone: string;
  industry: string;
  companySize: string;
  website: string | null;
};

export type OrganizationAddressRecord = {
  country: string;
  state: string;
  city: string;
  postalCode: string;
  addressLine: string;
};

export type OrganizationTaxRecord = {
  gstNumber: string;
  panNumber: string;
  registeredBusinessName: string | null;
};

export type SubscriptionPlanEnum = "STARTER" | "BUSINESS" | "ENTERPRISE";
export type BillingCycleEnum = "MONTHLY" | "YEARLY";

export type OrganizationOnboardingRecord = {
  status: "IN_PROGRESS" | "COMPLETED";
  currentStep: number;
  plan: SubscriptionPlanEnum | null;
  billingCycle: BillingCycleEnum | null;
};

export type OnboardingRecords = {
  profile: OrganizationProfileRecord | null;
  address: OrganizationAddressRecord | null;
  tax: OrganizationTaxRecord | null;
  onboarding: OrganizationOnboardingRecord | null;
};

const subscriptionPlanIds: Record<SubscriptionPlanEnum, SubscriptionPlanId> = {
  STARTER: "starter",
  BUSINESS: "business",
  ENTERPRISE: "enterprise",
};

const subscriptionPlanEnums: Record<SubscriptionPlanId, SubscriptionPlanEnum> =
  {
    starter: "STARTER",
    business: "BUSINESS",
    enterprise: "ENTERPRISE",
  };

const billingCycleValues: Record<BillingCycleEnum, BillingCycleValue> = {
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const billingCycleEnums: Record<BillingCycleValue, BillingCycleEnum> = {
  Monthly: "MONTHLY",
  Yearly: "YEARLY",
};

/** Presentation plan id -> storable enum. */
export const toSubscriptionPlanEnum = (
  plan: SubscriptionPlanId,
): SubscriptionPlanEnum => subscriptionPlanEnums[plan];

/** Storable enum -> presentation plan id. */
export const toSubscriptionPlanId = (
  plan: SubscriptionPlanEnum,
): SubscriptionPlanId => subscriptionPlanIds[plan];

/** Presentation billing label -> storable enum. */
export const toBillingCycleEnum = (
  cycle: BillingCycleValue,
): BillingCycleEnum => billingCycleEnums[cycle];

/** Storable enum -> presentation billing label. */
export const toBillingCycleValue = (
  cycle: BillingCycleEnum,
): BillingCycleValue => billingCycleValues[cycle];

const trimToNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
};

/** Optional stored text -> presentation empty-string convention. */
const toFormValue = (value: string | null | undefined): string =>
  trimToNull(value) ?? "";

export const toCompletedSections = (
  records: OnboardingRecords,
): OnboardingCompletedSections => ({
  organization: records.profile !== null,
  address: records.address !== null,
  tax: records.tax !== null,
  subscription:
    records.onboarding !== null && records.onboarding.plan !== null,
});

/**
 * Builds the presentation-facing view state from selected onboarding
 * rows. Sections without stored rows stay absent so the presentation
 * layer's own defaults remain visible for untouched steps. A missing
 * onboarding row is synthesized as a fresh in-progress state; no write
 * ever happens inside a read.
 */
export const toOnboardingViewState = (
  records: OnboardingRecords,
): {
  status: "IN_PROGRESS" | "COMPLETED";
  currentStep: number;
  completed: OnboardingCompletedSections;
  values: OnboardingFieldValues;
  plan: SubscriptionPlanId | null;
  billingCycle: BillingCycleValue | null;
} => {
  const plan =
    records.onboarding?.plan == null
      ? null
      : toSubscriptionPlanId(records.onboarding.plan);
  const billingCycle =
    records.onboarding?.billingCycle == null
      ? null
      : toBillingCycleValue(records.onboarding.billingCycle);

  const values: OnboardingFieldValues = {};
  if (records.profile !== null) {
    values.legalName = records.profile.legalName;
    values.displayName = records.profile.displayName;
    values.businessEmail = records.profile.businessEmail;
    values.phone = records.profile.phone;
    values.industry = records.profile.industry;
    values.companySize = records.profile.companySize;
    values.website = toFormValue(records.profile.website);
  }
  if (records.address !== null) {
    values.country = records.address.country;
    values.state = records.address.state;
    values.city = records.address.city;
    values.postalCode = records.address.postalCode;
    values.businessAddress = records.address.addressLine;
  }
  if (records.tax !== null) {
    values.gstNumber = records.tax.gstNumber;
    values.panNumber = records.tax.panNumber;
    values.registeredBusinessName = toFormValue(
      records.tax.registeredBusinessName,
    );
  }
  if (plan !== null) {
    values.plan = plan;
    values.billingCycle = billingCycle ?? "";
  }

  return {
    status: records.onboarding?.status ?? "IN_PROGRESS",
    currentStep: records.onboarding?.currentStep ?? 0,
    completed: toCompletedSections(records),
    values,
    plan,
    billingCycle,
  };
};

/** Normalizes validated step input before persistence (trims, nulls blanks). */
export const normalizeStoredText = (
  value: string | null | undefined,
): string | null => trimToNull(value);

/**
 * Converts validated Step 3 input into the persisted tax-profile shape.
 * The GSTIN is normalized to its canonical form and the PAN is always
 * derived from it — client-supplied PAN text never reaches the database
 * independently, so gstNumber and panNumber can never disagree.
 */
export const toTaxProfileData = (
  input: TaxDetailsInput,
): {
  gstNumber: string;
  panNumber: string;
  registeredBusinessName: string | null;
} => {
  const gstNumber = normalizeGstin(input.gstNumber);
  const panNumber = derivePanFromGstin(gstNumber);
  if (panNumber === null) {
    throw new ValidationError("Invalid GST number.", {
      gstNumber: ["Invalid GST number."],
    });
  }
  return {
    gstNumber,
    panNumber,
    registeredBusinessName: normalizeStoredText(
      input.registeredBusinessName,
    ),
  };
};
