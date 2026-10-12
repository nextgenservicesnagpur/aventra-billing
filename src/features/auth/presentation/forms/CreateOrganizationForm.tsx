"use client";

import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/shared/components/form/Button";
import { Form } from "@/shared/components/form/Form";
import { Input } from "@/shared/components/form/Input";
import { Label } from "@/shared/components/form/Label";
import { registerOrganization } from "../../data/mutations/register-organization";
import { FormError } from "@/shared/components/form/FormError";

export type OrganizationDetails = {
  organizationName: string;
  organizationEmail: string;
  password: string;
};

export type CreateOrganizationFormProps = {
  onOrganizationCreated: (details: OrganizationDetails) => void;
  onBackToLogin: () => void;
};

/**
 * Organization setup form backed by the real registration operation.
 * Shows loading and safe error states and clears the password after
 * failed attempts. The password is lifted to the parent only for the
 * transient post-verification sign-in and is cleared once the flow
 * completes or the user navigates away.
 */
export const CreateOrganizationForm = ({
  onOrganizationCreated,
  onBackToLogin,
}: CreateOrganizationFormProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const togglePasswordVisibility = () => {
    setPasswordVisible((current) => !current);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const adminName = data.get("adminName");
    const organizationName = data.get("organizationName");
    const organizationEmail = data.get("organizationEmail");
    const password = data.get("password");

    startTransition(async () => {
      setFormError(null);
      setFieldErrors({});
      const result = await registerOrganization({
        adminName: typeof adminName === "string" ? adminName : "",
        organizationName:
          typeof organizationName === "string" ? organizationName : "",
        organizationEmail:
          typeof organizationEmail === "string" ? organizationEmail : "",
        password: typeof password === "string" ? password : "",
      });
      if (result.ok) {
        onOrganizationCreated({
          organizationName: result.data.organizationName,
          organizationEmail: result.data.organizationEmail,
          password: typeof password === "string" ? password : "",
        });
        return;
      }
      if (passwordRef.current !== null) {
        passwordRef.current.value = "";
      }
      setFieldErrors(result.fieldErrors ?? {});
      setFormError(result.message);
    });
  };

  const VisibilityIcon = passwordVisible ? EyeOff : Eye;

  const fieldErrorId = (field: string): string | undefined =>
    fieldErrors[field] !== undefined ? `org-${field}-error` : undefined;

  return (
    <div className="w-full">
      <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
        Create your organization
      </h1>
      <p className="mt-3 text-text-secondary">
        Set up your organization to get started with Aventra.
      </p>
      <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {formError !== null ? <FormError message={formError} /> : null}
        <div>
          <Label htmlFor="org-admin-name" className="mb-2 block">
            Admin name
          </Label>
          <Input
            id="org-admin-name"
            name="adminName"
            type="text"
            autoComplete="name"
            required
            placeholder="John Doe"
            aria-invalid={fieldErrorId("adminName") !== undefined}
            aria-describedby={fieldErrorId("adminName")}
          />
          {fieldErrorId("adminName") !== undefined ? (
            <p
              id={fieldErrorId("adminName")}
              role="alert"
              className="mt-2 text-sm text-danger"
            >
              {fieldErrors.adminName?.join(" ")}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="org-name" className="mb-2 block">
            Organization name
          </Label>
          <Input
            id="org-name"
            name="organizationName"
            type="text"
            autoComplete="organization"
            required
            placeholder="Acme Corporation"
            aria-invalid={fieldErrorId("organizationName") !== undefined}
            aria-describedby={fieldErrorId("organizationName")}
          />
          {fieldErrorId("organizationName") !== undefined ? (
            <p
              id={fieldErrorId("organizationName")}
              role="alert"
              className="mt-2 text-sm text-danger"
            >
              {fieldErrors.organizationName?.join(" ")}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="org-email" className="mb-2 block">
            Organization email
          </Label>
          <Input
            id="org-email"
            name="organizationEmail"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            aria-invalid={fieldErrorId("organizationEmail") !== undefined}
            aria-describedby={fieldErrorId("organizationEmail")}
          />
          {fieldErrorId("organizationEmail") !== undefined ? (
            <p
              id={fieldErrorId("organizationEmail")}
              role="alert"
              className="mt-2 text-sm text-danger"
            >
              {fieldErrors.organizationEmail?.join(" ")}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="org-password" className="mb-2 block">
            Password
          </Label>
          <div className="relative">
            <Input
              ref={passwordRef}
              id="org-password"
              name="password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Create a secure password"
              aria-invalid={fieldErrorId("password") !== undefined}
              aria-describedby={fieldErrorId("password")}
              className="pr-12"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-text-muted transition-colors hover:text-text-secondary"
            >
              <VisibilityIcon size={18} aria-hidden="true" />
            </button>
          </div>
          {fieldErrorId("password") !== undefined ? (
            <p
              id={fieldErrorId("password")}
              role="alert"
              className="mt-2 text-sm text-danger"
            >
              {fieldErrors.password?.join(" ")}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          variant="primary"
          className="h-12 w-full"
          disabled={isPending}
        >
          {isPending ? (
            <LoaderCircle
              size={18}
              aria-hidden="true"
              className="animate-spin"
            />
          ) : null}
          Create organization
        </Button>
        <div className="flex justify-center">
          <Button type="button" variant="link" onClick={onBackToLogin}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to login
          </Button>
        </div>
      </Form>
    </div>
  );
};
