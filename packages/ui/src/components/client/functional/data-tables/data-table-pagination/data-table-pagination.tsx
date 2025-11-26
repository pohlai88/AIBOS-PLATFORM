/**
 * DataTablePagination Component - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { DataTablePaginationProps } from "./data-table-pagination.types";

const paginationVariants = {
  base: ["flex items-center justify-between gap-4 py-3", "mcp-functional-component"].join(" "),
  button: [
    "p-2",
    radiusTokens.md,
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "hover:bg-muted",
    "focus-visible:outline-2 focus-visible:outline-primary",
  ].join(" "),
  select: ["px-2 py-1 text-sm", colorTokens.bgMuted, radiusTokens.md].join(" "),
};

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  showItemCount = true,
  testId,
  className,
}: DataTablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav
      role="navigation"
      aria-label="Table pagination"
      className={cn(paginationVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className="flex items-center gap-4">
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className={cn("text-sm", colorTokens.fgMuted)}>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
              className={paginationVariants.select}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        {showItemCount && (
          <span className={cn("text-sm", colorTokens.fgMuted)}>
            {startItem}-{endItem} of {totalItems}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className={paginationVariants.button}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className={cn("px-3 text-sm", colorTokens.fg)}>
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={paginationVariants.button}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

DataTablePagination.displayName = "DataTablePagination";
export { paginationVariants };
export type { DataTablePaginationProps } from "./data-table-pagination.types";
export default DataTablePagination;

