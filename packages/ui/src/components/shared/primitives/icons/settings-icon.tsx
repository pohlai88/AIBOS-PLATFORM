/**
 * SettingsIcon - Flat Icon
 * 
 * Commonly used icon for settings, preferences, and configuration.
 */

import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export const SettingsIcon = (props: FlatIconProps) => (
  <FlatIconBase {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0L5.636 18.364m12.728 0l-4.243-4.243m-4.242 0L5.636 5.636" />
  </FlatIconBase>
);

SettingsIcon.displayName = "SettingsIcon";

