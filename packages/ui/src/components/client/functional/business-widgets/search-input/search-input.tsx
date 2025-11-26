/**
 * SearchInput Component - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { SearchInputProps, SearchSuggestion } from "./search-input.types";

const searchVariants = {
  base: ["relative w-full", "mcp-functional-component"].join(" "),
  input: ["w-full pl-10 pr-10 py-2", colorTokens.bgMuted, radiusTokens.lg, "border", colorTokens.border, "focus:outline-2 focus:outline-primary", colorTokens.fg].join(" "),
  dropdown: ["absolute z-10 w-full mt-1 max-h-60 overflow-auto", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "shadow-lg"].join(" "),
  item: ["px-4 py-2 cursor-pointer hover:bg-muted", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
};

export function SearchInput({
  value,
  onChange,
  onSearch,
  onSelect,
  suggestions = [],
  placeholder = "Search...",
  loading = false,
  debounceMs = 300,
  testId,
  className,
}: SearchInputProps) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (val && onSearch) {
      timeoutRef.current = setTimeout(() => onSearch(val), debounceMs);
    }
    setShowDropdown(!!val);
  };

  const handleClear = () => {
    onChange("");
    setShowDropdown(false);
  };

  const handleSelect = (suggestion: SearchSuggestion) => {
    onSelect?.(suggestion);
    onChange(suggestion.label);
    setShowDropdown(false);
  };

  return (
    <div
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      className={cn(searchVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onFocus={() => value && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder={placeholder}
        aria-label="Search"
        className={searchVariants.input}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}

      {showDropdown && (suggestions.length > 0 || loading) && (
        <ul role="listbox" className={searchVariants.dropdown}>
          {loading ? (
            <li className={cn("px-4 py-2", colorTokens.fgMuted)}>Loading...</li>
          ) : (
            suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  onClick={() => handleSelect(s)}
                  className={cn(searchVariants.item, "w-full text-left")}
                >
                  <span className={colorTokens.fg}>{s.label}</span>
                  {s.description && <span className={cn("block text-xs", colorTokens.fgMuted)}>{s.description}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

SearchInput.displayName = "SearchInput";
export { searchVariants };
export type { SearchInputProps, SearchSuggestion } from "./search-input.types";
export default SearchInput;

