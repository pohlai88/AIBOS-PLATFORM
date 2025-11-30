/**
 * NotificationCenter Component - Layer 3 Functional Component
 * @module NotificationCenter
 * @layer 3
 * @category business-widgets
 */

"use client";

import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { NotificationCenterProps, Notification, NotificationType } from "./notification-center.types";

const notificationVariants = {
  base: ["w-full max-w-md", "mcp-functional-component"].join(" "),
  item: [
    "flex gap-3 p-3",
    radiusTokens.md,
    "transition-colors",
    "hover:bg-muted/50",
  ].join(" "),
};

const typeIcons: Record<NotificationType, React.ElementType> = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationCircleIcon,
  error: XCircleIcon,
};

const typeColors: Record<NotificationType, string> = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
  maxVisible = 10,
  emptyMessage = "No notifications",
  testId,
  className,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <div
      role="region"
      aria-label="Notification center"
      className={cn(notificationVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between p-3 border-b", colorTokens.border)}>
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          <span className="font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {onMarkAllAsRead && unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className={cn("text-xs", colorTokens.fgMuted, "hover:underline")}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div role="list" aria-label="Notifications list" className="max-h-96 overflow-y-auto">
        {visibleNotifications.length === 0 ? (
          <div className={cn("p-6 text-center", colorTokens.fgMuted)}>{emptyMessage}</div>
        ) : (
          visibleNotifications.map((notification) => {
            const Icon = typeIcons[notification.type];
            return (
              <div
                key={notification.id}
                role="listitem"
                className={cn(
                  notificationVariants.item,
                  !notification.read && "bg-muted/30"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", typeColors[notification.type])} />
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => !notification.read && onMarkAsRead?.(notification.id)}
                >
                  <p className={cn("font-medium text-sm", colorTokens.fg)}>{notification.title}</p>
                  {notification.message && (
                    <p className={cn("text-xs mt-0.5", colorTokens.fgMuted)}>{notification.message}</p>
                  )}
                  <p className={cn("text-xs mt-1", colorTokens.fgMuted)}>
                    {formatTime(notification.timestamp)}
                  </p>
                  {notification.action && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        notification.action?.onClick();
                      }}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      {notification.action.label}
                    </button>
                  )}
                </button>
                {onDismiss && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notification.id);
                    }}
                    aria-label={`Dismiss notification: ${notification.title}`}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {onClearAll && notifications.length > 0 && (
        <div className={cn("p-2 border-t text-center", colorTokens.border)}>
          <button
            type="button"
            onClick={onClearAll}
            className={cn("text-xs", colorTokens.fgMuted, "hover:underline")}
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
}

NotificationCenter.displayName = "NotificationCenter";

export { notificationVariants };
export type { NotificationCenterProps, Notification, NotificationType } from "./notification-center.types";
export default NotificationCenter;

