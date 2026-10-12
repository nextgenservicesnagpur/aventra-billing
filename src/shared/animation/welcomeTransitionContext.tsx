"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WelcomeTransitionContextValue = {
  isTransitioning: boolean;
  organizationName: string;
  startTransition: (orgName?: string) => void;
  endTransition: () => void;
};

const WelcomeTransitionContext =
  createContext<WelcomeTransitionContextValue | null>(null);

export type WelcomeTransitionProviderProps = {
  children: ReactNode;
};

export const WelcomeTransitionProvider = ({
  children,
}: WelcomeTransitionProviderProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [organizationName, setOrganizationName] = useState("");

  const startTransition = useCallback((orgName?: string) => {
    if (orgName) {
      setOrganizationName(orgName);
    }
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const value = useMemo<WelcomeTransitionContextValue>(
    () => ({
      isTransitioning,
      organizationName,
      startTransition,
      endTransition,
    }),
    [isTransitioning, organizationName, startTransition, endTransition],
  );

  return (
    <WelcomeTransitionContext.Provider value={value}>
      {children}
    </WelcomeTransitionContext.Provider>
  );
};

export const useWelcomeTransition = (): WelcomeTransitionContextValue => {
  const context = useContext(WelcomeTransitionContext);
  if (!context) {
    return {
      isTransitioning: false,
      organizationName: "",
      startTransition: () => {},
      endTransition: () => {},
    };
  }
  return context;
};
