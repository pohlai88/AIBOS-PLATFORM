/**
 * Badge Component - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { BadgeProps, BadgeVariant, BadgeSize } from "./badge.types";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  outline: "border border-current bg-transparent",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-0.5 text-sm",
  lg: "px-2.5 py-1 text-sm",
};

const badgeVariants = {
  base: ["inline-flex items-center gap-1 font-medium", radiusTokens.full, "mcp-functional-component"].join(" "),
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot,
  removable,
  onRemove,
  testId,
  className,
}: BadgeProps) {
  return (
    <span
      role="status"
      className={cn(badgeVariants.base, variantClasses[variant], sizeClasses[size], className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
      {removable && onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove" className="ml-0.5 hover:opacity-70">
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

Badge.displayName = "Badge";
export { badgeVariants };
export type { BadgeProps, BadgeVariant, BadgeSize } from "./badge.types";
export default Badge;

