"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sampleCustomers } from "../../data/sampleCustomers";
import type { Customer } from "../../domain/customer";

export type CustomerWorkspace = {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
};

const CustomerWorkspaceContext = createContext<CustomerWorkspace | null>(null);

export const CustomerWorkspaceProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);

  const addCustomer = useCallback((customer: Customer) => {
    setCustomers((current) => [
      customer,
      ...current.filter((c) => c.id !== customer.id),
    ]);
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers((current) =>
      current.map((c) =>
        c.id === id
          ? {
              ...c,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((current) => current.filter((c) => c.id !== id));
  }, []);

  const getCustomer = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers],
  );

  const value = useMemo<CustomerWorkspace>(
    () => ({
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomer,
    }),
    [customers, addCustomer, updateCustomer, deleteCustomer, getCustomer],
  );

  return (
    <CustomerWorkspaceContext.Provider value={value}>
      {children}
    </CustomerWorkspaceContext.Provider>
  );
};

export const useCustomerWorkspace = (): CustomerWorkspace => {
  const context = useContext(CustomerWorkspaceContext);
  if (!context) {
    throw new Error(
      "useCustomerWorkspace must be used within a CustomerWorkspaceProvider",
    );
  }
  return context;
};
