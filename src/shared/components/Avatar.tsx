import { cn } from "../utils/cn";

export type AvatarProps = {
  label: string;
  className?: string;
};

/**
 * Initials avatar primitive. Decorative by design: the accessible name
 * always comes from adjacent text (or the control that wraps it), never
 * from the initials alone. Fixed dimensions keep surrounding layouts
 * stable across data changes.
 */
export const Avatar = ({ label, className }: AvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-surface-alt text-xs font-semibold text-text-secondary",
      className,
    )}
  >
    {label}
  </span>
);
