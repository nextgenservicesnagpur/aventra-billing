"use server";

import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/shared/lib/prisma";
import { ValidationError } from "../../domain/errors/onboarding-errors";
import {
  ONBOARDING_STEP_COUNT,
  canAccessStep,
  firstIncompleteStep,
} from "../../domain/rules/onboarding-completion";
import type {
  OnboardingActionResult,
  OnboardingCompletedSections,
  OnboardingFieldValues,
  OnboardingSectionId,
  SaveStepResult,
} from "../dto/onboarding-dto";
import {
  normalizeStoredText,
  toCompletedSections,
  toTaxProfileData,
} from "../mappers/onboarding-mappers";
import { resolveOnboardingContext } from "../queries/onboarding-context";
import { loadOnboardingRecords } from "../queries/onboarding-state";
import { runOnboardingAction } from "./onboarding-action";
import {
  addressDetailsSchema,
  organizationDetailsSchema,
  parseOnboardingInput,
  savableStepSchema,
  taxDetailsSchema,
} from "../validators/onboarding-schemas";

type SaveableStep = Exclude<OnboardingSectionId, "subscription">;

const SAVEABLE_STEPS: readonly SaveableStep[] = [
  "organization",
  "address",
  "tax",
];

type StepWrite = {
  values: OnboardingFieldValues;
  operation: Prisma.PrismaPromise<unknown>;
};

const buildStepWrite = (
  stepId: SaveableStep,
  organizationId: string,
  rawValues: unknown,
): StepWrite => {
  const prisma = getPrisma();
  if (stepId === "organization") {
    const input = parseOnboardingInput(organizationDetailsSchema, rawValues);
    const stored = {
      legalName: input.legalName,
      displayName: input.displayName,
      businessEmail: input.businessEmail,
      phone: input.phone,
      industry: input.industry,
      companySize: input.companySize,
      website: normalizeStoredText(input.website),
    };
    return {
      values: {
        legalName: input.legalName,
        displayName: input.displayName,
        businessEmail: input.businessEmail,
        phone: input.phone,
        industry: input.industry,
        companySize: input.companySize,
        website: input.website,
      },
      operation: prisma.organizationProfile.upsert({
        where: { organizationId },
        create: { organizationId, ...stored },
        update: stored,
      }),
    };
  }
  if (stepId === "address") {
    const input = parseOnboardingInput(addressDetailsSchema, rawValues);
    const stored = {
      country: input.country,
      state: input.state,
      city: input.city,
      postalCode: input.postalCode,
      addressLine: input.businessAddress,
    };
    return {
      values: {
        country: input.country,
        state: input.state,
        city: input.city,
        postalCode: input.postalCode,
        businessAddress: input.businessAddress,
      },
      operation: prisma.organizationAddress.upsert({
        where: { organizationId },
        create: { organizationId, ...stored },
        update: stored,
      }),
    };
  }
  const input = parseOnboardingInput(taxDetailsSchema, rawValues);
  const stored = toTaxProfileData(input);
  return {
    values: {
      gstNumber: stored.gstNumber,
      panNumber: stored.panNumber,
      registeredBusinessName: input.registeredBusinessName ?? "",
    },
    operation: prisma.organizationTaxProfile.upsert({
      where: { organizationId },
      create: { organizationId, ...stored },
      update: stored,
    }),
  };
};

/**
 * Persists one validated onboarding step for the caller's organization.
 * Steps are sequential: the step must be reachable from the stored
 * completion state, input passes the Zod trust boundary, and the section
 * write commits atomically with the resume-position update. Subscription
 * is excluded — the final step completes onboarding instead.
 */
export const saveOnboardingStep = async (
  rawStepId: unknown,
  rawValues: unknown,
): Promise<OnboardingActionResult<SaveStepResult>> =>
  runOnboardingAction(async (): Promise<SaveStepResult> => {
    const { stepId } = parseOnboardingInput(savableStepSchema, {
      stepId: rawStepId,
    });
    const { organizationId } = await resolveOnboardingContext();

    const records = await loadOnboardingRecords(organizationId);
    const progress = toCompletedSections(records);
    const stepIndex = SAVEABLE_STEPS.indexOf(stepId);
    if (stepIndex === -1 || !canAccessStep(progress, stepIndex)) {
      throw new ValidationError(
        "Complete the previous steps before saving this one.",
      );
    }

    const write = buildStepWrite(stepId, organizationId, rawValues);
    const completed: OnboardingCompletedSections = {
      organization: progress.organization || stepId === "organization",
      address: progress.address || stepId === "address",
      tax: progress.tax || stepId === "tax",
      subscription: progress.subscription,
    };
    const currentStep = Math.min(
      Math.max(
        records.onboarding?.currentStep ?? 0,
        firstIncompleteStep(completed),
      ),
      ONBOARDING_STEP_COUNT - 1,
    );

    const prisma = getPrisma();
    await prisma.$transaction([
      write.operation,
      prisma.organizationOnboarding.upsert({
        where: { organizationId },
        create: { organizationId, currentStep },
        update: { currentStep },
      }),
    ]);

    return { stepId, completed, currentStep, values: write.values };
  });
