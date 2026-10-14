"use client";

import {
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export type TabItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
};

export type TabsProps = {
  tabs: readonly TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  ariaLabel?: string;
};

export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  className,
  ariaLabel = "Tabs",
}: TabsProps) => {
  const tabListRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (nextTab) {
        onChange(nextTab.id);
        const nextButton = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex];
        nextButton?.focus();
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      const prevTab = tabs[prevIndex];
      if (prevTab) {
        onChange(prevTab.id);
        const prevButton = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[prevIndex];
        prevButton?.focus();
      }
    } else if (event.key === "Home") {
      event.preventDefault();
      const firstTab = tabs[0];
      if (firstTab) {
        onChange(firstTab.id);
        const firstButton = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[0];
        firstButton?.focus();
      }
    } else if (event.key === "End") {
      event.preventDefault();
      const lastIndex = tabs.length - 1;
      const lastTab = tabs[lastIndex];
      if (lastTab) {
        onChange(lastTab.id);
        const lastButton = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[lastIndex];
        lastButton?.focus();
      }
    }
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex w-full overflow-x-auto border-b border-border scrollbar-none",
        className,
      )}
    >
      <div className="flex gap-1 min-w-max">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "group relative inline-flex items-center gap-2.5 px-4 py-3 text-xs sm:text-sm font-medium transition-all outline-none",
                "focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded-t-lg",
                isActive
                  ? "text-primary-light font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-alt/40",
              )}
            >
              {tab.icon && (
                <span
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-primary-light" : "text-text-muted group-hover:text-text-secondary",
                  )}
                  aria-hidden="true"
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono font-normal",
                    isActive
                      ? "bg-primary/15 text-primary-light"
                      : "bg-surface-alt text-text-muted",
                  )}
                >
                  {tab.badge}
                </span>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary shadow-xs"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
