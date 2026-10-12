"use client";

import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/shared/components/form/Button";
import { Form } from "@/shared/components/form/Form";
import { Input } from "@/shared/components/form/Input";
import { Label } from "@/shared/components/form/Label";
import { resetPasswordWithOtp } from "../../data/mutations/password-reset";
import { FormError } from "@/shared/components/form/FormError";
import { EMPTY_OTP_CODE, OTP_CODE_LENGTH, OtpInput, type OtpCode } from "./OtpInput";

export type ResetPasswordFormProps = {
  email: string;
  onResetComplete: () => void;
  onBackToLogin: () => void;
};

/**
 * New-password step of the OTP password reset. UI only around the real
 * reset endpoint: collects the code plus the replacement password and
 * reports safe errors. No tokens are stored or logged.
 */
export const ResetPasswordForm = ({
  email,
  onResetComplete,
  onBackToLogin,
}: ResetPasswordFormProps) => {
  const [code, setCode] = useState<OtpCode>(["", "", "", "", "", ""]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const codeComplete =
    code.filter((digit) => digit !== "").length === OTP_CODE_LENGTH;

  const togglePasswordVisibility = () => {
    setPasswordVisible((current) => !current);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = form.get("newPassword");

    startTransition(async () => {
      setFormError(null);
      setFieldErrors({});
      const result = await resetPasswordWithOtp({
        email,
        code: code.join(""),
        newPassword: typeof newPassword === "string" ? newPassword : "",
      });
      if (result.ok) {
        onResetComplete();
        return;
      }
      if (passwordRef.current !== null) {
        passwordRef.current.value = "";
      }
      setCode(EMPTY_OTP_CODE);
      setFieldErrors(result.fieldErrors ?? {});
      setFormError(result.message);
    });
  };

  const VisibilityIcon = passwordVisible ? EyeOff : Eye;
  const codeErrorId =
    fieldErrors.code !== undefined ? "reset-code-error" : undefined;
  const passwordErrorId =
    fieldErrors.newPassword !== undefined ? "reset-password-error" : undefined;

  return (
    <div className="w-full">
      <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
        Set a new password
      </h1>
      <p className="mt-3 text-text-secondary">
        Enter the verification code and choose a new password for {email}.
      </p>
      <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {formError !== null ? <FormError message={formError} /> : null}
        <OtpInput value={code} onChange={setCode} />
        {codeErrorId !== undefined ? (
          <p id={codeErrorId} role="alert" className="text-sm text-danger">
            {fieldErrors.code?.join(" ")}
          </p>
        ) : null}
        <div>
          <Label htmlFor="reset-password" className="mb-2 block">
            New password
          </Label>
          <div className="relative">
            <Input
              ref={passwordRef}
              id="reset-password"
              name="newPassword"
              type={passwordVisible ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Create a secure password"
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
            <p id={passwordErrorId} role="alert" className="mt-2 text-sm text-danger">
              {fieldErrors.newPassword?.join(" ")}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          variant="primary"
          className="h-12 w-full"
          disabled={!codeComplete || isPending}
        >
          Reset password
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
