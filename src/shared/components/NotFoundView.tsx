"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/shared/components/form/Button";
import { useReducedMotionPreference } from "@/shared/animation/useReducedMotionPreference";
import {
  notFoundContainerVariants,
  notFoundEntranceTransition,
  notFoundInstantTransition,
} from "@/shared/animation/notFoundMotion";
import { NotFoundGraphic } from "./NotFoundGraphic";

/**
 * Reusable, feature-agnostic 404 Not Found presentation view.
 *
 * Implements Aventra's minimalist bronze-themed error composition:
 * - Centered 404 metallic sculpture with hollow middle zero
 * - High-contrast "Page not found" heading (white + bronze)
 * - Muted supporting explanation
 * - Primary "Go to dashboard →" action utilizing the shared Button primitive
 * - Fully accessible semantic structure and motion preference support
 */
export const NotFoundView = () => {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotionPreference();

  // Prefetch the dashboard destination for instant navigation
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-x-clip bg-background px-4 py-12 text-foreground">
      <motion.div
        variants={notFoundContainerVariants}
        initial="hidden"
        animate="visible"
        transition={shouldReduceMotion ? notFoundInstantTransition : notFoundEntranceTransition}
        className="flex w-full max-w-2xl flex-col items-center text-center"
      >
        {/* 404 bronze metallic graphic */}
        <NotFoundGraphic className="w-full max-w-lg sm:max-w-xl md:max-w-2xl" />

        {/* Heading: "Page" (crisp white) + "not found" (warm bronze) */}
        <h1 className="mt-8 font-heading text-3xl font-medium tracking-tight sm:mt-10 sm:text-4xl md:text-5xl">
          <span className="font-semibold text-foreground">Page</span>{" "}
          <span className="font-normal text-primary-light">not found</span>
        </h1>

        {/* Supporting description */}
        <p className="mt-3 max-w-md font-sans text-sm text-text-secondary sm:mt-3.5 sm:text-base">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Action: navigate to dashboard */}
        <div className="mt-8 sm:mt-9">
          <Button
            type="button"
            variant="primary"
            onClick={handleGoToDashboard}
            className="group h-11 px-6 text-sm font-medium tracking-wide shadow-lg transition-all duration-200"
          >
            <span>Go to dashboard</span>
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="shrink-0 transition-transform duration-200 motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
            />
          </Button>
        </div>
      </motion.div>
    </main>
  );
};
