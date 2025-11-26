/**
 * Avatar Component - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { AvatarProps, AvatarGroupProps, AvatarSize, AvatarStatus } from "./avatar.types";

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

const statusColors: Record<AvatarStatus, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
};

const avatarVariants = {
  base: ["relative inline-flex items-center justify-center rounded-full overflow-hidden", colorTokens.bgMuted, "mcp-functional-component"].join(" "),
  status: ["absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white"].join(" "),
};

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  fallback,
  testId,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      role="img"
      aria-label={alt || name || "Avatar"}
      className={cn(avatarVariants.base, sizeClasses[size], className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {src && !imgError ? (
        <img src={src} alt={alt || name || ""} className="h-full w-full object-cover" onError={() => setImgError(true)} />
      ) : fallback ? (
        fallback
      ) : (
        <span className={cn("font-medium", colorTokens.fg)}>{initials || "?"}</span>
      )}
      {status && <span className={cn(avatarVariants.status, statusColors[status])} aria-label={status} />}
    </div>
  );
}

export function AvatarGroup({ avatars, max = 4, size = "md", testId, className }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div role="group" aria-label="Avatar group" className={cn("flex -space-x-2", className)} data-testid={testId}>
      {visible.map((avatar, i) => (
        <Avatar key={i} {...avatar} size={size} className="ring-2 ring-white" />
      ))}
      {remaining > 0 && (
        <div className={cn(avatarVariants.base, sizeClasses[size], "ring-2 ring-white", colorTokens.bgMuted)}>
          <span className={cn("text-xs font-medium", colorTokens.fg)}>+{remaining}</span>
        </div>
      )}
    </div>
  );
}

Avatar.displayName = "Avatar";
AvatarGroup.displayName = "AvatarGroup";
export { avatarVariants };
export type { AvatarProps, AvatarGroupProps, AvatarSize, AvatarStatus } from "./avatar.types";
export default Avatar;

