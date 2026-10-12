"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, LoaderCircle, LogOut } from "lucide-react";
import type { AuthActionResult } from "@/features/auth";
import { Avatar } from "@/shared/components/Avatar";
import { useReducedMotionPreference } from "@/shared/animation/useReducedMotionPreference";
import { cn } from "@/shared/utils/cn";
import {
  userMenuReducedTransition,
  userMenuTransition,
  userMenuVariants,
} from "../animation/headerMenu";
import type { DashboardHeaderAccountModel } from "../view-models/dashboardHeader";

export type UserMenuProps = {
  account: DashboardHeaderAccountModel;
  onSignOut: () => Promise<AuthActionResult<null>>;
};

const toContextLine = (
  account: DashboardHeaderAccountModel,
): string | null => {
  const parts = [account.roleLabel, account.organizationName].filter(
    (part): part is string => part !== null,
  );
  return parts.length > 0 ? parts.join(" · ") : null;
};

/**
 * Authenticated account menu. The trigger shows avatar initials and the
 * display name; the panel presents the resolved account (name, email,
 * role · organization) and the single real action — sign out through the
 * auth feature's server action. Menu semantics, Escape/outside dismissal,
 * focus management, and reduced motion are handled here; no client-side
 * authorization claims are made from the displayed role.
 */
export const UserMenu = ({ account, onSignOut }: UserMenuProps) => {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotionPreference();
  const [isOpen, setIsOpen] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerId = useId();
  const menuId = useId();
  const contextLine = toContextLine(account);

  const closeMenu = () => {
    setIsOpen(false);
    setSignOutError(null);
  };

  const openMenu = () => {
    setSignOutError(null);
    setIsOpen(true);
  };

  const handleSignOut = () => {
    setSignOutError(null);
    startTransition(async () => {
      const result = await onSignOut();
      if (!result.ok) {
        setSignOutError(result.message);
        return;
      }
      router.replace("/auth");
    });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const firstItem = wrapperRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"]',
    );
    firstItem?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (wrapperRef.current?.contains(target) ?? false) {
        return;
      }
      closeMenu();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          closeMenu();
          triggerRef.current?.focus();
        }
      }}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (
          nextTarget instanceof Node &&
          !(wrapperRef.current?.contains(nextTarget) ?? false)
        ) {
          closeMenu();
        }
      }}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu();
          }
        }}
        className="flex h-9 items-center gap-2 rounded-md px-1.5 transition-colors hover:bg-surface-alt"
      >
        <Avatar label={account.initials} />
        <span className="hidden min-w-0 text-left lg:block">
          <span className="block max-w-32 truncate text-sm font-medium leading-tight text-text-primary xl:max-w-44">
            {account.displayName}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-text-muted transition-transform duration-150",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            variants={userMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={
              shouldReduceMotion ? userMenuReducedTransition : userMenuTransition
            }
            className="absolute right-0 top-full z-50 mt-1.5 w-60 origin-top rounded-lg border border-border bg-surface-elevated p-1.5"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-text-primary">
                {account.displayName}
              </p>
              <p className="mt-0.5 truncate text-xs text-text-secondary">
                {account.email}
              </p>
              {contextLine !== null && (
                <p className="mt-1 truncate text-xs text-text-muted">
                  {contextLine}
                </p>
              )}
            </div>
            <div className="border-t border-border pt-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                disabled={isPending}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                )}
                {isPending ? "Signing out…" : "Sign out"}
              </button>
            </div>
            {signOutError !== null && (
              <p role="alert" className="px-3 pt-2 pb-1 text-xs text-danger">
                {signOutError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
