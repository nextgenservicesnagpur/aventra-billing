import { FieldError } from "@/shared/components/form/FieldError";
import { cn } from "@/shared/utils/cn";
import { subscriptionPlanOptions } from "../view-models/subscription-options";
import type { OnboardingErrors, OnboardingValues } from "../view-models/onboarding-form";

export type SubscriptionOptionsProps = {
  values: OnboardingValues;
  errors: OnboardingErrors;
  onChange: (name: string, value: string) => void;
};

export const SubscriptionOptions = ({ values, errors, onChange }: SubscriptionOptionsProps) => {
  const selectedPlan = subscriptionPlanOptions.find((plan) => plan.id === values.plan);
  return (
    <div className="mb-5 space-y-4">
      <fieldset>
        <legend className="mb-2 text-xs font-semibold tracking-wide text-text-secondary">Billing cycle</legend>
        <div className="inline-flex rounded-lg border border-border p-1">
          {["Monthly", "Yearly"].map((cycle) => (
            <label key={cycle} className="relative cursor-pointer">
              <input type="radio" name="billingCycle" value={cycle} checked={values.billingCycle === cycle} onChange={() => onChange("billingCycle", cycle)} className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0" aria-describedby="billing-cycle-error" />
              <span className={cn("block rounded-md px-5 py-1.5 text-xs transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus", values.billingCycle === cycle ? "bg-surface-alt font-semibold text-text-primary" : "text-text-secondary")}>{cycle}</span>
            </label>
          ))}
        </div>
        <FieldError id="billing-cycle-error" message={errors.billingCycle} />
      </fieldset>
      <fieldset id="onboarding-plan" tabIndex={-1} aria-describedby="plan-error" className="min-w-0 rounded-sm focus:outline-none">
        <legend className="mb-2 text-xs font-semibold tracking-wide text-text-secondary">Plan comparison</legend>
        <p className="mb-3 text-xs text-text-secondary">Plan availability, pricing and limits are confirmed at activation.</p>
        <div className="space-y-2">
          {subscriptionPlanOptions.map((plan) => (
            <label key={plan.id} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors", values.plan === plan.id ? "border-primary/70 bg-primary/5" : "border-border hover:border-text-muted")}>
              <input type="radio" name="plan" value={plan.id} checked={values.plan === plan.id} onChange={() => onChange("plan", plan.id)} aria-describedby="plan-error" className="mt-1 size-3.5 shrink-0 accent-primary" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3"><span className="text-sm font-semibold text-text-primary">{plan.name}</span><span className="text-xs text-text-secondary">{plan.description}</span></span>
                <span className="mt-1 block text-xs text-text-secondary">{plan.included}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError id="plan-error" message={errors.plan} />
      </fieldset>
      <section aria-labelledby="order-summary-heading" className="border-y border-border py-4">
        <h3 id="order-summary-heading" className="mb-3 text-sm font-semibold text-text-primary">Order summary</h3>
        <dl className="space-y-2 text-xs">
          {[
            ["Plan", selectedPlan?.name ?? "Select a plan"],
            ["Billing cycle", values.billingCycle ?? "Monthly"],
            ["User / Seat limit", "Confirmed with your plan"],
            ["Invoice / Usage limit", "Confirmed with your plan"],
            ["Subtotal", "Confirmed at checkout"],
            ["Tax", "Calculated at checkout"],
          ].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-text-secondary">{label}</dt><dd className="text-right text-text-secondary">{value}</dd></div>)}
          <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold text-text-primary"><dt>Final price</dt><dd>Confirmed at checkout</dd></div>
        </dl>
      </section>
    </div>
  );
};
