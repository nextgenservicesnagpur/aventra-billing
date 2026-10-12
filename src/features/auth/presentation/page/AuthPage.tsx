"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useWelcomeTransition } from "@/shared/animation/welcomeTransitionContext";
import {
  brandEntranceTransition,
  brandEntranceVariants,
  brandRelocateTransition,
  loginFormTransition,
  loginFormVariants,
  noMotionTransition,
} from "../animation/authIntro";
import {
  brandingExitTransition,
  welcomeTranslateTransition,
} from "../animation/welcomeTransition";
import { AuthBranding } from "../components/AuthBranding";
import { useAuthIntroPhase } from "../hooks/useAuthIntroPhase";
import { AuthFormSwitch, type AuthFormMode } from "./AuthFormSwitch";

export type AuthPageProps = {
  initialMode?: AuthFormMode;
  initialEmail?: string;
  initialOrganizationName?: string;
};

/**
 * Auth page composition.
 *
 * Intro: branding centered. After a pause it relocates (same element via
 * layout animation) to the left / top while the login form enters from
 * the right. Reduced motion settles immediately.
 *
 * On Welcome → Onboarding transition, coordinates the exit:
 * - Aventra branding on the left fades out gracefully.
 * - The Welcome section moves from the right column to the left column,
 *   settling in the former branding position as onboarding enters.
 */
export const AuthPage = ({
  initialMode = "login",
  initialEmail = "",
  initialOrganizationName = "",
}: AuthPageProps) => {
  const phase = useAuthIntroPhase();
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const {
    endTransition,
    isTransitioning,
    organizationName: transitionOrganizationName,
    startTransition,
  } = useWelcomeTransition();
  const [isDesktop, setIsDesktop] = useState(true);
  const [isOnboardingRequested, setIsOnboardingRequested] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      endTransition();
    };
  }, [endTransition]);

  const handleCompleteOnboarding = (organizationName: string) => {
    if (isTransitioning || isOnboardingRequested) {
      return;
    }

    startTransition(organizationName);
    setIsOnboardingRequested(true);
  };

  const handleWelcomeTransitionComplete = () => {
    if (!isOnboardingRequested) {
      return;
    }

    setIsOnboardingRequested(false);
    router.push("/onboarding");
  };

  const settled = phase === "split" || isTransitioning;
  const brandTransition = shouldReduceMotion
    ? noMotionTransition
    : settled
      ? brandRelocateTransition
      : brandEntranceTransition;

  return (
    <main
      className={cn(
        "flex min-h-dvh w-full flex-col overflow-x-clip bg-background text-foreground",
        settled
          ? "items-center justify-start md:flex-row"
          : "items-center justify-center",
      )}
    >
      <motion.div
        layout
        variants={brandEntranceVariants}
        initial={
          isTransitioning
            ? { opacity: 1 }
            : shouldReduceMotion
              ? false
              : "hidden"
        }
        animate={isTransitioning ? { opacity: 0 } : "visible"}
        transition={
          isTransitioning
            ? shouldReduceMotion
              ? noMotionTransition
              : brandingExitTransition
            : brandTransition
        }
        className="flex w-full flex-col items-center justify-center px-6 py-14 text-center md:w-1/2 md:py-10"
      >
        <AuthBranding />
      </motion.div>
      {settled ? (
        <motion.div
          variants={loginFormVariants}
          initial={
            isTransitioning
              ? { x: 0, y: 0, opacity: 1 }
              : shouldReduceMotion
                ? false
                : "hidden"
          }
          animate={
            isTransitioning
              ? shouldReduceMotion
                ? { opacity: 0 }
                : isDesktop
                  ? { x: "-100%", opacity: 1 }
                  : { y: "-80%", opacity: 1 }
              : "visible"
          }
          transition={
            isTransitioning
              ? shouldReduceMotion
                ? noMotionTransition
                : welcomeTranslateTransition
              : shouldReduceMotion
                ? noMotionTransition
                : loginFormTransition
          }
          onAnimationComplete={handleWelcomeTransitionComplete}
          className="flex w-full items-center justify-center px-6 pt-2 pb-16 md:w-1/2 md:p-10"
        >
          <div className="w-full max-w-sm">
            <AuthFormSwitch
              initialMode={isTransitioning ? "welcome" : initialMode}
              initialEmail={initialEmail}
              initialOrganizationName={
                isTransitioning
                  ? transitionOrganizationName || initialOrganizationName
                  : initialOrganizationName
              }
              onCompleteOnboarding={handleCompleteOnboarding}
            />
          </div>
        </motion.div>
      ) : null}
    </main>
  );
};
