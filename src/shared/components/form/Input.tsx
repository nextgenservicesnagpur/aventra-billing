import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "../../utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: Ref<HTMLInputElement>;
  startIcon?: ReactNode;
};

/**
 * Generic text-like input primitive. Owns the shared input appearance
 * (semantic tokens only); feature code supplies behavior and layout.
 * Supports an optional leading icon slot.
 *
 * Focus is signaled by the border token. The keyboard-focus outline is
 * suppressed here because the global halo is scoped away from text-entry
 * inputs (see globals.css); buttons, links, and checkboxes keep it.
 */
export const Input = ({
  ref,
  startIcon,
  className,
  ...props
}: InputProps) => {
  if (startIcon) {
    return (
      <div className="relative w-full">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted"
        >
          {startIcon}
        </span>
        <input
          ref={ref}
          {...props}
          className={cn(
            "h-11 w-full rounded-lg border border-border bg-input pr-4 pl-10 text-text-primary placeholder:text-text-muted transition-colors hover:border-text-muted focus:border-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
        />
      </div>
    );
  }

  return (
    <input
      ref={ref}
      {...props}
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-input px-4 text-text-primary placeholder:text-text-muted transition-colors hover:border-text-muted focus:border-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
};
