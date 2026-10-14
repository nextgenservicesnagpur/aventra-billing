import "server-only";

import { resolveCustomerContext } from "../context/customer-context";
import { customerRepository } from "../../infrastructure/repositories/prisma-customer-repository";
import { toCustomerDto } from "../mappers/customer-mappers";
import type { CustomerDto, CustomerFilterInput } from "../dto/customer-dto";

export type GetCustomersResult = {
  customers: CustomerDto[];
  totalCount: number;
};

export const getCustomers = async (
  filter?: CustomerFilterInput,
): Promise<GetCustomersResult> => {
  const { organizationId } = await resolveCustomerContext();

  const page = filter?.page ?? 1;
  const pageSize = filter?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const result = await customerRepository.list(organizationId, {
    query: filter?.query,
    customerType: filter?.customerType,
    status: filter?.status,
    limit: pageSize,
    offset,
  });

  return {
    customers: result.customers.map(toCustomerDto),
    totalCount: result.totalCount,
  };
};
