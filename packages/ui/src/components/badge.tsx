// packages/ui/src/components/badge.tsx
import * as React from "react";
import { componentTokens } from "../design/tokens";

export type BadgeVariant = "primary" | "muted";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    const base =
      variant === "muted"
        ? componentTokens.badgeMuted
        : componentTokens.badgePrimary;

    return (
      <span
        ref={ref}
        className={`${base} ${className ?? ""}`}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";

