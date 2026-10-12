import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "../../utils/cn";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  ref?: Ref<HTMLInputElement>;
};

/**
 * Generic accessible checkbox primitive. Wraps the native checkbox so
 * keyboard behavior is preserved; checked color uses the semantic accent.
 * Label association is the consumer's responsibility via htmlFor/id.
 */
export const Checkbox = ({ ref, className, ...props }: CheckboxProps) => (
  <input
    ref={ref}
    type="checkbox"
    {...props}
    className={cn("h-4 w-4 shrink-0 cursor-pointer accent-primary", className)}
  />
);
