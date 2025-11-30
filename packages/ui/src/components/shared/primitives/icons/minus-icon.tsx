/**
 * MinusIcon - Flat Icon
 * 
 * Commonly used icon for remove, decrease, and subtract actions.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const MinusIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </FlatIconBase>
);

MinusIcon.displayName = "MinusIcon";

