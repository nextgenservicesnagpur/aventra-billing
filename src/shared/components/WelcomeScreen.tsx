"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, type Ref } from "react";
import {
  collapseContentInstantTransition,
  collapseContentTransition,
  collapseContentVariants,
} from "@/shared/animation/collapseContent";
import { useReducedMotionPreference } from "@/shared/animation/useReducedMotionPreference";
import { Button } from "@/shared/components/form/Button";
import { cn } from "@/shared/utils/cn";

export type WelcomeScreenProps = {
  organizationName: string;
  onCompleteOnboarding?: () => void;
  onExploreDashboard?: () => void;
  className?: string;
  completed?: boolean;
  onReviewSetup?: () => void;
  exploreButtonRef?: Ref<HTMLButtonElement>;
  /**
   * Post-transition mode for the /onboarding destination route. After a
   * short settle delay the primary action and divider fade and collapse
   * away, letting the Explore action rise into the freed space. Defaults
   * to false so the /auth welcome state renders the full static layout.
   */
  collapsePrimaryActions?: boolean;
};

/**
 * Delay after mount before the primary actions collapse. The /onboarding
 * route is only pushed once the route transition completes, so this
 * settles the arrived view briefly before Phase 2 begins.
 */
const POST_TRANSITION_SETTLE_MS = 500;

/**
 * Shared Welcome presentation component.
 *
 * Used both on the post-verification /auth screen and on the /onboarding
 * destination route. Maintains identical typography, spacing, actions,
 * and layout proportions across both contexts.
 */
export const WelcomeScreen = ({
  organizationName,
  onCompleteOnboarding,
  onExploreDashboard,
  className,
  collapsePrimaryActions = false,
  completed = false,
  onReviewSetup,
  exploreButtonRef,
}: WelcomeScreenProps) => {
  const shouldReduceMotion = useReducedMotionPreference();
  const [settleElapsed, setSettleElapsed] = useState(false);
  const actionsCollapsed =
    collapsePrimaryActions && (shouldReduceMotion || settleElapsed);

  useEffect(() => {
    if (!collapsePrimaryActions || shouldReduceMotion) {
      return;
    }
    const timer = window.setTimeout(() => {
      setSettleElapsed(true);
    }, POST_TRANSITION_SETTLE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [collapsePrimaryActions, shouldReduceMotion]);

  return (
    <div className={cn("w-full text-center", className)}>
      <h1 className="mt-6 font-heading text-3xl font-bold text-text-primary md:text-4xl">
        <span className="block">Welcome to</span>
        <span className="block text-primary-light">Aventra</span>
      </h1>
      <p className="mx-auto mt-3 max-w-xs text-text-secondary">
        {organizationName} is ready to go.
      </p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-text-muted">
        Choose how you&rsquo;d like to continue.
      </p>
      <div className="mt-10 flex flex-col">
        {/* Keep the zero-height wrapper mounted and collapse its spacing too,
            so removing content cannot cause a final margin-collapse jump. */}
        <motion.div
          initial={false}
          animate={actionsCollapsed ? "collapsed" : "expanded"}
          variants={collapseContentVariants}
          transition={
            shouldReduceMotion
              ? collapseContentInstantTransition
              : collapseContentTransition
          }
          inert={actionsCollapsed}
          aria-hidden={actionsCollapsed}
          className="overflow-hidden"
        >
          <div className="pb-5">
            <Button
              type="button"
              variant="primary"
              className="group h-12 w-full"
              onClick={onCompleteOnboarding}
            >
              Complete onboarding
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform duration-200 motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
              />
            </Button>
            <div className="mt-6 flex items-center gap-4" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-sm text-text-muted">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>
          </div>
        </motion.div>
        <div className={cn("flex justify-center", completed && "flex-col items-stretch")}>
          <Button
            ref={exploreButtonRef}
            type="button"
            variant={completed ? "primary" : "link"}
            className={cn("group", completed && "h-12 w-full")}
            onClick={onExploreDashboard}
          >
            Explore your dashboard
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
            />
          </Button>
          {completed && onReviewSetup ? (
            <Button type="button" variant="link" className="mt-4 self-center" onClick={onReviewSetup}>
              Review setup
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
