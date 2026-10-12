import { TriangleAlert } from "lucide-react";

export type FormErrorProps = {
  message: string;
};

/**
 * Subtle form-level error display. Announced to assistive technology via
 * role="alert" on mount. Severity is carried by text content plus a
 * restrained danger treatment — never color alone, never a giant alert.
 */
export const FormError = ({ message }: FormErrorProps) => (
  <div
    role="alert"
    className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-text-primary"
  >
    <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
    <span>{message}</span>
  </div>
);
