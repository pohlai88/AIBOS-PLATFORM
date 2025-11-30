/**
 * Timeline Types - Layer 3 Functional Component
 * @module TimelineTypes
 * @layer 3
 * @category workflow
 */

export type TimelineSize = "sm" | "md" | "lg";
export type TimelineVariant = "default" | "alternating" | "compact";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string | Date;
  icon?: React.ReactNode;
  status?: "pending" | "active" | "completed" | "error";
  metadata?: Record<string, string>;
}

export interface TimelineProps {
  items: TimelineItem[];
  size?: TimelineSize;
  variant?: TimelineVariant;
  showConnector?: boolean;
  testId?: string;
  className?: string;
}

