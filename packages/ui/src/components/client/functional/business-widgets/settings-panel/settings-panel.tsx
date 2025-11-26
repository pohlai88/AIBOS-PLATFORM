/**
 * SettingsPanel Component - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

"use client";

import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { SettingsPanelProps, SettingItem } from "./settings-panel.types";

const settingsPanelVariants = {
  base: ["flex flex-col", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "mcp-functional-component"].join(" "),
  header: ["flex items-center justify-between p-4 border-b", colorTokens.border].join(" "),
  content: ["flex-1 overflow-auto"].join(" "),
  group: ["p-4 border-b last:border-b-0", colorTokens.border].join(" "),
  groupTitle: ["flex items-center gap-2 font-semibold mb-4"].join(" "),
  setting: ["flex items-center justify-between py-3"].join(" "),
  settingLabel: ["flex flex-col gap-1"].join(" "),
  footer: ["flex items-center justify-end gap-2 p-4 border-t", colorTokens.border].join(" "),
};

const SettingControl = ({
  setting,
  onChange,
}: {
  setting: SettingItem;
  onChange: (value: unknown) => void;
}) => {
  switch (setting.type) {
    case "toggle":
      return (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(setting.value)}
          onClick={() => onChange(!setting.value)}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors",
            setting.value ? "bg-primary" : colorTokens.bgMuted
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
              setting.value && "translate-x-5"
            )}
          />
        </button>
      );
    case "select":
      return (
        <select
          value={String(setting.value)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={setting.label}
          className={cn("px-3 py-1.5 text-sm", colorTokens.bgMuted, radiusTokens.md, "border", colorTokens.border)}
        >
          {setting.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case "text":
      return (
        <input
          type="text"
          value={String(setting.value)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={setting.label}
          className={cn("px-3 py-1.5 text-sm w-48", colorTokens.bgMuted, radiusTokens.md, "border", colorTokens.border)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          value={Number(setting.value)}
          min={setting.min}
          max={setting.max}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={setting.label}
          className={cn("px-3 py-1.5 text-sm w-24", colorTokens.bgMuted, radiusTokens.md, "border", colorTokens.border)}
        />
      );
    case "color":
      return (
        <input
          type="color"
          value={String(setting.value)}
          onChange={(e) => onChange(e.target.value)}
          aria-label={setting.label}
          className={cn("w-10 h-10 cursor-pointer", radiusTokens.md)}
        />
      );
    default:
      return null;
  }
};

export function SettingsPanel({
  groups,
  onChange,
  onSave,
  onReset,
  testId,
  className,
}: SettingsPanelProps) {
  return (
    <div
      className={cn(settingsPanelVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className={settingsPanelVariants.header}>
        <div className="flex items-center gap-2">
          <Cog6ToothIcon className="h-5 w-5" />
          <span className="font-semibold">Settings</span>
        </div>
      </div>

      <div className={settingsPanelVariants.content}>
        {groups.map((group) => (
          <div key={group.id} className={settingsPanelVariants.group}>
            <h3 className={settingsPanelVariants.groupTitle}>
              {group.icon}
              {group.title}
            </h3>
            {group.settings.map((setting) => (
              <div key={setting.id} className={settingsPanelVariants.setting}>
                <div className={settingsPanelVariants.settingLabel}>
                  <span className="text-sm font-medium">{setting.label}</span>
                  {setting.description && (
                    <span className={cn("text-xs", colorTokens.fgMuted)}>{setting.description}</span>
                  )}
                </div>
                <SettingControl
                  setting={setting}
                  onChange={(value) => onChange(group.id, setting.id, value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {(onSave || onReset) && (
        <div className={settingsPanelVariants.footer}>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className={cn("px-4 py-2 text-sm", radiusTokens.md, "border", colorTokens.border, "hover:bg-muted")}
            >
              Reset
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className={cn("px-4 py-2 text-sm bg-primary text-primary-foreground", radiusTokens.md)}
            >
              Save Changes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

SettingsPanel.displayName = "SettingsPanel";
export { settingsPanelVariants };
export type { SettingsPanelProps, SettingGroup, SettingItem, SettingType } from "./settings-panel.types";
export default SettingsPanel;

