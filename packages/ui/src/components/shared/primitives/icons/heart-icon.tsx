/**
 * HeartIcon - Flat Icon
 * 
 * Commonly used icon for favorites, likes, and preferences.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const HeartIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </FlatIconBase>
);

HeartIcon.displayName = "HeartIcon";

