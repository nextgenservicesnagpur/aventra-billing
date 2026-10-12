"use client";

import type { ReactNode } from "react";

export type RouteTransitionBoundaryProps = {
  children: ReactNode;
};

/**
 * Stable route frame for coordinated page transitions. The source page owns
 * its transition state and clears it during unmount, so a pending destination
 * navigation cannot make the source animation reverse before it leaves.
 *
 * Fully feature-agnostic: operates purely on React nodes, keeping Clean
 * Architecture layer boundaries intact without importing feature internals.
 */
export const RouteTransitionBoundary = ({
  children,
}: RouteTransitionBoundaryProps) => {
  return (
    <div className="min-h-dvh w-full overflow-x-clip bg-background">
      {children}
    </div>
  );
};
