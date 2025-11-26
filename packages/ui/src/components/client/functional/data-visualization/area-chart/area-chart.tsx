/**
 * AreaChart Component - Layer 3 Functional Component
 * @module AreaChart
 * @layer 3
 * @category data-visualization
 * @library recharts
 */

"use client";

import * as React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { AreaChartProps, AreaConfig } from "./area-chart.types";

const areaChartVariants = {
  base: [
    "w-full",
    colorTokens.bgElevated,
    radiusTokens.lg,
    "p-4",
    "mcp-functional-component",
  ].join(" "),
  sizes: {
    sm: { height: 200 },
    md: { height: 300 },
    lg: { height: 400 },
  },
};

const chartColors = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-success)",
  "var(--color-warning)",
];

export function AreaChart({
  data,
  areas,
  dataKey = "value",
  xAxisKey = "name",
  width = "100%",
  height,
  size = "md",
  variant = "default",
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showLegend = false,
  title,
  description,
  testId,
  className,
}: AreaChartProps) {
  const chartHeight = height || areaChartVariants.sizes[size].height;
  const areaConfigs: AreaConfig[] = areas || [
    { dataKey, name: dataKey, fill: chartColors[0], stroke: chartColors[0] },
  ];

  return (
    <div
      role="figure"
      aria-label={title || "Area chart"}
      aria-describedby={description ? `${testId}-desc` : undefined}
      className={cn(areaChartVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
      data-library="recharts"
    >
      {description && (
        <p id={`${testId}-desc`} className="sr-only">{description}</p>
      )}
      {title && (
        <h3 className={cn("text-sm font-medium mb-2", colorTokens.fg)}>{title}</h3>
      )}
      <ResponsiveContainer width={width as number | `${number}%`} height={chartHeight}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
          )}
          {showXAxis && (
            <XAxis dataKey={xAxisKey} stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
          )}
          {showYAxis && (
            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
          )}
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
              }}
            />
          )}
          {showLegend && <Legend />}
          {areaConfigs.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name || area.dataKey}
              fill={area.fill || chartColors[index % chartColors.length]}
              stroke={area.stroke || chartColors[index % chartColors.length]}
              fillOpacity={area.fillOpacity ?? 0.3}
              stackId={variant === "stacked" ? "stack" : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

AreaChart.displayName = "AreaChart";

export { areaChartVariants };
export type { AreaChartProps, AreaConfig, DataPoint } from "./area-chart.types";
export default AreaChart;

