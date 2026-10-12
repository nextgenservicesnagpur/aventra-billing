import { cn } from "@/shared/utils/cn";

export type FieldErrorProps = {
  id: string;
  message?: string;
};

/** Reserved field feedback space prevents validation from shifting the grid. */
export const FieldError = ({ id, message }: FieldErrorProps) => (
  <p id={id} aria-live="polite" className={cn("min-h-4 text-xs leading-4 text-text-secondary", message && "border-l-2 border-danger pl-2")}>
    {message}
  </p>
);
