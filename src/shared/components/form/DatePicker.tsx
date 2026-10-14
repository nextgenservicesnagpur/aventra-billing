"use client";

import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export type DatePickerProps = {
  id?: string;
  name?: string;
  value?: string; // Format: YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  minDate?: string; // Format: YYYY-MM-DD
  maxDate?: string; // Format: YYYY-MM-DD
  className?: string;
  startIcon?: ReactNode;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const formatDisplayDate = (val?: string) => {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length !== 3) return val;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(Date.UTC(year, month, day));
  if (Number.isNaN(date.getTime())) return val;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const DatePicker = ({
  id,
  name,
  value = "",
  onChange,
  placeholder = "Select date...",
  disabled = false,
  required = false,
  error,
  minDate,
  maxDate,
  className,
  startIcon,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0, width: 260 });
  const [focusedDay, setFocusedDay] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse initial view month & year from value or current date
  const parseDate = (val: string) => {
    if (!val) return new Date();
    const [y, m, d] = val.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  };

  const [navYear, setNavYear] = useState<number | null>(null);
  const [navMonth, setNavMonth] = useState<number | null>(null);

  const initialDate = parseDate(value);
  const fallbackDate = Number.isNaN(initialDate.getTime()) ? new Date() : initialDate;

  const viewYear = navYear ?? fallbackDate.getFullYear();
  const viewMonth = navMonth ?? fallbackDate.getMonth();

  const updatePlacement = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight = 310;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const above = spaceBelow < popoverHeight && spaceAbove > spaceBelow;
    setPlacement(above ? "top" : "bottom");
    setDropdownPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 276)),
      top: above ? rect.top - 6 : rect.bottom + 6,
      width: Math.max(260, rect.width),
    });
  }, []);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [isOpen, updatePlacement]);

  const openCalendar = () => {
    if (disabled) return;
    const d = parseDate(value);
    if (!Number.isNaN(d.getTime())) {
      setNavYear(d.getFullYear());
      setNavMonth(d.getMonth());
      setFocusedDay(d.getDate());
    } else {
      setNavYear(new Date().getFullYear());
      setNavMonth(new Date().getMonth());
      setFocusedDay(new Date().getDate());
    }
    updatePlacement();
    setIsOpen(true);
  };

  const closeCalendar = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setNavMonth(11);
      setNavYear(viewYear - 1);
    } else {
      setNavMonth(viewMonth - 1);
      setNavYear(viewYear);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setNavMonth(0);
      setNavYear(viewYear + 1);
    } else {
      setNavMonth(viewMonth + 1);
      setNavYear(viewYear);
    }
  };

  // Days in month calculation (handles leap years accurately)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Disabled check against minDate and maxDate
  const isDateDisabled = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${mm}-${dd}`;

    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const handleSelectDay = (day: number) => {
    if (isDateDisabled(day)) return;
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const formatted = `${viewYear}-${mm}-${dd}`;
    onChange?.(formatted);
    closeCalendar();
  };

  const handleSelectToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const formatted = `${yyyy}-${mm}-${dd}`;

    if (minDate && formatted < minDate) return;
    if (maxDate && formatted > maxDate) return;

    setNavYear(yyyy);
    setNavMonth(today.getMonth());
    setFocusedDay(today.getDate());
    onChange?.(formatted);
    closeCalendar();
  };

  // Keyboard navigation within the days grid
  const handleDaysKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setFocusedDay((prev) => Math.max(1, prev - 1));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setFocusedDay((prev) => Math.min(daysInMonth, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedDay((prev) => Math.max(1, prev - 7));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedDay((prev) => Math.min(daysInMonth, prev + 7));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectDay(focusedDay);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      handlePrevMonth();
    } else if (e.key === "PageDown") {
      e.preventDefault();
      handleNextMonth();
    }
  };

  // Highlight check
  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return y === viewYear && m === viewMonth + 1 && d === day;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input to maintain native form/testing compatibility */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={value}
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      />

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={id ? `${id}-trigger` : undefined}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={placeholder}
        disabled={disabled}
        onClick={() => (isOpen ? closeCalendar() : openCalendar())}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-input px-3 text-left text-sm text-text-primary transition-colors hover:border-text-muted focus:border-focus focus-visible:outline-none flex items-center justify-between cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
          Boolean(error || ariaInvalid === true || ariaInvalid === "true") && "border-danger focus:border-danger",
          className,
        )}
      >
        <span className="flex items-center gap-2.5 truncate">
          <span className="text-text-muted shrink-0" aria-hidden="true">
            {startIcon || <CalendarIcon size={15} />}
          </span>
          <span className={cn("truncate", !value && "text-text-muted")}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-text-muted shrink-0 ml-1.5 transition-transform duration-200",
            isOpen && "rotate-180 text-primary-light",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Calendar Popover */}
      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-modal="true"
              aria-label="Choose Date"
              style={{
                position: "fixed",
                left: dropdownPosition.left,
                top: dropdownPosition.top,
                width: dropdownPosition.width,
                transform: placement === "top" ? "translateY(-100%)" : undefined,
              }}
              className="z-50 rounded-xl border border-border bg-surface p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100 outline-none"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/60">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-semibold text-text-primary tracking-tight">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Days of week header */}
              <div
                className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-text-muted uppercase mb-1.5"
                aria-hidden="true"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <span key={d} className="py-0.5">
                    {d}
                  </span>
                ))}
              </div>

              {/* Days grid */}
              <div
                role="grid"
                aria-label="Calendar days"
                tabIndex={0}
                onKeyDown={handleDaysKeyDown}
                className="grid grid-cols-7 gap-1 text-center text-xs outline-none focus:ring-1 focus:ring-focus rounded-md"
              >
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <span key={`empty-${idx}`} className="h-7 w-7" aria-hidden="true" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const active = isSelected(day);
                  const currentDay = isToday(day);
                  const dayDisabled = isDateDisabled(day);
                  const hasFocus = focusedDay === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      role="gridcell"
                      aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`}
                      aria-selected={active}
                      aria-disabled={dayDisabled}
                      disabled={dayDisabled}
                      onClick={() => handleSelectDay(day)}
                      onMouseEnter={() => setFocusedDay(day)}
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer",
                        dayDisabled && "cursor-not-allowed opacity-35 hover:bg-transparent",
                        active && !dayDisabled
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : !dayDisabled && "text-text-primary hover:bg-surface-alt",
                        currentDay && !active && !dayDisabled && "border border-primary-light text-primary-light",
                        hasFocus && !active && !dayDisabled && "bg-surface-alt/70",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Quick Action Footer */}
              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectToday}
                  className="text-primary-light hover:underline font-medium cursor-pointer"
                >
                  Today
                </button>
                {value ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange?.("");
                      closeCalendar();
                    }}
                    className="text-text-muted hover:text-danger transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
