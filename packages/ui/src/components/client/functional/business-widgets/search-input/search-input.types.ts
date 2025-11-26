/**
 * SearchInput Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export interface SearchSuggestion {
  id: string;
  label: string;
  description?: string;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  loading?: boolean;
  debounceMs?: number;
  testId?: string;
  className?: string;
}

