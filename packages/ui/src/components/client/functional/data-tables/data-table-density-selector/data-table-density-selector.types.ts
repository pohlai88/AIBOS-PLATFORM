/**
 * DataTableDensitySelector Types - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

export type TableDensity = "compact" | "normal" | "comfortable";

export interface DataTableDensitySelectorProps {
  density: TableDensity;
  onChange: (density: TableDensity) => void;
  testId?: string;
  className?: string;
}

