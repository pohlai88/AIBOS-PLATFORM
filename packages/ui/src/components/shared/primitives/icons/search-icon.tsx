/**
 * SearchIcon - Flat Icon
 * 
 * Commonly used icon for search functionality and filters.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const SearchIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </FlatIconBase>
);

SearchIcon.displayName = "SearchIcon";

