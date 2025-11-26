/**
 * RadarChart Component - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

"use client";

import * as React from "react";
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { RadarChartProps } from "./radar-chart.types";

const chartColors = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-success)",
];

const radarChartVariants = {
  base: [colorTokens.bgElevated, radiusTokens.lg, "p-4", "mcp-functional-component"].join(" "),
};

export function RadarChart({
  data,
  dataKeys = ["value"],
  width = "100%",
  height = 300,
  showLegend = false,
  showTooltip = true,
  title,
  testId,
  className,
}: RadarChartProps) {
  return (
    <div
      role="figure"
      aria-label={title || "Radar chart"}
      className={cn(radarChartVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {title && <h3 className={cn("text-sm font-medium mb-2", colorTokens.fg)}>{title}</h3>}
      <ResponsiveContainer width={width as number | `${number}%`} height={height}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey="subject" stroke="var(--color-text-muted)" fontSize={12} />
          <PolarRadiusAxis stroke="var(--color-text-muted)" fontSize={10} />
          {dataKeys.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={chartColors[index % chartColors.length]}
              fill={chartColors[index % chartColors.length]}
              fillOpacity={0.3}
            />
          ))}
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
              }}
            />
          )}
          {showLegend && <Legend />}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

RadarChart.displayName = "RadarChart";
export { radarChartVariants };
export type { RadarChartProps, RadarChartDataPoint } from "./radar-chart.types";
export default RadarChart;

