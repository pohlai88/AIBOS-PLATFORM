/**
 * BarChart Component - Layer 3 Functional Component
 *
 * Data visualization bar chart built with Recharts.
 * NO Radix UI - uses React-first charting library.
 *
 * @module BarChart
 * @layer 3
 * @category data-visualization
 * @library recharts
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

"use client";

import * as React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  colorTokens,
  radiusTokens,
} from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { BarChartProps, BarConfig } from "./bar-chart.types";

// ============================================================================
// Variant System
// ============================================================================

const barChartVariants = {
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

// Token-based colors for chart bars
const chartColors = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
];

// ============================================================================
// Main Component
// ============================================================================

export function BarChart({
  data,
  bars,
  dataKey = "value",
  xAxisKey = "name",
  layout = "horizontal",
  width = "100%",
  height,
  size = "md",
  variant = "default",
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showLegend = false,
  barRadius = 4,
  title,
  description,
  testId,
  className,
}: BarChartProps) {
  const chartHeight = height || barChartVariants.sizes[size].height;

  // Build bar configs
  const barConfigs: BarConfig[] = bars || [
    { dataKey, name: dataKey, fill: chartColors[0] },
  ];

  // Accessibility props
  const accessibilityProps = {
    "data-testid": testId,
    "data-mcp-validated": "true",
    "data-constitution-compliant": "layer3-functional",
    "data-layer": "3",
    "data-library": "recharts",
  };

  return (
    <div
      role="figure"
      aria-label={title || "Bar chart"}
      aria-describedby={description ? `${testId}-desc` : undefined}
      className={cn(barChartVariants.base, className)}
      {...accessibilityProps}
    >
      {/* Accessible description */}
      {description && (
        <p id={`${testId}-desc`} className="sr-only">
          {description}
        </p>
      )}

      {/* Chart title */}
      {title && (
        <h3 className={cn("text-sm font-medium mb-2", colorTokens.fg)}>
          {title}
        </h3>
      )}

      <ResponsiveContainer width={width as number | `${number}%`} height={chartHeight}>
        <RechartsBarChart
          data={data}
          layout={layout === "vertical" ? "vertical" : "horizontal"}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.5}
            />
          )}

          {showXAxis && (
            <XAxis
              dataKey={layout === "vertical" ? undefined : xAxisKey}
              type={layout === "vertical" ? "number" : "category"}
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
          )}

          {showYAxis && (
            <YAxis
              dataKey={layout === "vertical" ? xAxisKey : undefined}
              type={layout === "vertical" ? "category" : "number"}
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
          )}

          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--color-text)" }}
              cursor={{ fill: "var(--color-bg-muted)", opacity: 0.3 }}
            />
          )}

          {showLegend && <Legend />}

          {barConfigs.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.fill || chartColors[index % chartColors.length]}
              radius={bar.radius || barRadius}
              stackId={variant === "stacked" ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

BarChart.displayName = "BarChart";

// ============================================================================
// Exports
// ============================================================================

export { barChartVariants };
export type { BarChartProps, BarConfig, DataPoint } from "./bar-chart.types";
export default BarChart;

