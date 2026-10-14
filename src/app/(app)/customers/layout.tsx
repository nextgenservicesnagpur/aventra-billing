import type { ReactNode } from "react";

export type CustomersLayoutProps = {
  children: ReactNode;
};

/**
 * Customers route layout.
 * Renders child customer pages with real database persistence.
 */
const CustomersLayout = ({ children }: CustomersLayoutProps) => {
  return <>{children}</>;
};

export default CustomersLayout;
