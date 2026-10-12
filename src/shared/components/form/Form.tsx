import type { FormHTMLAttributes, Ref } from "react";

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  ref?: Ref<HTMLFormElement>;
};

/**
 * Generic form primitive. A semantic <form> passthrough: behavior and
 * layout belong to the consumer. No validation, state, or backend logic.
 */
export const Form = ({ ref, className, ...props }: FormProps) => (
  <form ref={ref} {...props} className={className} />
);
