/**
 * Badge Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  testId?: string;
  className?: string;
}

