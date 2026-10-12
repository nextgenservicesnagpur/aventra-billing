"use client";

import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/shared/components/form/Button";
import { Checkbox } from "@/shared/components/form/Checkbox";
import { Form } from "@/shared/components/form/Form";
import { Input } from "@/shared/components/form/Input";
import { Label } from "@/shared/components/form/Label";
import { signInWithPassword } from "../../data/mutations/session";
import { FormError } from "@/shared/components/form/FormError";

export type LoginFormProps = {
  onForgotPassword: () => void;
  onCreateOrganization: () => void;
  onLoginSuccess: (organizationName: string | null, onboardingStatus: string | null) => void;
  onEmailNotVerified: (email: string, password: string) => void;
};

/**
 * Login form backed by the real email/password session. Shows loading and
 * safe error states, clears the password after failed attempts, and hands
 * verified sessions (or unverified credentials for the OTP path) to the
 * parent orchestrator.
 */
export const LoginForm = ({
  onForgotPassword,
  onCreateOrganization,
  onLoginSuccess,
  onEmailNotVerified,
}: LoginFormProps) => {
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
    const email = data.get("email");
    const password = data.get("password");
    const rememberMe = data.get("remember") === "on";

    startTransition(async () => {
      setFormError(null);
      setFieldErrors({});
      const result = await signInWithPassword({
        email: typeof email === "string" ? email : "",
        password: typeof password === "string" ? password : "",
        rememberMe,
      });
      if (result.ok) {
        onLoginSuccess(result.data.organizationName, result.data.onboardingStatus);
        return;
      }
      if (
        result.code === "EMAIL_NOT_VERIFIED" &&
        typeof email === "string" &&
        typeof password === "string"
      ) {
        onEmailNotVerified(email, password);
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
  const emailErrorId =
    fieldErrors.email !== undefined ? "login-email-error" : undefined;
  const passwordErrorId =
    fieldErrors.password !== undefined ? "login-password-error" : undefined;

  return (
    <div className="w-full">
      <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
        Welcome back
      </h1>
      <p className="mt-3 text-text-secondary">
        Sign in to continue to Aventra-ERP.
      </p>
      <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {formError !== null ? <FormError message={formError} /> : null}
        <div>
          <Label htmlFor="email" className="mb-2 block">
            Email
          </Label>
          <Input
            id="email"
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
        <div>
          <Label htmlFor="password" className="mb-2 block">
            Password
          </Label>
          <div className="relative">
            <Input
              ref={passwordRef}
              id="password"
              name="password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              aria-invalid={passwordErrorId !== undefined}
              aria-describedby={passwordErrorId}
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
          {passwordErrorId !== undefined ? (
            <p
              id={passwordErrorId}
              role="alert"
              className="mt-2 text-sm text-danger"
            >
              {fieldErrors.password?.join(" ")}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label
            htmlFor="remember-me"
            className="flex cursor-pointer items-center gap-2"
          >
            <Checkbox id="remember-me" name="remember" />
            Remember me
          </Label>
          <Button
            type="button"
            variant="link"
            className="shrink-0"
            onClick={onForgotPassword}
          >
            Forgot password?
          </Button>
        </div>
        <Button
          type="submit"
          variant="primary"
          className="group h-12 w-full"
          disabled={isPending}
        >
          Sign in
          {isPending ? (
            <LoaderCircle size={18} aria-hidden="true" className="animate-spin" />
          ) : (
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition-transform duration-200 motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
            />
          )}
        </Button>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-text-muted">New to Aventra?</span>
          <Button type="button" variant="link" onClick={onCreateOrganization}>
            Create organization
          </Button>
        </div>
      </Form>
    </div>
  );
};
