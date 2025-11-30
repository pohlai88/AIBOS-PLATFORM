/**
 * DataTableColumnVisibility Component - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { DataTableColumnVisibilityProps } from "./data-table-column-visibility.types";

const columnVisibilityVariants = {
  base: ["w-64 p-2", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "shadow-lg", "mcp-functional-component"].join(" "),
  item: ["flex items-center gap-2 px-2 py-1.5 w-full text-left", radiusTokens.md, "hover:bg-muted", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
};

export function DataTableColumnVisibility({
  columns,
  onToggle,
  onShowAll,
  onHideAll,
  testId,
  className,
}: DataTableColumnVisibilityProps) {
  return (
    <div
      role="group"
      aria-label="Column visibility"
      className={cn(columnVisibilityVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className={cn("flex justify-between text-xs mb-2 px-2", colorTokens.fgMuted)}>
        <span>Columns</span>
        <div className="flex gap-2">
          {onShowAll && <button type="button" onClick={onShowAll} className="hover:underline">Show all</button>}
          {onHideAll && <button type="button" onClick={onHideAll} className="hover:underline">Hide all</button>}
        </div>
      </div>
      <div role="list">
        {columns.map((col) => (
          <button
            key={col.id}
            type="button"
            role="listitem"
            onClick={() => onToggle(col.id, !col.visible)}
            className={columnVisibilityVariants.item}
          >
            {col.visible ? (
              <EyeIcon className="h-4 w-4 text-primary" />
            ) : (
              <EyeSlashIcon className={cn("h-4 w-4", colorTokens.fgMuted)} />
            )}
            <span className={cn("text-sm", col.visible ? colorTokens.fg : colorTokens.fgMuted)}>{col.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

DataTableColumnVisibility.displayName = "DataTableColumnVisibility";
export { columnVisibilityVariants };
export type { DataTableColumnVisibilityProps, ColumnVisibilityItem } from "./data-table-column-visibility.types";
export default DataTableColumnVisibility;

