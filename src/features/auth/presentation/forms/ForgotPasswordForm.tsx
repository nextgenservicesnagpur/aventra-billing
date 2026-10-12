"use client";

import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/shared/components/form/Button";
import { Form } from "@/shared/components/form/Form";
import { Input } from "@/shared/components/form/Input";
import { Label } from "@/shared/components/form/Label";
import { requestPasswordReset } from "../../data/mutations/password-reset";
import { FormError } from "@/shared/components/form/FormError";

export type ForgotPasswordFormProps = {
  onBackToLogin: () => void;
  onResetRequested: (email: string) => void;
};

/**
 * Forgot password form backed by the real OTP password-reset request.
 * Advances to the reset step on success; the endpoint responds the same
 * way for unknown addresses so the UI never becomes an oracle.
 */
export const ForgotPasswordForm = ({
  onBackToLogin,
  onResetRequested,
}: ForgotPasswordFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");

    startTransition(async () => {
      setFormError(null);
      setFieldErrors({});
      const result = await requestPasswordReset({
        email: typeof email === "string" ? email : "",
      });
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setFormError(result.message);
        return;
      }
      onResetRequested(result.data.email);
    });
  };

  const emailErrorId =
    fieldErrors.email !== undefined ? "forgot-email-error" : undefined;

  return (
    <div className="w-full">
      <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
        Forgot password?
      </h1>
      <p className="mt-3 text-text-secondary">
        Enter your email address and we&rsquo;ll send you a link to reset your
        password.
      </p>
      <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {formError !== null ? <FormError message={formError} /> : null}
        <div>
          <Label htmlFor="forgot-email" className="mb-2 block">
            Email
          </Label>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            aria-invalid={emailErrorId !== undefined}
            aria-describedby={emailErrorId}
          />
          {emailErrorId !== undefined ? (
            <p id={emailErrorId} role="alert" className="mt-2 text-sm text-danger">
              {fieldErrors.email?.join(" ")}
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
          Send reset link
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
