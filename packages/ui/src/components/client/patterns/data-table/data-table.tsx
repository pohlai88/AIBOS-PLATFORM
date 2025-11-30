/**
 * DataTable Component - Layer 3 Complex Pattern
 *
 * Advanced data table with sorting, pagination, and row selection.
 * Composes Layer 1 Table primitive with interactive features.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { DataTable } from '@aibos/ui/patterns';
 *
 * const columns = [
 *   { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
 *   { id: 'email', header: 'Email', accessor: (row) => row.email },
 * ];
 *
 * export default function Page() {
 *   return <DataTable data={users} columns={columns} paginated />;
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import Layer 1 Table primitive
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../shared/primitives/table";

// Import Layer 1 Text component
import { Text } from "../../../shared/typography/text";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type {
  DataTableProps,
  DataTableColumn,
  SortDirection,
} from "./data-table.types";

/**
 * DataTable - Advanced data table component
 *
 * Features:
 * - Column-based data rendering
 * - Sorting (ascending/descending)
 * - Pagination
 * - Row selection
 * - Clickable rows
 * - Composes Table primitive
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export function DataTable<T = any>({
  data,
  columns,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row: T, index: number) => String(index),
  paginated = false,
  pageSize = 10,
  page: controlledPage,
  onPageChange,
  sortBy: controlledSortBy,
  sortDirection: controlledSortDirection,
  onSortChange,
  clickable = false,
  onRowClick,
  className,
  testId,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  // Internal state for uncontrolled mode
  const [internalPage, setInternalPage] = React.useState(0);
  const [internalSortBy, setInternalSortBy] = React.useState<string | undefined>();
  const [internalSortDirection, setInternalSortDirection] =
    React.useState<SortDirection>(null);
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<string[]>([]);

  // Use controlled or uncontrolled state
  const page = controlledPage !== undefined ? controlledPage : internalPage;
  const sortBy = controlledSortBy !== undefined ? controlledSortBy : internalSortBy;
  const sortDirection =
    controlledSortDirection !== undefined
      ? controlledSortDirection
      : internalSortDirection;
  const selected = selectedRows.length > 0 ? selectedRows : internalSelectedRows;

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortBy || !sortDirection) return data;

    const column = columns.find((col) => col.id === sortBy);
    if (!column || !column.sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      // Simple string/number comparison
      const aStr = String(aValue ?? "");
      const bStr = String(bValue ?? "");

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortBy, sortDirection, columns]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!paginated) return sortedData;
    const start = page * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, paginated, page, pageSize]);

  const totalPages = paginated ? Math.ceil(sortedData.length / pageSize) : 1;

  // Handle sort
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    let newDirection: SortDirection = "asc";
    if (sortBy === columnId) {
      if (sortDirection === "asc") {
        newDirection = "desc";
      } else if (sortDirection === "desc") {
        newDirection = null;
      }
    }

    if (onSortChange) {
      onSortChange(columnId, newDirection);
    } else {
      setInternalSortBy(newDirection ? columnId : undefined);
      setInternalSortDirection(newDirection);
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId: string, checked: boolean) => {
    let newSelection: string[];
    if (checked) {
      newSelection = [...selected, rowId];
    } else {
      newSelection = selected.filter((id) => id !== rowId);
    }

    if (onSelectionChange) {
      onSelectionChange(newSelection);
    } else {
      setInternalSelectedRows(newSelection);
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    const allIds = paginatedData.map((row, index) =>
      getRowId(row, index)
    );
    if (onSelectionChange) {
      onSelectionChange(checked ? allIds : []);
    } else {
      setInternalSelectedRows(checked ? allIds : []);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  // Check if all visible rows are selected
  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row, index) =>
      selected.includes(getRowId(row, index))
    );

  // Check if some rows are selected
  const someSelected =
    paginatedData.some((row, index) =>
      selected.includes(getRowId(row, index))
    ) && !allSelected;

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          "p-8",
          "border border-border-subtle rounded-lg",
          "bg-bg-muted",
          "mcp-layer3-pattern"
        )}
        data-testid={testId ? `${testId}-empty` : undefined}
      >
        <Text color="muted">{emptyMessage}</Text>
      </div>
    );
  }

  return (
    <div
      className={cn("mcp-layer3-pattern", className)}
      data-testid={testId}
    >
      <Table variant="bordered" size="sm" testId={testId ? `${testId}-table` : undefined}>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all rows"
                  className="cursor-pointer"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  column.sortable && "cursor-pointer select-none",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.width && `w-[${column.width}]`
                )}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span className="text-fg-muted">
                      {sortBy === column.id ? (
                        sortDirection === "asc" ? (
                          "↑"
                        ) : sortDirection === "desc" ? (
                          "↓"
                        ) : null
                      ) : (
                        "⇅"
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, rowIndex) => {
            const rowId = getRowId(row, rowIndex);
            const isSelected = selected.includes(rowId);
            return (
              <TableRow
                key={rowId}
                clickable={clickable || selectable}
                className={cn(
                  isSelected && "bg-bg-muted",
                  clickable && "hover:bg-bg-elevated"
                )}
                onClick={() => clickable && onRowClick?.(row)}
              >
                {selectable && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        handleRowSelect(rowId, e.target.checked)
                      }
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${rowIndex + 1}`}
                      className="cursor-pointer"
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {column.cell ? column.cell(row) : column.accessor(row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {paginated && totalPages > 1 && (
        <div
          className={cn(
            "flex items-center justify-between",
            "mt-4",
            "px-4 py-2",
            "border-t border-border-subtle"
          )}
        >
          <Text size="sm" color="muted">
            Showing {page * pageSize + 1} to{" "}
            {Math.min((page + 1) * pageSize, sortedData.length)} of{" "}
            {sortedData.length} entries
          </Text>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className={cn(
                "px-3 py-1",
                "border border-border-subtle rounded",
                "bg-bg",
                "text-fg",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:bg-bg-elevated",
                "transition-colors"
              )}
              aria-label="Previous page"
            >
              Previous
            </button>
            <Text size="sm">
              Page {page + 1} of {totalPages}
            </Text>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className={cn(
                "px-3 py-1",
                "border border-border-subtle rounded",
                "bg-bg",
                "text-fg",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:bg-bg-elevated",
                "transition-colors"
              )}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

DataTable.displayName = "DataTable";

