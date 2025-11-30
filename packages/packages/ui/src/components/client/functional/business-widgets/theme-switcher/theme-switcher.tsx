/**
 * ThemeSwitcher Component - Layer 3 Functional Component
 * @module ThemeSwitcher
 * @layer 3
 * @category business-widgets
 */

"use client";

import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { ThemeSwitcherProps, ThemeMode, WCAGLevel } from "./theme-switcher.types";

const themeSwitcherVariants = {
  base: ["inline-flex items-center gap-2", "mcp-functional-component"].join(" "),
  button: [
    "p-2",
    radiusTokens.md,
    "transition-colors",
    "focus-visible:outline-2 focus-visible:outline-primary",
  ].join(" "),
  segment: [
    "inline-flex",
    radiusTokens.lg,
    colorTokens.bgMuted,
    "p-1",
  ].join(" "),
};

const modeIcons: Record<ThemeMode, React.ElementType> = {
  light: SunIcon,
  dark: MoonIcon,
  system: ComputerDesktopIcon,
};

const wcagLabels: Record<WCAGLevel, string> = {
  aesthetic: "Aesthetic",
  aa: "WCAG AA",
  aaa: "WCAG AAA",
};

export function ThemeSwitcher({
  mode = "system",
  wcagLevel = "aa",
  onModeChange,
  onWcagLevelChange,
  showWcagOptions = false,
  compact = false,
  testId,
  className,
}: ThemeSwitcherProps) {
  const modes: ThemeMode[] = ["light", "dark", "system"];
  const wcagLevels: WCAGLevel[] = ["aesthetic", "aa", "aaa"];

  return (
    <div
      role="group"
      aria-label="Theme settings"
      className={cn(themeSwitcherVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      {/* Theme mode selector */}
      <div role="radiogroup" aria-label="Color mode" className={themeSwitcherVariants.segment}>
        {modes.map((m) => {
          const Icon = modeIcons[m];
          const isActive = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${m} mode`}
              onClick={() => onModeChange?.(m)}
              className={cn(
                themeSwitcherVariants.button,
                isActive ? "bg-background shadow-sm" : "hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {!compact && <span className="sr-only">{m}</span>}
            </button>
          );
        })}
      </div>

      {/* WCAG level selector */}
      {showWcagOptions && (
        <div role="radiogroup" aria-label="Accessibility level" className={themeSwitcherVariants.segment}>
          {wcagLevels.map((level) => {
            const isActive = wcagLevel === level;
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onWcagLevelChange?.(level)}
                className={cn(
                  themeSwitcherVariants.button,
                  "text-xs px-3",
                  isActive ? "bg-background shadow-sm" : "hover:bg-muted"
                )}
              >
                {wcagLabels[level]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

ThemeSwitcher.displayName = "ThemeSwitcher";

export { themeSwitcherVariants };
export type { ThemeSwitcherProps, ThemeMode, WCAGLevel } from "./theme-switcher.types";
export default ThemeSwitcher;

