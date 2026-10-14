import "server-only";

import { resolveCustomerContext } from "../context/customer-context";
import { customerRepository } from "../../infrastructure/repositories/prisma-customer-repository";
import { toCustomerDto } from "../mappers/customer-mappers";
import type { CustomerDto } from "../dto/customer-dto";

export const getCustomer = async (id: string): Promise<CustomerDto | null> => {
  const { organizationId } = await resolveCustomerContext();
  const customer = await customerRepository.findById(organizationId, id);

  if (!customer) return null;
  return toCustomerDto(customer);
};
