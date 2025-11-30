/**
 * HeatMap Component - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { HeatMapProps } from "./heat-map.types";

const heatMapVariants = {
  base: [colorTokens.bgElevated, radiusTokens.lg, "p-4", "mcp-functional-component"].join(" "),
};

const defaultColors = ["#f0f9ff", "#bae6fd", "#38bdf8", "#0284c7", "#075985"];

const getColor = (value: number, min: number, max: number, colors: string[]) => {
  const normalized = (value - min) / (max - min || 1);
  const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
  return colors[index];
};

export function HeatMap({
  data,
  xLabels,
  yLabels,
  minValue,
  maxValue,
  colorScale = defaultColors,
  showValues = true,
  cellSize = 40,
  title,
  testId,
  className,
}: HeatMapProps) {
  const values = data.map((d) => d.value);
  const min = minValue ?? Math.min(...values);
  const max = maxValue ?? Math.max(...values);

  const xKeys = xLabels || [...new Set(data.map((d) => String(d.x)))];
  const yKeys = yLabels || [...new Set(data.map((d) => String(d.y)))];

  const getCellValue = (x: string, y: string) => {
    const cell = data.find((d) => String(d.x) === x && String(d.y) === y);
    return cell?.value;
  };

  return (
    <div
      role="figure"
      aria-label={title || "Heat map"}
      className={cn(heatMapVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {title && <h3 className={cn("text-sm font-medium mb-3", colorTokens.fg)}>{title}</h3>}
      <div className="overflow-auto">
        <table role="grid" aria-label="Heat map grid">
          <thead>
            <tr>
              <th className="p-1" />
              {xKeys.map((x) => (
                <th key={x} className={cn("p-1 text-xs font-medium", colorTokens.fgMuted)} style={{ width: cellSize }}>
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yKeys.map((y) => (
              <tr key={y}>
                <th className={cn("p-1 text-xs font-medium text-right pr-2", colorTokens.fgMuted)}>{y}</th>
                {xKeys.map((x) => {
                  const value = getCellValue(x, y);
                  const bg = value !== undefined ? getColor(value, min, max, colorScale) : "transparent";
                  return (
                    <td
                      key={`${x}-${y}`}
                      className={cn("text-center text-xs", radiusTokens.sm)}
                      style={{ backgroundColor: bg, width: cellSize, height: cellSize }}
                      title={value !== undefined ? `${x}, ${y}: ${value}` : undefined}
                    >
                      {showValues && value !== undefined && (
                        <span className="text-xs font-medium" style={{ color: value > (max - min) / 2 ? "#fff" : "#000" }}>
                          {value}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

HeatMap.displayName = "HeatMap";
export { heatMapVariants };
export type { HeatMapProps, HeatMapCell } from "./heat-map.types";
export default HeatMap;

