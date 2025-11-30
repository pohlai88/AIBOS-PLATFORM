/**
 * SettingsPanel Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export type SettingType = "toggle" | "select" | "text" | "number" | "color";

export interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: SettingType;
  value: unknown;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
}

export interface SettingGroup {
  id: string;
  title: string;
  icon?: React.ReactNode;
  settings: SettingItem[];
}

export interface SettingsPanelProps {
  groups: SettingGroup[];
  onChange: (groupId: string, settingId: string, value: unknown) => void;
  onSave?: () => void;
  onReset?: () => void;
  testId?: string;
  className?: string;
}

