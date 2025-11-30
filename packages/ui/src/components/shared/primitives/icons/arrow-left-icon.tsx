/**
 * ArrowLeftIcon - Flat Icon
 * 
 * Commonly used icon for back navigation and previous actions.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const ArrowLeftIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </FlatIconBase>
);

ArrowLeftIcon.displayName = "ArrowLeftIcon";

