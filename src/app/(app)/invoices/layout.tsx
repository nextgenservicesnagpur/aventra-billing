import type { ReactNode } from "react";
import { InvoiceWorkspaceProvider } from "@/features/invoices/presentation/hooks/InvoiceWorkspaceProvider";

export type InvoicesLayoutProps = {
  children: ReactNode;
};

/**
 * Invoices route layout. Session access and persistent header shell are
 * owned by the parent (app) layout. This segment provides the in-memory
 * invoice workspace context to all invoice routes.
 */
const InvoicesLayout = ({ children }: InvoicesLayoutProps) => (
  <InvoiceWorkspaceProvider>{children}</InvoiceWorkspaceProvider>
);

export default InvoicesLayout;

