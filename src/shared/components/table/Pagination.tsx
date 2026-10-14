import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  className?: string;
};

export const Pagination = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  itemName = "invoices",
  className,
}: PaginationProps) => {
  const fromIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toIndex = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-1 text-sm text-text-secondary",
        className,
      )}
    >
      {/* Result count */}
      <p className="text-sm text-text-secondary">
        {totalCount === 0 ? (
          `Showing 0 ${itemName}`
        ) : (
          <>
            Showing <span className="font-medium text-text-primary">{fromIndex}</span> to{" "}
            <span className="font-medium text-text-primary">{toIndex}</span> of{" "}
            <span className="font-medium text-text-primary">{totalCount}</span> {itemName}
          </>
        )}
      </p>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                aria-label={`Page ${p}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onPageChange(p)}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border border-border/80 text-text-secondary hover:bg-surface-alt hover:text-text-primary",
                )}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
};
