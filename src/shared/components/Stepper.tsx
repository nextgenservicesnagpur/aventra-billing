import { Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type StepperStep = { id: string; label: string };
export type StepperProps = {
  steps: readonly StepperStep[];
  activeIndex: number;
  completedThrough: number;
  onStepChange: (index: number) => void;
  disabled?: boolean;
};

export const Stepper = ({ steps, activeIndex, completedThrough, onStepChange, disabled = false }: StepperProps) => (
  <nav aria-label="Setup progress" className="@container">
    <ol className="flex w-full @min-[420px]:pb-7">
      {steps.map((step, index) => {
        const active = index === activeIndex;
        const completed = index < completedThrough && !active;
        const content = (
          <>
            <span className="flex w-full items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm",
                  active ? "border-primary bg-primary text-primary-foreground" : completed ? "border-primary/60 text-primary-light" : "border-border text-text-secondary",
                )}
              >
                {completed ? <Check size={12} /> : index + 1}
              </span>
              {index < steps.length - 1 ? <span aria-hidden="true" className={cn("mx-2 h-px flex-1", completed ? "bg-primary/40" : "bg-border")} /> : null}
            </span>
             <span className={cn("sr-only @min-[420px]:not-sr-only @min-[420px]:absolute @min-[420px]:top-10 @min-[420px]:block @min-[420px]:whitespace-nowrap @min-[420px]:text-xs @min-[420px]:leading-5", index === steps.length - 1 ? "@min-[420px]:right-0 @min-[420px]:text-right" : "@min-[420px]:left-0", active ? "font-medium text-text-primary" : "text-text-secondary")}>{step.label}</span>
            <span className="sr-only">{active ? ", current step" : completed ? ", completed" : ", upcoming"}</span>
          </>
        );
        return (
          <li key={step.id} aria-current={active ? "step" : undefined} className={cn("relative min-w-0", index === steps.length - 1 ? "w-8 shrink-0" : "flex-1")}>
            {index <= completedThrough ? (
              <button type="button" disabled={disabled} onClick={() => onStepChange(index)} className="block w-full rounded-sm text-left disabled:cursor-wait">{content}</button>
            ) : <span className="block">{content}</span>}
          </li>
        );
      })}
    </ol>
    <p aria-hidden="true" className="mt-2 text-xs font-semibold text-text-primary @min-[420px]:hidden">{steps[activeIndex]?.label}</p>
  </nav>
);
