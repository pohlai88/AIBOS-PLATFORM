/**
 * DataTableDensitySelector Component - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { TableDensity } from "./data-table-density-selector.types";

/**
 * Props interface for DataTableDensitySelector
 * @interface DataTableDensitySelectorProps
 */
export interface DataTableDensitySelectorProps {
  /** Current density selection */
  density: TableDensity;
  /** Callback when density changes */
  onChange: (density: TableDensity) => void;
  /** Test ID for testing */
  testId?: string;
  /** Additional CSS classes */
  className?: string;
}

const densityVariants = {
  base: [
    "inline-flex p-1",
    colorTokens.bgMuted,
    radiusTokens.lg,
    "mcp-functional-component",
  ].join(" "),
  button: [
    "px-3 py-1.5 text-sm",
    radiusTokens.md,
    "focus-visible:outline-2 focus-visible:outline-primary",
  ].join(" "),
};

const densityOptions: { value: TableDensity; label: string; icon: string }[] = [
  { value: "compact", label: "Compact", icon: "▤" },
  { value: "normal", label: "Normal", icon: "▦" },
  { value: "comfortable", label: "Comfortable", icon: "▧" },
];

/**
 * DataTableDensitySelector - Row density control for data tables
 *
 * @example
 * ```tsx
 * <DataTableDensitySelector
 *   density="normal"
 *   onChange={(d) => setDensity(d)}
 * />
 * ```
 */
export const DataTableDensitySelector = React.forwardRef<
  HTMLDivElement,
  DataTableDensitySelectorProps
>(({ density, onChange, testId, className }, ref) => {
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label="Table row density"
      className={cn(densityVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {densityOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={density === opt.value}
          aria-label={opt.label}
          onClick={() => onChange(opt.value)}
          className={cn(
            densityVariants.button,
            density === opt.value ? "bg-background shadow-sm" : "hover:bg-muted"
          )}
        >
          <span aria-hidden="true">{opt.icon}</span>
          <span className="sr-only">{opt.label}</span>
        </button>
      ))}
    </div>
  );
});

DataTableDensitySelector.displayName = "DataTableDensitySelector";
export { densityVariants };
export type { TableDensity } from "./data-table-density-selector.types";
export default DataTableDensitySelector;
