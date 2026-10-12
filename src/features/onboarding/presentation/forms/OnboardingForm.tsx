"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { useReducedMotionPreference } from "@/shared/animation/useReducedMotionPreference";
import { Stepper } from "@/shared/components/Stepper";
import { Button } from "@/shared/components/form/Button";
import { Form } from "@/shared/components/form/Form";
import { FormError } from "@/shared/components/form/FormError";
import { resumeStep } from "../../domain/rules/onboarding-completion";
import { derivePanFromGstin } from "../../domain/value-objects/gstin";
import { saveOnboardingStep } from "../../data/mutations/save-onboarding-step";
import { completeOnboarding } from "../../data/mutations/complete-onboarding";
import type { OnboardingActionResult, OnboardingViewState } from "../../data/dto/onboarding-dto";
import { onboardingEntranceTransition, onboardingEntranceVariants, onboardingExitTransition, onboardingInstantTransition, onboardingStepTransition, onboardingStepVariants } from "../animation/onboardingMotion";
import { createOnboardingValues, onboardingSteps, type OnboardingErrors } from "../view-models/onboarding-form";
import { validateOnboardingStep } from "../validators/onboarding-validation";
import { OnboardingFields } from "./OnboardingFields";
import { SubscriptionOptions } from "./SubscriptionOptions";

export type OnboardingFormProps = {
  organizationName: string;
  businessEmail: string;
  viewState: OnboardingViewState;
  isVisible: boolean;
  onSetupComplete: () => void;
  onExitComplete: () => void;
};

type Failure = Extract<OnboardingActionResult<unknown>, { ok: false }>;

/**
 * Four-step onboarding wizard. Each completed step is validated and
 * persisted by a server action before advancing (the final step commits
 * completion instead), so a reload resumes at the first incomplete step.
 * Server-side validation failures rehydrate per-field messages; other
 * failures surface once as a form-level error.
 */
export const OnboardingForm = ({
  organizationName,
  businessEmail,
  viewState,
  isVisible,
  onSetupComplete,
  onExitComplete,
}: OnboardingFormProps) => {
  const shouldReduceMotion = useReducedMotionPreference();
  const initialStep = resumeStep(viewState.completed);
  const [activeIndex, setActiveIndex] = useState(initialStep);
  const [completedThrough, setCompletedThrough] = useState(initialStep);
  const [values, setValues] = useState(() => ({
    ...createOnboardingValues(organizationName, businessEmail),
    ...viewState.values,
  }));
  const [errors, setErrors] = useState<OnboardingErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [changingStep, setChangingStep] = useState(false);
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasExitedRef = useRef(false);
  const step = onboardingSteps[activeIndex];
  if (!step) return null;

  const changeStep = (index: number) => {
    if (changingStep || isPending || index === activeIndex || index < 0 || index > completedThrough) return;
    setErrors({});
    setFormError(null);
    setChangingStep(true);
    setActiveIndex(index);
  };

  const changeValue = (name: string, value: string) => {
    const nextValue =
      name === "gstNumber"
        ? value.replace(/\s+/g, "").toUpperCase()
        : value;
    setValues((current) => {
      const merged = { ...current, [name]: nextValue };
      if (name === "gstNumber") {
        merged.panNumber = derivePanFromGstin(nextValue) ?? "";
      }
      return merged;
    });
    setCompletedThrough((current) => Math.min(current, activeIndex));
    setFormError(null);
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      if (name === "gstNumber") delete next.panNumber;
      return next;
    });
  };

  const focusFirstError = (keys: readonly string[]) => {
    const firstError = keys[0];
    if (firstError === undefined) return;
    const control = document.getElementById(`onboarding-${firstError}`);
    control?.focus();
  };

  const applyFailure = (failure: Failure) => {
    const fieldEntries = Object.entries(failure.fieldErrors ?? {});
    if (fieldEntries.length === 0) {
      setErrors({});
      setFormError(failure.message);
      return;
    }
    const nextErrors: OnboardingErrors = {};
    const fieldKeys: string[] = [];
    for (const [name, messages] of fieldEntries) {
      nextErrors[name] = messages[0] ?? failure.message;
      fieldKeys.push(name);
    }
    setErrors(nextErrors);
    setFormError(null);
    focusFirstError(fieldKeys);
  };

  const runStepSave = (stepId: string) => {
    startTransition(async () => {
      const result = await saveOnboardingStep(stepId, values);
      if (!result.ok) {
        applyFailure(result);
        return;
      }
      setErrors({});
      setFormError(null);
      setValues((current) => ({ ...current, ...result.data.values }));
      setCompletedThrough((current) => Math.max(current, activeIndex + 1));
      setChangingStep(true);
      setActiveIndex((current) => current + 1);
    });
  };

  const runCompletion = () => {
    startTransition(async () => {
      const result = await completeOnboarding({
        plan: values.plan,
        billingCycle: values.billingCycle,
        acceptTerms: values.acceptTerms,
      });
      if (!result.ok) {
        applyFailure(result);
        return;
      }
      setErrors({});
      setFormError(null);
      onSetupComplete();
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (changingStep || isPending) return;
    const nextErrors = validateOnboardingStep(step, values);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      focusFirstError(Object.keys(nextErrors));
      return;
    }
    if (activeIndex === onboardingSteps.length - 1) {
      runCompletion();
      return;
    }
    runStepSave(step.id);
  };

  return (
    <motion.section
      aria-label="Onboarding setup"
      variants={onboardingEntranceVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "exit"}
      transition={shouldReduceMotion ? onboardingInstantTransition : isVisible ? onboardingEntranceTransition : onboardingExitTransition}
      onAnimationComplete={(definition) => {
        if (definition === "exit") {
          hasExitedRef.current = true;
          onExitComplete();
        } else if (definition === "visible" && hasExitedRef.current) {
          hasExitedRef.current = false;
          headingRef.current?.focus({ preventScroll: true });
        }
      }}
      inert={!isVisible}
      aria-hidden={!isVisible}
      className="flex w-full min-w-0 flex-col md:h-[min(700px,calc(100dvh-7rem))]"
    >
      <div className="shrink-0 pb-9">
        <p className="mb-4 text-sm text-text-secondary">Step {activeIndex + 1} of {onboardingSteps.length}</p>
        <Stepper steps={onboardingSteps} activeIndex={activeIndex} completedThrough={completedThrough} onStepChange={changeStep} disabled={changingStep || isPending} />
      </div>
      <Form noValidate onSubmit={handleSubmit} aria-labelledby="onboarding-step-heading" className="flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 pb-2 md:overflow-y-auto md:overscroll-contain">
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }}>
            <motion.div
              key={step.id}
              variants={onboardingStepVariants}
              initial="hidden" animate="visible" exit="exit"
              transition={shouldReduceMotion ? onboardingInstantTransition : onboardingStepTransition}
              onAnimationComplete={(definition) => {
                if (definition === "visible" && changingStep) {
                  setChangingStep(false);
                  headingRef.current?.focus({ preventScroll: true });
                }
              }}
            >
              <header className="mb-6">
                <h2 ref={headingRef} id="onboarding-step-heading" tabIndex={-1} className="font-heading text-2xl font-semibold text-text-primary focus:outline-none lg:text-3xl">{step.heading}</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{step.description}</p>
              </header>
              {step.id === "subscription" ? <SubscriptionOptions values={values} errors={errors} onChange={changeValue} /> : null}
              <OnboardingFields groups={step.groups} values={values} errors={errors} onChange={changeValue} />
            </motion.div>
          </AnimatePresence>
        </div>
        {formError !== null ? (
          <div className="shrink-0 pt-4">
            <FormError message={formError} />
          </div>
        ) : null}
        <div className="mt-5 flex shrink-0 items-center justify-between border-t border-border pt-4">
          <Button type="button" variant="secondary" disabled={activeIndex === 0 || changingStep || isPending} onClick={() => changeStep(activeIndex - 1)} className="h-11 px-7 text-sm">Back</Button>
          <Button type="submit" disabled={changingStep || isPending} className="h-11 px-7 text-sm">
            {step.id === "subscription" ? "Complete Setup" : "Continue"}
            {isPending ? (
              <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />
            ) : (
              <ArrowRight size={16} aria-hidden="true" />
            )}
          </Button>
        </div>
      </Form>
    </motion.section>
  );
};
