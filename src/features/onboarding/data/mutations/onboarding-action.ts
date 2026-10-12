import { OnboardingError, ValidationError } from "../../domain/errors/onboarding-errors";
import type { OnboardingActionResult } from "../dto/onboarding-dto";

const GENERIC_MESSAGE =
  "Something went wrong while saving your onboarding details. Please try again.";

/**
 * Converts any thrown value into a safe domain error. Expected failures
 * (session, authorization, validation) already carry user-safe messages;
 * unexpected provider failures become a generic message with the original
 * attached as cause for server-side context only — it never reaches the UI.
 */
export const mapOnboardingError = (error: unknown): OnboardingError => {
  if (error instanceof OnboardingError) {
    return error;
  }
  return new OnboardingError("ONBOARDING_ERROR", GENERIC_MESSAGE, error);
};

/**
 * Runs an onboarding server operation and converts any failure into the
 * serializable result envelope. Nothing raw ever leaves the server
 * boundary: only stable codes, safe messages, and per-field validation
 * details are returned.
 */
export const runOnboardingAction = async <T>(
  operation: () => Promise<T>,
): Promise<OnboardingActionResult<T>> => {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    const appError = mapOnboardingError(error);
    const result: Extract<OnboardingActionResult<T>, { ok: false }> = {
      ok: false,
      code: appError.code,
      message: appError.message,
    };
    if (appError instanceof ValidationError) {
      return { ...result, fieldErrors: appError.fieldErrors };
    }
    return result;
  }
};
