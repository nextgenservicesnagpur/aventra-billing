"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useWelcomeTransition } from "@/shared/animation/welcomeTransitionContext";
import { useReducedMotionPreference } from "@/shared/animation/useReducedMotionPreference";
import { WelcomeScreen } from "@/shared/components/WelcomeScreen";
import { cn } from "@/shared/utils/cn";
import { onboardingInstantTransition, welcomeCompletionTransition } from "../animation/onboardingMotion";
import { OnboardingForm } from "../forms/OnboardingForm";
import type { OnboardingViewState } from "../../data/dto/onboarding-dto";

export type OnboardingPageProps = {
  initialOrganizationName: string;
  initialBusinessEmail: string;
  viewState: OnboardingViewState;
};

/**
 * Onboarding route destination view.
 *
 * Renders the Welcome section positioned on the left (the exact visual
 * region formerly occupied by the Aventra branding), serving as the
 * destination of the seamless spatial transition from /auth.
 *
 * Auth only navigates here after its approved spatial motion finishes. The
 * form entrance can start on mount without a timer or a parallel auth animation.
 * Direct navigation renders the same final two-region composition. The route
 * gates the session; this view only composes the authorized state it is given.
 */
export const OnboardingPage = ({
  initialOrganizationName,
  initialBusinessEmail,
  viewState,
}: OnboardingPageProps) => {
  const router = useRouter();
  const { organizationName: contextOrgName } = useWelcomeTransition();
  const organizationName = contextOrgName || initialOrganizationName;
  const shouldReduceMotion = useReducedMotionPreference();
  const [completionPhase, setCompletionPhase] = useState<"editing" | "exiting-form" | "complete">("editing");
  const dashboardButtonRef = useRef<HTMLButtonElement>(null);
  const complete = completionPhase === "complete";

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <main className={cn("relative flex min-h-dvh w-full flex-col items-center justify-start overflow-x-clip bg-background text-foreground md:flex-row", complete && "justify-center")}>
      <motion.div
        layout="position"
        layoutDependency={complete}
        initial={false}
        transition={shouldReduceMotion ? onboardingInstantTransition : welcomeCompletionTransition}
        onLayoutAnimationComplete={() => { if (complete) dashboardButtonRef.current?.focus({ preventScroll: true }); }}
        className={cn("flex w-full items-center justify-center px-6 pt-2 pb-16 md:w-1/2 md:p-10", complete && "py-10")}
      >
        <div className="w-full max-w-sm">
          <WelcomeScreen
            organizationName={organizationName}
            onCompleteOnboarding={handleContinue}
            onExploreDashboard={handleContinue}
            collapsePrimaryActions
            completed={complete}
            exploreButtonRef={dashboardButtonRef}
            onReviewSetup={() => setCompletionPhase("editing")}
          />
        </div>
      </motion.div>
      <div className={cn("flex w-full min-w-0 items-center justify-center px-6 pb-10 md:w-1/2 md:p-8 lg:-translate-x-16", complete && "hidden")}>
        <div className="w-full max-w-3xl">
          <OnboardingForm
            organizationName={organizationName}
            businessEmail={initialBusinessEmail}
            viewState={viewState}
            isVisible={completionPhase === "editing"}
            onSetupComplete={() => setCompletionPhase("exiting-form")}
            onExitComplete={() => setCompletionPhase((phase) => phase === "exiting-form" ? "complete" : phase)}
          />
        </div>
      </div>
    </main>
  );
};
