"use client";

import { Building2, CircleUserRound, Mail, Phone, BriefcaseBusiness, Users, Link, type LucideIcon } from "lucide-react";
import { Checkbox } from "@/shared/components/form/Checkbox";
import { FieldError } from "@/shared/components/form/FieldError";
import { Input } from "@/shared/components/form/Input";
import { Label } from "@/shared/components/form/Label";
import { Select } from "@/shared/components/form/Select";
import { Textarea } from "@/shared/components/form/Textarea";
import { cn } from "@/shared/utils/cn";
import type { OnboardingField as FieldDefinition } from "../view-models/onboarding-form";

export type OnboardingFieldProps = {
  field: FieldDefinition;
  value: string;
  error?: string;
  onChange: (name: string, value: string) => void;
};

const fieldIcons: Record<NonNullable<FieldDefinition["icon"]>, LucideIcon> = {
  business: Building2, name: CircleUserRound, email: Mail, phone: Phone,
  industry: BriefcaseBusiness, team: Users, website: Link,
};

export const OnboardingField = ({ field, value, error, onChange }: OnboardingFieldProps) => {
  const id = `onboarding-${field.id}`;
  const errorId = `${id}-error`;
  const common = { id, name: field.id, required: field.required, "aria-invalid": Boolean(error), "aria-describedby": errorId };
  const Icon = field.icon ? fieldIcons[field.icon] : undefined;
  const startIcon = Icon ? <Icon size={18} /> : undefined;

  return (
    <div className={cn("min-w-0 space-y-1.5", field.fullWidth && "sm:col-span-2")}>
      {field.kind === "checkbox" ? (
        <Label htmlFor={id} className="flex cursor-pointer items-start gap-3 py-1 text-text-secondary">
          <Checkbox {...common} className="mt-0.5" checked={value === "true"} onChange={(event) => onChange(field.id, String(event.target.checked))} />
          <span>{field.label}</span>
        </Label>
      ) : (
        <>
          <Label htmlFor={id} className="block text-sm font-normal">
            {field.label}{field.required ? <span aria-hidden="true" className="ml-1 text-primary-light">*</span> : <> <span className="text-text-secondary">(optional)</span></>}
          </Label>
          {field.kind === "select" ? (
            <Select {...common} startIcon={startIcon} placeholder="Select an option" options={field.options} value={value} onChange={(next) => onChange(field.id, next)} />
          ) : field.kind === "textarea" ? (
            <Textarea {...common} className="min-h-20 text-sm" rows={2} autoComplete={field.autoComplete} value={value} onChange={(event) => onChange(field.id, event.target.value)} />
          ) : (
            <Input {...common} className="text-sm" startIcon={startIcon} type={field.inputType ?? "text"} autoComplete={field.autoComplete} placeholder={field.placeholder} readOnly={field.readOnly} value={value} onChange={(event) => onChange(field.id, event.target.value)} />
          )}
        </>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
};
