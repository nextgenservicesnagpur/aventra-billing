import { Pagination, type PaginationProps } from "@/shared/components/table/Pagination";

export type InvoicePaginationProps = Omit<PaginationProps, "itemName">;

export const InvoicePagination = (props: InvoicePaginationProps) => (
  <Pagination {...props} itemName="invoices" />
);
