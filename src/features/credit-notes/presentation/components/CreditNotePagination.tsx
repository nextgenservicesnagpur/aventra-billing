import { Pagination, type PaginationProps } from "@/shared/components/table/Pagination";

export type CreditNotePaginationProps = Omit<PaginationProps, "itemName">;

export const CreditNotePagination = (props: CreditNotePaginationProps) => (
  <Pagination {...props} itemName="credit notes" />
);
