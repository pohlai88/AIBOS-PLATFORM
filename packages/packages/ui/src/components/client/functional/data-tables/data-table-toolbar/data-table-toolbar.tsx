/**
 * DataTableToolbar Component - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { DataTableToolbarProps } from "./data-table-toolbar.types";

const toolbarVariants = {
  base: ["flex flex-wrap items-center gap-3 p-3", colorTokens.bgElevated, radiusTokens.lg, "mcp-functional-component"].join(" "),
  search: ["flex items-center gap-2 px-3 py-2", colorTokens.bgMuted, radiusTokens.md].join(" "),
  select: ["px-3 py-2", colorTokens.bgMuted, radiusTokens.md, "text-sm", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
};

export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  actions,
  testId,
  className,
}: DataTableToolbarProps) {
  const hasActiveFilters = Object.values(activeFilters).some((v) => v);

  return (
    <div
      role="toolbar"
      aria-label="Table toolbar"
      className={cn(toolbarVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {/* Search */}
      {onSearchChange && (
        <div className={toolbarVariants.search}>
          <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search table"
            className={cn("bg-transparent outline-none text-sm", colorTokens.fg)}
          />
        </div>
      )}

      {/* Filters */}
      {filters.map((filter) => (
        <select
          key={filter.id}
          value={activeFilters[filter.id] || ""}
          onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
          aria-label={filter.label}
          className={toolbarVariants.select}
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}

      {/* Clear filters */}
      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className={cn("flex items-center gap-1 text-sm", colorTokens.fgMuted, "hover:underline")}
        >
          <XMarkIcon className="h-4 w-4" />
          Clear
        </button>
      )}

      {/* Actions slot */}
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
}

DataTableToolbar.displayName = "DataTableToolbar";
export { toolbarVariants };
export type { DataTableToolbarProps, FilterOption } from "./data-table-toolbar.types";
export default DataTableToolbar;

