/**
 * DataTableFilter Types - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

export type FilterOperator = "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt" | "between";

export interface FilterConfig {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  operators?: FilterOperator[];
  options?: { label: string; value: string }[];
}

export interface ActiveFilter {
  id: string;
  operator: FilterOperator;
  value: string | number | [string, string];
}

export interface DataTableFilterProps {
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onFilterChange: (filters: ActiveFilter[]) => void;
  onClear?: () => void;
  testId?: string;
  className?: string;
}

