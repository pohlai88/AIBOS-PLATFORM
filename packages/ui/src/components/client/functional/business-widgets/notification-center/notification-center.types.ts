/**
 * NotificationCenter Types - Layer 3 Functional Component
 * @module NotificationCenterTypes
 * @layer 3
 * @category business-widgets
 */

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read?: boolean;
  action?: { label: string; onClick: () => void };
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: string) => void;
  onClearAll?: () => void;
  maxVisible?: number;
  emptyMessage?: string;
  testId?: string;
  className?: string;
}

