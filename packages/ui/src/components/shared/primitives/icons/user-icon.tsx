/**
 * UserIcon - Flat Icon
 * 
 * Commonly used icon for user profiles, accounts, and authentication.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const UserIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </FlatIconBase>
);

UserIcon.displayName = "UserIcon";

