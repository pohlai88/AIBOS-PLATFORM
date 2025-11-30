/**
 * Simple Search Icon for UI controls
 */
import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const SearchIconSimple = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </FlatIconBase>
);

SearchIconSimple.displayName = "SearchIconSimple";

