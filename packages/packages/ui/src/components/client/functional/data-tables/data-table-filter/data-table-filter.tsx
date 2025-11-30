/**
 * DataTableFilter Component - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

"use client";

import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { DataTableFilterProps, ActiveFilter, FilterOperator } from "./data-table-filter.types";

const filterVariants = {
  base: ["flex flex-wrap items-center gap-2", "mcp-functional-component"].join(" "),
  chip: ["flex items-center gap-1 px-2 py-1 text-sm", colorTokens.bgMuted, radiusTokens.full].join(" "),
  select: ["px-2 py-1 text-sm", colorTokens.bgMuted, radiusTokens.md].join(" "),
};

const operatorLabels: Record<FilterOperator, string> = {
  equals: "=",
  contains: "contains",
  startsWith: "starts with",
  endsWith: "ends with",
  gt: ">",
  lt: "<",
  between: "between",
};

export function DataTableFilter({
  filters,
  activeFilters,
  onFilterChange,
  onClear,
  testId,
  className,
}: DataTableFilterProps) {
  const [selectedFilter, setSelectedFilter] = React.useState("");

  const addFilter = (filterId: string, value: string) => {
    if (!value) return;
    const existing = activeFilters.find((f) => f.id === filterId);
    if (existing) {
      onFilterChange(activeFilters.map((f) => (f.id === filterId ? { ...f, value } : f)));
    } else {
      onFilterChange([...activeFilters, { id: filterId, operator: "contains", value }]);
    }
    setSelectedFilter("");
  };

  const removeFilter = (filterId: string) => {
    onFilterChange(activeFilters.filter((f) => f.id !== filterId));
  };

  return (
    <div
      role="group"
      aria-label="Table filters"
      className={cn(filterVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <FunnelIcon className="h-4 w-4" aria-hidden="true" />

      {/* Active filters */}
      {activeFilters.map((af) => {
        const config = filters.find((f) => f.id === af.id);
        return (
          <span key={af.id} className={filterVariants.chip}>
            <span className={colorTokens.fgMuted}>{config?.label}:</span>
            <span className={colorTokens.fg}>{String(af.value)}</span>
            <button type="button" onClick={() => removeFilter(af.id)} aria-label={`Remove ${config?.label} filter`}>
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      {/* Add filter */}
      <select
        value={selectedFilter}
        onChange={(e) => {
          const fid = e.target.value;
          if (fid) {
            const val = prompt(`Enter value for ${filters.find((f) => f.id === fid)?.label}`);
            if (val) addFilter(fid, val);
          }
        }}
        aria-label="Add filter"
        className={filterVariants.select}
      >
        <option value="">+ Add filter</option>
        {filters
          .filter((f) => !activeFilters.some((af) => af.id === f.id))
          .map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
      </select>

      {activeFilters.length > 0 && onClear && (
        <button type="button" onClick={onClear} className={cn("text-sm", colorTokens.fgMuted, "hover:underline")}>
          Clear all
        </button>
      )}
    </div>
  );
}

DataTableFilter.displayName = "DataTableFilter";
export { filterVariants };
export type { DataTableFilterProps, ActiveFilter, FilterConfig, FilterOperator } from "./data-table-filter.types";
export default DataTableFilter;

