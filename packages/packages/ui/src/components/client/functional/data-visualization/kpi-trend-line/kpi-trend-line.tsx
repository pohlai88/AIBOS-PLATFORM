/**
 * KPITrendLine Component - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

"use client";

import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@heroicons/react/24/solid";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { KPITrendLineProps, TrendDirection } from "./kpi-trend-line.types";

const kpiVariants = {
  base: ["flex items-center gap-4 p-4", colorTokens.bgElevated, radiusTokens.lg, "mcp-functional-component"].join(" "),
};

const trendIcons: Record<TrendDirection, React.ElementType> = {
  up: ArrowUpIcon,
  down: ArrowDownIcon,
  neutral: MinusIcon,
};

const trendColors: Record<TrendDirection, string> = {
  up: "text-green-500",
  down: "text-red-500",
  neutral: colorTokens.fgMuted,
};

export function KPITrendLine({
  label,
  value,
  trend = "neutral",
  trendPercent,
  data = [],
  sparklineColor = "var(--color-primary)",
  testId,
  className,
}: KPITrendLineProps) {
  const TrendIcon = trendIcons[trend];

  // Simple sparkline SVG
  const sparklinePath = React.useMemo(() => {
    if (data.length < 2) return "";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 60;
    const height = 24;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    });
    return `M${points.join(" L")}`;
  }, [data]);

  return (
    <div
      role="group"
      aria-label={`${label}: ${value}`}
      className={cn(kpiVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className="flex-1">
        <span className={cn("text-sm", colorTokens.fgMuted)}>{label}</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={cn("text-2xl font-bold", colorTokens.fg)}>{value}</span>
          {trendPercent !== undefined && (
            <span className={cn("flex items-center text-sm", trendColors[trend])}>
              <TrendIcon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{trend === "up" ? "Increased" : trend === "down" ? "Decreased" : "No change"}</span>
              {Math.abs(trendPercent)}%
            </span>
          )}
        </div>
      </div>

      {data.length > 1 && (
        <svg width="60" height="24" aria-hidden="true">
          <path d={sparklinePath} fill="none" stroke={sparklineColor} strokeWidth="2" />
        </svg>
      )}
    </div>
  );
}

KPITrendLine.displayName = "KPITrendLine";
export { kpiVariants };
export type { KPITrendLineProps, TrendDirection } from "./kpi-trend-line.types";
export default KPITrendLine;

