/**
 * MenuIcon - Flat Icon
 * 
 * Commonly used icon for navigation menus and hamburger menus.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const MenuIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </FlatIconBase>
);

MenuIcon.displayName = "MenuIcon";

