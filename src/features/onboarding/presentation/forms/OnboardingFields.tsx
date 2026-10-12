import type { OnboardingErrors, OnboardingGroup, OnboardingValues } from "../view-models/onboarding-form";
import { OnboardingField } from "./OnboardingField";

export type OnboardingFieldsProps = {
  groups: readonly OnboardingGroup[];
  values: OnboardingValues;
  errors: OnboardingErrors;
  onChange: (name: string, value: string) => void;
};

export const OnboardingFields = ({ groups, values, errors, onChange }: OnboardingFieldsProps) => (
  <div className="space-y-5">
    {groups.map((group, index) => {
      const fields = <div className="grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">{group.fields.map((field) => <OnboardingField key={field.id} field={field} value={values[field.id] ?? ""} error={errors[field.id]} onChange={onChange} />)}</div>;
      return (
        <fieldset key={group.title || index} className="min-w-0">
          {group.title ? <legend className="mb-3 text-xs font-semibold tracking-wide text-text-secondary">{group.title}</legend> : null}
          {fields}
        </fieldset>
      );
    })}
  </div>
);
