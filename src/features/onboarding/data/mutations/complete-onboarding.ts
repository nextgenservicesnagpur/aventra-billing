"use server";

import { getPrisma } from "@/shared/lib/prisma";
import { OnboardingNotCompletableError } from "../../domain/errors/onboarding-errors";
import { ONBOARDING_STEP_COUNT } from "../../domain/rules/onboarding-completion";
import type {
  CompleteOnboardingResult,
  OnboardingActionResult,
} from "../dto/onboarding-dto";
import {
  toBillingCycleEnum,
  toCompletedSections,
  toSubscriptionPlanEnum,
} from "../mappers/onboarding-mappers";
import { resolveOnboardingContext } from "../queries/onboarding-context";
import { loadOnboardingRecords } from "../queries/onboarding-state";
import { runOnboardingAction } from "./onboarding-action";
import {
  completionSchema,
  parseOnboardingInput,
} from "../validators/onboarding-schemas";

/**
 * Completes onboarding: re-authorizes the caller, proves every earlier
 * section is actually stored, validates the final subscription payload
 * (including terms acceptance), and commits plan, billing cycle, and the
 * COMPLETED status in one transaction. Steps can never be skipped: the
 * section rows must already exist from previous authorized saves.
 */
export const completeOnboarding = async (
  rawValues: unknown,
): Promise<OnboardingActionResult<CompleteOnboardingResult>> =>
  runOnboardingAction(async (): Promise<CompleteOnboardingResult> => {
    const { organizationId } = await resolveOnboardingContext();
    const input = parseOnboardingInput(completionSchema, rawValues);

    const records = await loadOnboardingRecords(organizationId);
    const completed = toCompletedSections(records);
    if (!(completed.organization && completed.address && completed.tax)) {
      throw new OnboardingNotCompletableError();
    }

    const stored = {
      status: "COMPLETED" as const,
      currentStep: ONBOARDING_STEP_COUNT - 1,
      plan: toSubscriptionPlanEnum(input.plan),
      billingCycle: toBillingCycleEnum(input.billingCycle),
      completedAt: new Date(),
    };
    const prisma = getPrisma();
    await prisma.organizationOnboarding.upsert({
      where: { organizationId },
      create: { organizationId, ...stored },
      update: stored,
    });

    return {
      status: "COMPLETED",
      plan: input.plan,
      billingCycle: input.billingCycle,
    };
  });
