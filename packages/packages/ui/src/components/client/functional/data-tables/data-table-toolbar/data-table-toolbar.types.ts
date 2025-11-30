/**
 * DataTableToolbar Types - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

export interface FilterOption {
  label: string;
  value: string;
}

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: { id: string; label: string; options: FilterOption[] }[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (filterId: string, value: string) => void;
  onClearFilters?: () => void;
  actions?: React.ReactNode;
  testId?: string;
  className?: string;
}

