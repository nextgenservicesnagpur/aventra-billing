import "server-only";

import { resolveInvoiceContext } from "../context/invoice-context";
import { invoiceRepository } from "../../infrastructure/repositories/prisma-invoice-repository";
import type { Invoice } from "../../domain/invoice";

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  const { organizationId } = await resolveInvoiceContext();
  return await invoiceRepository.findById(organizationId, id);
};
