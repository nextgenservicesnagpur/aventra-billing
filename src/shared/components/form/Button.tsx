import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "../../utils/cn";

export type ButtonVariant = "primary" | "secondary" | "link";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
};

const buttonVariantClassName: Record<ButtonVariant, string> = {
  primary:
    "rounded-lg bg-primary font-semibold text-primary-foreground hover:bg-primary-light active:bg-primary-dark",
  secondary:
    "rounded-lg border border-border bg-transparent font-medium text-text-secondary hover:border-text-muted hover:text-text-primary active:bg-surface-alt",
  link: "text-sm font-medium text-primary-light hover:text-primary-foreground",
};

/**
 * Generic button primitive. Intentionally small: layout sizing comes from
 * the consumer via className; color/shape come from semantic tokens.
 * The link variant is a visual treatment only and keeps native button
 * semantics (it must not submit a form unless type="submit" is set).
 */
export const Button = ({
  ref,
  variant = "primary",
  className,
  ...props
}: ButtonProps) => (
  <button
    ref={ref}
    {...props}
    className={cn(
      "inline-flex cursor-pointer items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60",
      buttonVariantClassName[variant],
      className,
    )}
  />
);
