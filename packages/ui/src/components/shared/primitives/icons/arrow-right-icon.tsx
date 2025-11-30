/**
 * ArrowRightIcon - Flat Icon
 * 
 * Commonly used icon for forward navigation and next actions.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const ArrowRightIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </FlatIconBase>
);

ArrowRightIcon.displayName = "ArrowRightIcon";

