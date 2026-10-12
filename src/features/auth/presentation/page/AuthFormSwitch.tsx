"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  authFormToggleInstantTransition,
  authFormToggleTransition,
  forgotFormToggleVariants,
  loginFormToggleVariants,
} from "../animation/authFormTransition";
import {
  authStepInstantTransition,
  authStepVariants,
  authStepTransition,
} from "../animation/authStepTransition";
import { WelcomeScreen } from "../components/WelcomeScreen";
import {
  CreateOrganizationForm,
  type OrganizationDetails,
} from "../forms/CreateOrganizationForm";
import { ForgotPasswordForm } from "../forms/ForgotPasswordForm";
import { LoginForm } from "../forms/LoginForm";
import { OtpVerificationForm } from "../forms/OtpVerificationForm";
import { ResetPasswordForm } from "../forms/ResetPasswordForm";
import { resendEmailOtp } from "../../data/mutations/verify-otp";

export type AuthFormMode =
  | "login"
  | "forgot-password"
  | "reset-password"
  | "create-organization"
  | "verify-otp"
  | "welcome";

export type AuthFormSwitchProps = {
  initialMode?: AuthFormMode;
  initialEmail?: string;
  initialOrganizationName?: string;
  onCompleteOnboarding: (organizationName: string) => void;
};

/**
 * Orchestrates the auth panel content: login, forgot/reset password, and
 * the create-organization → verify-otp → welcome registration sequence.
 * Local presentation state only; the intro sequence is owned by AuthPage
 * and unaffected. Only non-sensitive context plus one transient password
 * (for the post-verification sign-in, cleared on completion or exit)
 * are retained between steps; nothing persists beyond the page flow.
 *
 * The animated wrappers are plain layout containers: they are intentionally
 * not focusable, so focus (and the global focus outline) always lands on
 * real interactive controls and never on the panel itself.
 */
export const AuthFormSwitch = ({
  initialMode = "login",
  initialEmail = "",
  initialOrganizationName = "",
  onCompleteOnboarding,
}: AuthFormSwitchProps) => {
  const [mode, setMode] = useState<AuthFormMode>(initialMode);
  const [organizationEmail, setOrganizationEmail] = useState(initialEmail);
  const [organizationName, setOrganizationName] = useState(
    initialOrganizationName,
  );
  const [resetEmail, setResetEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const toggleTransition = shouldReduceMotion
    ? authFormToggleInstantTransition
    : authFormToggleTransition;
  const stepTransition = shouldReduceMotion
    ? authStepInstantTransition
    : authStepTransition;

  const showLogin = () => {
    setPendingPassword(null);
    setMode("login");
  };

  const showForgotPassword = () => {
    setMode("forgot-password");
  };

  const showCreateOrganization = () => {
    setMode("create-organization");
  };

  const handleLoginSuccess = (name: string | null, status: string | null) => {
    setOrganizationName(name ?? "Your organization");
    if (status === "COMPLETED") {
      router.push("/dashboard");
    } else {
      setMode("welcome");
    }
  };

  const handleEmailNotVerified = (email: string, password: string) => {
    setOrganizationEmail(email);
    setPendingPassword(password);
    setMode("verify-otp");
    void resendEmailOtp({ email });
  };

  const handleOrganizationCreated = (details: OrganizationDetails) => {
    setOrganizationName(details.organizationName);
    setOrganizationEmail(details.organizationEmail);
    setPendingPassword(details.password);
    setMode("verify-otp");
  };

  const handleOtpVerified = (name: string | null) => {
    if (name !== null) {
      setOrganizationName(name);
    }
    setPendingPassword(null);
    setMode("welcome");
  };

  const handleResetRequested = (email: string) => {
    setResetEmail(email);
    setMode("reset-password");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const handleCompleteOnboarding = () => {
    onCompleteOnboarding(organizationName);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {mode === "login" ? (
        <motion.div
          key="login"
          variants={loginFormToggleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={toggleTransition}
        >
          <LoginForm
            onForgotPassword={showForgotPassword}
            onCreateOrganization={showCreateOrganization}
            onLoginSuccess={handleLoginSuccess}
            onEmailNotVerified={handleEmailNotVerified}
          />
        </motion.div>
      ) : mode === "forgot-password" ? (
        <motion.div
          key="forgot-password"
          variants={forgotFormToggleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={toggleTransition}
        >
          <ForgotPasswordForm
            onBackToLogin={showLogin}
            onResetRequested={handleResetRequested}
          />
        </motion.div>
      ) : mode === "reset-password" ? (
        <motion.div
          key="reset-password"
          variants={forgotFormToggleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={toggleTransition}
        >
          <ResetPasswordForm
            email={resetEmail}
            onResetComplete={showLogin}
            onBackToLogin={showLogin}
          />
        </motion.div>
      ) : mode === "create-organization" ? (
        <motion.div
          key="create-organization"
          variants={authStepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={stepTransition}
        >
          <CreateOrganizationForm
            onOrganizationCreated={handleOrganizationCreated}
            onBackToLogin={showLogin}
          />
        </motion.div>
      ) : mode === "verify-otp" ? (
        <motion.div
          key="verify-otp"
          variants={authStepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={stepTransition}
        >
          <OtpVerificationForm
            organizationEmail={organizationEmail}
            signInPassword={pendingPassword}
            onVerified={handleOtpVerified}
            onBackToOrganization={showCreateOrganization}
          />
        </motion.div>
      ) : (
        <motion.div
          key="welcome"
          variants={authStepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={stepTransition}
        >
          <WelcomeScreen
            organizationName={organizationName}
            onCompleteOnboarding={handleCompleteOnboarding}
            onExploreDashboard={goToDashboard}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
