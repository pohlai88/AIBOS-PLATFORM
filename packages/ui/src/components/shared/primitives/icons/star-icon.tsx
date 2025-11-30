/**
 * StarIcon - Flat Icon
 * 
 * Commonly used icon for ratings, favorites, and highlights.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const StarIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </FlatIconBase>
);

StarIcon.displayName = "StarIcon";

