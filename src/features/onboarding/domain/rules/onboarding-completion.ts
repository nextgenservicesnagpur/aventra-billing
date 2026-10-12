/**
 * Pure onboarding progress rules. Operate on plain per-section completion
 * flags so server and presentation logic share one definition of "done".
 * Step order is fixed: organization → address → tax → subscription.
 */
export type OnboardingProgress = {
  organization: boolean;
  address: boolean;
  tax: boolean;
  subscription: boolean;
};

export const ONBOARDING_STEP_COUNT = 4;

const orderedFlags = (
  progress: OnboardingProgress,
): readonly boolean[] => [
  progress.organization,
  progress.address,
  progress.tax,
  progress.subscription,
];

export const isOnboardingComplete = (
  progress: OnboardingProgress,
): boolean => orderedFlags(progress).every((done) => done);

/**
 * Index of the first incomplete step, or ONBOARDING_STEP_COUNT when every
 * step is complete. Drives both initial step resolution and direct-access
 * gating: a step is reachable only when every previous step is done.
 */
export const firstIncompleteStep = (
  progress: OnboardingProgress,
): number => {
  const flags = orderedFlags(progress);
  const index = flags.findIndex((done) => !done);
  return index === -1 ? ONBOARDING_STEP_COUNT : index;
};

export const canAccessStep = (
  progress: OnboardingProgress,
  stepIndex: number,
): boolean =>
  stepIndex >= 0 &&
  stepIndex < ONBOARDING_STEP_COUNT &&
  stepIndex <= firstIncompleteStep(progress);

/**
 * Step to open when (re)loading the form: the first incomplete step,
 * clamped to the last real step so a fully-flagged but not-yet-committed
 * state can never render past the form.
 */
export const resumeStep = (progress: OnboardingProgress): number =>
  Math.min(firstIncompleteStep(progress), ONBOARDING_STEP_COUNT - 1);
