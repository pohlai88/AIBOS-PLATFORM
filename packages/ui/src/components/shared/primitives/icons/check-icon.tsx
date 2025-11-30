/**
 * CheckIcon - Flat Icon
 * 
 * Commonly used icon for success, completion, and confirmation.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const CheckIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <polyline points="20 6 9 17 4 12" />
  </FlatIconBase>
);

CheckIcon.displayName = "CheckIcon";

