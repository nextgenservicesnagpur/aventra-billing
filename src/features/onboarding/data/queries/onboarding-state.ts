import "server-only";

import { getPrisma } from "@/shared/lib/prisma";
import type { OnboardingViewState } from "../dto/onboarding-dto";
import {
  toOnboardingViewState,
  type OnboardingRecords,
} from "../mappers/onboarding-mappers";

const profileSelect = {
  legalName: true,
  displayName: true,
  businessEmail: true,
  phone: true,
  industry: true,
  companySize: true,
  website: true,
} as const;

const addressSelect = {
  country: true,
  state: true,
  city: true,
  postalCode: true,
  addressLine: true,
} as const;

const taxSelect = {
  gstNumber: true,
  panNumber: true,
  registeredBusinessName: true,
} as const;

const onboardingSelect = {
  status: true,
  currentStep: true,
  plan: true,
  billingCycle: true,
} as const;

/** Reads the four onboarding rows for an organization (selects only what is used). */
export const loadOnboardingRecords = async (
  organizationId: string,
): Promise<OnboardingRecords> => {
  const prisma = getPrisma();
  const [profile, address, tax, onboarding] = await Promise.all([
    prisma.organizationProfile.findUnique({
      where: { organizationId },
      select: profileSelect,
    }),
    prisma.organizationAddress.findUnique({
      where: { organizationId },
      select: addressSelect,
    }),
    prisma.organizationTaxProfile.findUnique({
      where: { organizationId },
      select: taxSelect,
    }),
    prisma.organizationOnboarding.findUnique({
      where: { organizationId },
      select: onboardingSelect,
    }),
  ]);
  return { profile, address, tax, onboarding };
};

/** Server-rendered onboarding state used to hydrate and resume the form. */
export const loadOnboardingViewState = async (
  organizationId: string,
): Promise<OnboardingViewState> =>
  toOnboardingViewState(await loadOnboardingRecords(organizationId));
