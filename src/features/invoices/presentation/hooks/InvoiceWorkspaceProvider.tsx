"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Invoice } from "../../domain/invoice";

type InvoiceWorkspace = {
  invoices: Invoice[];
  saveDraft: (invoice: Invoice) => void;
  getInvoice: (id: string) => Invoice | undefined;
  setAllInvoices: (invoices: Invoice[]) => void;
};

const WorkspaceContext = createContext<InvoiceWorkspace | null>(null);

export const InvoiceWorkspaceProvider = ({
  children,
  initialInvoices = [],
}: {
  children: ReactNode;
  initialInvoices?: Invoice[];
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const value = useMemo<InvoiceWorkspace>(
    () => ({
      invoices,
      saveDraft: (invoice) =>
        setInvoices((current) => [
          invoice,
          ...current.filter((item) => item.id !== invoice.id),
        ]),
      getInvoice: (id) => invoices.find((invoice) => invoice.id === id),
      setAllInvoices: (newInvoices) => setInvoices(newInvoices),
    }),
    [invoices],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useInvoiceWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useInvoiceWorkspace must be used within InvoiceWorkspaceProvider",
    );
  }
  return context;
};
