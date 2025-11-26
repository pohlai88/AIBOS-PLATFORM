/**
 * MetricDisplay Types - Layer 3 Functional Component
 * @module MetricDisplayTypes
 * @layer 3
 * @category business-widgets
 */

export type MetricFormat = "number" | "currency" | "percentage" | "duration";

export interface MetricDisplayProps {
  label: string;
  value: number;
  format?: MetricFormat;
  currency?: string;
  locale?: string;
  precision?: number;
  target?: number;
  showProgress?: boolean;
  testId?: string;
  className?: string;
}

