import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";

export const Table = ({
  className,
  children,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto">
    <table
      className={cn("w-full border-collapse text-left text-sm", className)}
      {...props}
    >
      {children}
    </table>
  </div>
);

export const TableHeader = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead
    className={cn(
      "border-b border-border bg-surface-alt/40 text-[11px] font-semibold uppercase tracking-wider text-text-muted",
      className,
    )}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("divide-y divide-border/60", className)} {...props}>
    {children}
  </tbody>
);

export const TableFooter = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) => (
  <tfoot
    className={cn("border-t border-border bg-surface-alt/20 font-medium", className)}
    {...props}
  >
    {children}
  </tfoot>
);

export const TableRow = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn("hover:bg-surface-alt/30 transition-colors", className)}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({
  className,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "px-3 py-3 text-left font-semibold uppercase tracking-wider text-text-muted",
      className,
    )}
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({
  className,
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn("px-3 py-3 text-text-primary align-middle", className)}
    {...props}
  >
    {children}
  </td>
);

export const TableCaption = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableCaptionElement>) => (
  <caption className={cn("mt-4 text-xs text-text-muted", className)} {...props}>
    {children}
  </caption>
);
