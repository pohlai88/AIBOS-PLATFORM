/**
 * DataTable Component - Layer 3 Functional Component
 *
 * Enterprise data table built with TanStack Table v8.
 * NO Radix UI - uses React-first headless library.
 *
 * @module DataTable
 * @layer 3
 * @category data-tables
 * @library @tanstack/react-table
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import * as React from "react";

import {
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { DataTableProps } from "./data-table.types";

// ============================================================================
// Variant System
// ============================================================================

const dataTableVariants = {
  base: [
    "w-full",
    "overflow-auto",
    colorTokens.bgElevated,
    radiusTokens.lg,
    "mcp-functional-component",
  ].join(" "),

  table: ["w-full", "caption-bottom", typographyTokens.sm].join(" "),

  header: [colorTokens.bgMuted, "border-b", colorTokens.border].join(" "),

  headerCell: [
    "h-10",
    "px-4",
    "text-left",
    "align-middle",
    "font-medium",
    colorTokens.fgMuted,
    "select-none",
  ].join(" "),

  body: ["[&_tr:last-child]:border-0"].join(" "),

  row: [
    "border-b",
    colorTokens.border,
    "transition-colors",
    "hover:bg-muted/50",
    "data-[state=selected]:bg-muted",
  ].join(" "),

  cell: ["px-4", "align-middle"].join(" "),

  // Focus visible for buttons (WCAG 2.4.11)
  sortButton: [
    "flex items-center gap-1 w-full text-left cursor-pointer select-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  ].join(" "),

  variants: {
    size: {
      sm: { cell: "py-1.5", headerCell: "h-8" },
      md: { cell: "py-3", headerCell: "h-10" },
      lg: { cell: "py-4", headerCell: "h-12" },
    },
    variant: {
      default: "",
      bordered: `border ${colorTokens.border}`,
      striped: "[&_tbody_tr:nth-child(odd)]:bg-muted/30",
    },
    density: {
      compact: { cell: "py-1 px-2" },
      normal: { cell: "py-3 px-4" },
      comfortable: { cell: "py-4 px-6" },
    },
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function DataTable<TData>({
  data,
  columns,
  size = "md",
  variant = "default",
  density = "normal",
  enableRowSelection = false,
  enableSorting = true,
  enableFiltering = false,
  enablePagination = true,
  pageSizeOptions = [10, 20, 50, 100],
  initialPageSize = 10,
  loading = false,
  emptyMessage = "No results.",
  onRowSelectionChange,
  onSortingChange,
  testId,
  className,
  "aria-label": ariaLabel,
}: DataTableProps<TData>) {
  // State
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: (updater) => {
        const newSorting =
          typeof updater === "function" ? updater(sorting) : updater;
        setSorting(newSorting);
        onSortingChange?.(newSorting);
      },
    }),
    ...(enableFiltering && {
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: setColumnFilters,
    }),
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize: initialPageSize } },
    }),
    ...(enableRowSelection && {
      onRowSelectionChange: (updater) => {
        const newSelection =
          typeof updater === "function" ? updater(rowSelection) : updater;
        setRowSelection(newSelection);
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => data[parseInt(key)]);
        onRowSelectionChange?.(selectedRows);
      },
      enableRowSelection: true,
    }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  // Accessibility props - WCAG compliant region
  const accessibilityProps = {
    role: "region" as const,
    "data-testid": testId,
    "data-mcp-validated": "true",
    "data-constitution-compliant": "layer3-functional",
    "data-layer": "3",
    "data-library": "@tanstack/react-table",
    "aria-label": ariaLabel || "Data table",
    "aria-busy": loading,
  };

  return (
    <div
      className={cn(
        dataTableVariants.base,
        dataTableVariants.variants.variant[variant],
        className
      )}
      {...accessibilityProps}
    >
      {/* Table - native semantics, no redundant roles */}
      <table className={dataTableVariants.table}>
        <thead className={dataTableVariants.header}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className={cn(
                    dataTableVariants.headerCell,
                    dataTableVariants.variants.size[size].headerCell
                  )}
                  aria-sort={
                    header.column.getIsSorted()
                      ? header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className={dataTableVariants.sortButton}
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={`Sort by ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : "column"}`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() && (
                        <>
                          <span aria-hidden="true" className="ml-1">
                            {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                          </span>
                          <span className="sr-only">
                            {header.column.getIsSorted() === "asc"
                              ? "Sorted ascending"
                              : "Sorted descending"}
                          </span>
                        </>
                      )}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className={dataTableVariants.body}>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(dataTableVariants.cell, "h-24 text-center")}
              >
                {/* Live region for loading state */}
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center justify-center"
                >
                  <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                  <span className="ml-2">Loading...</span>
                </div>
              </td>
            </tr>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={dataTableVariants.row}
                data-state={row.getIsSelected() ? "selected" : undefined}
                aria-selected={row.getIsSelected() || undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      dataTableVariants.cell,
                      dataTableVariants.variants.size[size].cell,
                      dataTableVariants.variants.density[density].cell
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(
                  dataTableVariants.cell,
                  "h-24 text-center",
                  colorTokens.fgMuted
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {enablePagination && table.getPageCount() > 1 && (
        <nav
          aria-label="Table pagination"
          className={cn(
            "flex items-center justify-between",
            spacingTokens.md,
            "border-t",
            colorTokens.border
          )}
        >
          <div className={cn(typographyTokens.sm, colorTokens.fgMuted)}>
            <span aria-live="polite">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={cn(
                "px-3 py-1",
                radiusTokens.sm,
                colorTokens.bgMuted,
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:bg-muted/80",
                "focus-visible:outline-2 focus-visible:outline-primary"
              )}
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn(
                "px-3 py-1",
                radiusTokens.sm,
                colorTokens.bgMuted,
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:bg-muted/80",
                "focus-visible:outline-2 focus-visible:outline-primary"
              )}
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

DataTable.displayName = "DataTable";

// ============================================================================
// Exports
// ============================================================================

export { dataTableVariants };
export type { DataTableProps };
export default DataTable;
