/**
 * StatCard Types - Layer 3 Functional Component
 * @module StatCardTypes
 * @layer 3
 * @category business-widgets
 */

export type StatCardTrend = "up" | "down" | "neutral";
export type StatCardSize = "sm" | "md" | "lg";

export interface StatCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  trend?: StatCardTrend;
  trendValue?: string;
  icon?: React.ReactNode;
  description?: string;
  size?: StatCardSize;
  loading?: boolean;
  testId?: string;
  className?: string;
}

