"use client";

import { useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  const preference = window.matchMedia(reducedMotionQuery);
  preference.addEventListener("change", onChange);
  return () => {
    preference.removeEventListener("change", onChange);
  };
};

const getSnapshot = () => window.matchMedia(reducedMotionQuery).matches;
const getServerSnapshot = () => false;

/** Match server markup during hydration, then follow the browser preference. */
export const useReducedMotionPreference = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
