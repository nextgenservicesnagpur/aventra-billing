import type { Customer, CustomerListFilter } from "../entities/customer";

export type CustomerListResult = {
  customers: Customer[];
  totalCount: number;
};

export type ICustomerRepository = {
  findById(organizationId: string, id: string): Promise<Customer | null>;
  list(organizationId: string, filter?: CustomerListFilter): Promise<CustomerListResult>;
  create(customer: Customer): Promise<Customer>;
  update(organizationId: string, id: string, updates: Partial<Customer>): Promise<Customer>;
  delete(organizationId: string, id: string): Promise<void>;
};
