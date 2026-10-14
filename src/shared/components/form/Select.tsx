"use client";

import { Check, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { findNextEnabledOption, findOptionByPrefix } from "./selectNavigation";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options?: readonly (string | SelectOption)[];
  startIcon?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  children?: ReactNode;
};

const normalizeOption = (option: string | SelectOption): SelectOption =>
  typeof option === "string" ? { value: option, label: option } : option;

/**
 * Generic Aventra custom select primitive. Replaces native browser option
 * menus with a keyboard-accessible, semantic-token-styled popover.
 * Synchronizes with an underlying hidden input so native FormData and form
 * submissions capture the selected value without framework coupling.
 */
export const Select = ({
  id,
  name,
  value,
  defaultValue = "",
  placeholder,
  options: explicitOptions,
  startIcon,
  disabled = false,
  required = false,
  className,
  onChange,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
  children,
}: SelectProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;

  // Parse options and placeholder from explicit options or option children
  let derivedPlaceholder = placeholder;
  const parsedOptions: SelectOption[] = [];

  if (explicitOptions !== undefined) {
    for (const opt of explicitOptions) {
      const normalized = normalizeOption(opt);
      if (normalized.value === "") {
        if (!derivedPlaceholder) {
          derivedPlaceholder = normalized.label;
        }
      } else {
        parsedOptions.push(normalized);
      }
    }
  } else if (children !== undefined) {
    Children.forEach(children, (child) => {
      if (isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(child)) {
        const optionValue = child.props.value !== undefined ? String(child.props.value) : "";
        const labelText =
          typeof child.props.children === "string"
            ? child.props.children
            : String(child.props.children ?? "");

        if (optionValue === "") {
          if (!derivedPlaceholder) {
            derivedPlaceholder = labelText;
          }
        } else {
          parsedOptions.push({
            value: optionValue,
            label: labelText,
            disabled: child.props.disabled,
          });
        }
      }
    });
  }

  const [internalValue, setInternalValue] = useState<string>(
    value ?? defaultValue,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0, width: 0, maxHeight: 224 });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef({ text: "", time: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLUListElement | null>(null);

  const currentValue = value !== undefined ? value : internalValue;
  const selectedOption = parsedOptions.find((opt) => opt.value === currentValue);
  const displayLabel = selectedOption?.label ?? derivedPlaceholder ?? "Select option";
  const isPlaceholderShown = !selectedOption && Boolean(derivedPlaceholder);

  // Intelligent positioning above or below trigger based on viewport clearance
  const updatePlacement = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 230; // maximum expected dropdown height
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const above = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    setPlacement(above ? "top" : "bottom");
    setDropdownPosition({ left: rect.left, top: above ? rect.top - 6 : rect.bottom + 6, width: rect.width, maxHeight: Math.max(44, Math.min(224, (above ? spaceAbove : spaceBelow) - 12)) });
  }, []);

  const openDropdown = () => {
    if (disabled) return;
    updatePlacement();
    setIsOpen(true);
    const currentIndex = parsedOptions.findIndex(
      (opt) => opt.value === currentValue,
    );
    setHighlightedIndex(currentIndex >= 0 ? currentIndex : findNextEnabledOption(parsedOptions, -1, 1));
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    setInternalValue(option.value);
    onChange?.(option.value);
    closeDropdown();
    triggerRef.current?.focus();
  };

  // Close on outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target) &&
        !listboxRef.current?.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [isOpen, updatePlacement]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listboxRef.current) return;
    const items = listboxRef.current.querySelectorAll<HTMLLIElement>('[role="option"]');
    const target = items[highlightedIndex];
    if (target) {
      target.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, highlightedIndex]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openDropdown();
      } else {
        const delta = event.key === "ArrowDown" ? 1 : -1;
        setHighlightedIndex((prev) => findNextEnabledOption(parsedOptions, prev, delta));
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen && highlightedIndex >= 0 && parsedOptions[highlightedIndex]) {
        handleSelect(parsedOptions[highlightedIndex]);
      } else {
        openDropdown();
      }
    } else if (event.key === "Escape") {
      if (isOpen) {
        event.preventDefault();
        closeDropdown();
      }
    } else if (event.key === "Tab") {
      if (isOpen) {
        closeDropdown();
      }
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!isOpen) openDropdown();
      setHighlightedIndex(findNextEnabledOption(parsedOptions, event.key === "Home" ? -1 : 0, event.key === "Home" ? 1 : -1));
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = performance.now();
      const text = now - searchRef.current.time < 700 ? searchRef.current.text + event.key : event.key;
      searchRef.current = { text, time: now };
      const prefix = [...text].every((character) => character === text[0]) ? text[0] ?? text : text;
      if (!isOpen) openDropdown();
      const match = findOptionByPrefix(parsedOptions, prefix, highlightedIndex);
      if (match >= 0) setHighlightedIndex(match);
    }
  };

  const isInvalid = ariaInvalid === true || ariaInvalid === "true";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Underlying select preserves form submission, FormData, and SSR option markup */}
      <select
        name={name}
        value={currentValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
          onChange?.(e.target.value);
        }}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only pointer-events-none absolute h-0 w-0 opacity-0"
        disabled={disabled}
      >
        {derivedPlaceholder ? (
          <option value="">{derivedPlaceholder}</option>
        ) : null}
        {parsedOptions.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {startIcon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-text-muted"
        >
          {startIcon}
        </span>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        id={selectId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-required={required}
        aria-activedescendant={isOpen && highlightedIndex >= 0 ? `${listboxId}-${highlightedIndex}` : undefined}
        aria-invalid={isInvalid}
        aria-describedby={ariaDescribedby}
        disabled={disabled}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "h-11 w-full rounded-lg border bg-input pr-10 text-left text-sm transition-colors",
          "hover:border-text-muted",
          "focus:outline-none focus-visible:outline-none",
          isInvalid
            ? "border-danger focus:border-danger focus-visible:border-danger"
            : isOpen
              ? "border-focus"
              : "border-border focus:border-focus focus-visible:border-focus",
          disabled && "cursor-not-allowed opacity-60",
          startIcon ? "pl-10" : "pl-4",
          isPlaceholderShown ? "text-text-secondary" : "text-text-primary",
          className,
        )}
      >
        <span className="block truncate">{displayLabel}</span>
      </button>

      <ChevronDown
        size={18}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-muted transition-transform duration-200",
          isOpen && "rotate-180 text-primary-light",
        )}
      />

      {isOpen ? createPortal(
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={selectId}
          style={{ ...dropdownPosition, transform: placement === "top" ? "translateY(-100%)" : undefined }}
          className={cn(
            "fixed z-50 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-xl outline-none",
          )}
        >
          {parsedOptions.map((option, index) => {
            const isSelected = option.value === currentValue;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-sm transition-colors",
                  option.disabled && "cursor-not-allowed opacity-50",
                  isSelected
                    ? "bg-primary/10 font-medium text-primary-light"
                    : isHighlighted
                      ? "bg-surface-alt text-text-primary"
                      : "text-text-secondary hover:bg-surface-alt hover:text-text-primary",
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? (
                  <Check
                    size={14}
                    aria-hidden="true"
                    className="shrink-0 text-primary-light"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>, document.body,
      ) : null}
    </div>
  );
};
