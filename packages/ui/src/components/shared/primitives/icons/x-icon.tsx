/**
 * XIcon - Flat Icon
 * 
 * Commonly used icon for close, cancel, and delete actions.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const XIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </FlatIconBase>
);

XIcon.displayName = "XIcon";

