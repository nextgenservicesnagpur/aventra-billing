import "server-only";

import { resolveInvoiceContext } from "../context/invoice-context";
import { invoiceRepository } from "../../infrastructure/repositories/prisma-invoice-repository";
import type { Invoice } from "../../domain/invoice";
import type { InvoiceListFilterDto } from "../dto/invoice-dto";

export type GetInvoicesResult = {
  invoices: Invoice[];
  totalCount: number;
};

export const getInvoices = async (
  filter?: InvoiceListFilterDto,
): Promise<GetInvoicesResult> => {
  const { organizationId } = await resolveInvoiceContext();

  const invoices = await invoiceRepository.findMany(organizationId, {
    query: filter?.query,
    status: filter?.status,
    customerId: filter?.customerId,
    startDate: filter?.startDate,
    endDate: filter?.endDate,
  });

  return {
    invoices,
    totalCount: invoices.length,
  };
};
