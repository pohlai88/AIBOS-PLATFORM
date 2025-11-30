/**
 * PlusIcon - Flat Icon
 * 
 * Commonly used icon for add, create, and new actions.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const PlusIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </FlatIconBase>
);

PlusIcon.displayName = "PlusIcon";

