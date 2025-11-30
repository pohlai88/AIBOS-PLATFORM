/**
 * LineChart Component - Layer 3 Functional Component
 *
 * Data visualization line chart built with Recharts.
 * NO Radix UI - uses React-first charting library.
 *
 * @module LineChart
 * @layer 3
 * @category data-visualization
 * @library recharts
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

"use client";

import * as React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
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

import type { LineChartProps, LineConfig } from "./line-chart.types";

// ============================================================================
// Variant System
// ============================================================================

const lineChartVariants = {
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

// Token-based colors for chart lines
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

export function LineChart({
  data,
  lines,
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
}: LineChartProps) {
  const chartHeight = height || lineChartVariants.sizes[size].height;

  // Build line configs
  const lineConfigs: LineConfig[] = lines || [
    { dataKey, name: dataKey, stroke: chartColors[0] },
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
      aria-label={title || "Line chart"}
      aria-describedby={description ? `${testId}-desc` : undefined}
      className={cn(lineChartVariants.base, className)}
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
        <RechartsLineChart
          data={data}
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
              dataKey={xAxisKey}
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
          )}

          {showYAxis && (
            <YAxis
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
            />
          )}

          {showLegend && <Legend />}

          {lineConfigs.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.stroke || chartColors[index % chartColors.length]}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot !== false}
              activeDot={line.activeDot !== false ? { r: 6 } : false}
              {...(variant === "area" && {
                fill: line.stroke || chartColors[index % chartColors.length],
                fillOpacity: 0.1,
              })}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

LineChart.displayName = "LineChart";

// ============================================================================
// Exports
// ============================================================================

export { lineChartVariants };
export type { LineChartProps, LineConfig, DataPoint } from "./line-chart.types";
export default LineChart;

