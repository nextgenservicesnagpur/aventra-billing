"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotionPreference } from "@/shared/animation/useReducedMotionPreference";
import { cn } from "@/shared/utils/cn";
import {
  createMegaMenuCloseTimeline,
  createMegaMenuTimeline,
} from "../animation/megaMenu";
import { dashboardNavigationSections } from "./dashboardNavigation";

export const MegaMenu = () => {
  const reducedMotion = useReducedMotionPreference();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const triggerId = useId();
  const menuId = useId();

  const closeMenu = () => setIsOpen(false);
  const openMenu = () => {
    setIsRendered(true);
    setIsOpen(true);
  };

  useLayoutEffect(() => {
    if (!isRendered || !wrapperRef.current) return;

    timelineRef.current?.kill();
    const panel = wrapperRef.current.querySelector<HTMLElement>("[data-mega-panel]");
    if (!panel) return;

    const sections = Array.from(
      wrapperRef.current.querySelectorAll<HTMLElement>("[data-mega-section]"),
    );
    const items = Array.from(
      wrapperRef.current.querySelectorAll<HTMLElement>("[data-mega-item]"),
    );

    if (isOpen) {
      timelineRef.current = createMegaMenuTimeline(
        { items, panel, sections },
        reducedMotion,
      );
    } else {
      panel.setAttribute("aria-hidden", "true");
      panel.setAttribute("inert", "");
      timelineRef.current = createMegaMenuCloseTimeline(
        { items, panel, sections },
        reducedMotion,
        () => setIsRendered(false),
      );
    }

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, [isOpen, isRendered, reducedMotion]);

  useEffect(() => {
    if (!isOpen) return;
    wrapperRef.current
      ?.querySelector<HTMLAnchorElement>('a[data-mega-item][data-available="true"]')
      ?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);


  return (
    <div
      ref={wrapperRef}
      className="static"
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          closeMenu();
          triggerRef.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (
          isOpen &&
          event.relatedTarget instanceof Node &&
          !wrapperRef.current?.contains(event.relatedTarget)
        ) {
          closeMenu();
        }
      }}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-controls={isRendered ? menuId : undefined}
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu();
          }
        }}
        className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
      >
        {isOpen ? <X aria-hidden="true" className="h-4 w-4" /> : <Menu aria-hidden="true" className="h-4 w-4" />}
        <span className="hidden sm:inline">Menu</span>
      </button>

      {isRendered && (
        <nav
          id={menuId}
          data-mega-panel
          aria-hidden={!isOpen}
          aria-label="Dashboard navigation"
          aria-labelledby={triggerId}
          className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-y border-border bg-surface-elevated shadow-lg"
        >
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 md:gap-5 md:px-6 lg:grid-cols-3 xl:grid-cols-4">
            {dashboardNavigationSections.map((section) => (
              <section key={section.label} data-mega-section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                  {section.label}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const content = (
                      <>
                        <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-text-primary">{item.title}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-text-secondary">
                            {item.description}
                          </span>
                        </span>
                      </>
                    );

                    if (item.availability === "available") {
                      const isCurrent =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          data-mega-item
                          data-available="true"
                          aria-current={pathname === item.href ? "page" : isCurrent ? "true" : undefined}
                          tabIndex={isOpen ? 0 : -1}
                          onClick={closeMenu}
                          className={cn(
                            "flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-surface focus-visible:bg-surface",
                            isCurrent && "bg-surface",
                            !isOpen && "pointer-events-none",
                          )}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        data-mega-item
                        aria-disabled="true"
                        data-available="false"
                        className="flex cursor-not-allowed items-start gap-3 rounded-lg p-3 opacity-65"
                      >
                        {content}
                        <span className="ml-auto shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                          Planned
                          <span className="sr-only"> and unavailable</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};
