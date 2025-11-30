/**
 * Maximize Icon for UI controls
 */
import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const MaximizeIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
  </FlatIconBase>
);

MaximizeIcon.displayName = "MaximizeIcon";

