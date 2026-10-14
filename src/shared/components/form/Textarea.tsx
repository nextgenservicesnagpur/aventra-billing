import type { ReactNode, Ref, TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: Ref<HTMLTextAreaElement>;
  startIcon?: ReactNode;
};

/**
 * Generic textarea primitive. Same token treatment as Input with a
 * multi-line box; character counting and layout belong to the consumer.
 * Focus is signaled by the border token, matching Input. Supports an
 * optional leading icon slot.
 */
export const Textarea = ({
  ref,
  startIcon,
  className,
  ...props
}: TextareaProps) => {
  if (startIcon) {
    return (
      <div className="relative w-full">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-3.5 left-3.5 text-text-muted"
        >
          {startIcon}
        </span>
        <textarea
          ref={ref}
          {...props}
          className={cn(
            "min-h-24 w-full resize-none rounded-lg border border-border bg-input pr-4 pl-10 pt-3 text-text-primary placeholder:text-text-muted transition-colors hover:border-text-muted focus:border-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
        />
      </div>
    );
  }

  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        "min-h-24 w-full resize-none rounded-lg border border-border bg-input px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors hover:border-text-muted focus:border-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
};
