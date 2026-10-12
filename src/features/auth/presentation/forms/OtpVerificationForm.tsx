"use client";

import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/shared/components/form/Button";
import { Form } from "@/shared/components/form/Form";
import {
  resendEmailOtp,
  verifyEmailOtp,
} from "../../data/mutations/verify-otp";
import { signInWithPassword } from "../../data/mutations/session";
import { FormError } from "@/shared/components/form/FormError";
import { EMPTY_OTP_CODE, OtpInput, type OtpCode } from "./OtpInput";

export type OtpVerificationFormProps = {
  organizationEmail: string;
  /**
   * Registration or login password held transiently by the parent for the
   * post-verification sign-in. Null when a session already exists (for
   * example after a page reload), in which case verification alone
   * completes the step.
   */
  signInPassword: string | null;
  onVerified: (organizationName: string | null) => void;
  onBackToOrganization: () => void;
};

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Email verification UI backed by the real Better Auth OTP flow. Verifies
 * the code server-side and, when the registration password is available,
 * establishes the session immediately so the flow can continue to Welcome.
 * No backend state is faked; the resend cooldown is presentation state
 * only while attempt limits stay server-side.
 */
export const OtpVerificationForm = ({
  organizationEmail,
  signInPassword,
  onVerified,
  onBackToOrganization,
}: OtpVerificationFormProps) => {
  const [code, setCode] = useState<OtpCode>(EMPTY_OTP_CODE);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const coolingDown = cooldownRemaining > 0;
  const codeComplete = code.every((digit) => digit !== "");

  useEffect(() => {
    if (!coolingDown) {
      return;
    }
    const timer = window.setInterval(() => {
      setCooldownRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [coolingDown]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      setFormError(null);
      const verified = await verifyEmailOtp({
        email: organizationEmail,
        code: code.join(""),
      });
      if (!verified.ok) {
        setCode(EMPTY_OTP_CODE);
        setFormError(verified.message);
        return;
      }
      if (signInPassword === null) {
        onVerified(null);
        return;
      }
      const signedIn = await signInWithPassword({
        email: organizationEmail,
        password: signInPassword,
        rememberMe: true,
      });
      if (!signedIn.ok) {
        setCode(EMPTY_OTP_CODE);
        setFormError(signedIn.message);
        return;
      }
      onVerified(signedIn.data.organizationName);
    });
  };

  const handleResend = () => {
    if (coolingDown) {
      return;
    }
    startResendTransition(async () => {
      const result = await resendEmailOtp({ email: organizationEmail });
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      setCooldownRemaining(RESEND_COOLDOWN_SECONDS);
    });
  };

  return (
    <div className="w-full">
      <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
        Verify your email
      </h1>
      <p className="mt-3 text-text-secondary">
        Enter the verification code sent to your organization email.
      </p>
      <p className="mt-2 text-sm text-text-muted">
        Verification code for {organizationEmail}
      </p>
      <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {formError !== null ? <FormError message={formError} /> : null}
        <OtpInput value={code} onChange={setCode} />
        <Button
          type="submit"
          variant="primary"
          className="h-12 w-full"
          disabled={!codeComplete || isPending}
        >
          {isPending ? (
            <LoaderCircle
              size={18}
              aria-hidden="true"
              className="animate-spin"
            />
          ) : null}
          Verify email
        </Button>
        <div className="flex flex-col items-center gap-2">
          <Button
            type="button"
            variant="link"
            onClick={handleResend}
            disabled={coolingDown || isResending}
          >
            {coolingDown
              ? `Resend code in ${cooldownRemaining}s`
              : "Resend code"}
          </Button>
          <Button type="button" variant="link" onClick={onBackToOrganization}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to organization details
          </Button>
        </div>
      </Form>
    </div>
  );
};
