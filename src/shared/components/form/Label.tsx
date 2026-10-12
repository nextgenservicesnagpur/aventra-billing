import type { LabelHTMLAttributes, Ref } from "react";
import { cn } from "../../utils/cn";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  ref?: Ref<HTMLLabelElement>;
};

/**
 * Generic label primitive. Owns the shared label text appearance
 * (semantic tokens only); placement and association come from the
 * consumer via className and htmlFor.
 */
export const Label = ({ ref, className, children, ...props }: LabelProps) => (
  <label
    ref={ref}
    {...props}
    className={cn("text-sm font-medium text-text-secondary", className)}
  >
    {children}
  </label>
);
