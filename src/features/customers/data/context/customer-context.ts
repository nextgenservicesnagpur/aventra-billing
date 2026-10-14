import "server-only";

import { getAuthState } from "@/features/auth";
import {
  CustomerDomainError,
  UnauthorizedCustomerAccessError,
} from "../../domain/errors/customer-errors";

export type CustomerContext = {
  organizationId: string;
  userId: string;
};

/**
 * Resolves the authenticated organization context for customer operations.
 * Enforces server-side authentication and organization ownership checks.
 */
export const resolveCustomerContext = async (): Promise<CustomerContext> => {
  const state = await getAuthState();

  if (state.status !== "authenticated") {
    throw new UnauthorizedCustomerAccessError();
  }

  if (state.organization === null) {
    throw new CustomerDomainError("Active organization context is missing.");
  }

  return {
    organizationId: state.organization.id,
    userId: state.user.id,
  };
};
