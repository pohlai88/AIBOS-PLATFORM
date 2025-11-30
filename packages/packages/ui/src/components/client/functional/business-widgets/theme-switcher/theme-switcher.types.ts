/**
 * ThemeSwitcher Types - Layer 3 Functional Component
 * @module ThemeSwitcherTypes
 * @layer 3
 * @category business-widgets
 */

export type ThemeMode = "light" | "dark" | "system";
export type WCAGLevel = "aesthetic" | "aa" | "aaa";

export interface ThemeSwitcherProps {
  mode?: ThemeMode;
  wcagLevel?: WCAGLevel;
  onModeChange?: (mode: ThemeMode) => void;
  onWcagLevelChange?: (level: WCAGLevel) => void;
  showWcagOptions?: boolean;
  compact?: boolean;
  testId?: string;
  className?: string;
}

