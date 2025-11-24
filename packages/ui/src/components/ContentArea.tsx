// packages/ui/src/components/ContentArea.tsx
// Base ContentArea component - token-compliant, accessible, MCP-ready

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
} from "../design/tokens";
import { cn } from "../lib/cn";

export interface ContentAreaProps {
  /** Content layout variant */
  variant?: "full" | "boxed" | "narrow";
  /** Maximum width for boxed/narrow variants */
  maxWidth?: string;
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Whether content area has elevated background */
  elevated?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Main content */
  children?: React.ReactNode;
}

/**
 * ContentArea component
 *
 * A token-compliant content container that works with:
 * - Safe Mode (`[data-safe-mode="true"]`)
 * - Dark Mode (`.dark` class)
 * - WCAG contrast modes (`data-contrast="aa"` / `data-contrast="aaa"`)
 * - Tenant theming (via CSS variable overrides)
 *
 * All styling uses semantic tokens from the design system.
 */
export function ContentArea({
  variant = "full",
  maxWidth = "80rem",
  padding = "md",
  elevated = false,
  className,
  children,
}: ContentAreaProps) {
  const paddingClasses = {
    none: "",
    sm: spacingTokens.sm,
    md: spacingTokens.md,
    lg: spacingTokens.lg,
  };

  const maxWidthClasses = {
    full: "max-w-full",
    boxed: `max-w-[var(--content-max-width,${maxWidth})]`,
    narrow: `max-w-[var(--content-max-width,${maxWidth})]`,
  };

  return (
    <main
      id="content-area"
      role="main"
      className={cn(
        "flex flex-auto flex-col",
        variant !== "full" && "container mx-auto",
        maxWidthClasses[variant],
        paddingClasses[padding],
        elevated && colorTokens.surface.elevated,
        elevated && shadowTokens.sm,
        elevated && radiusTokens.lg,
        className
      )}
    >
      {children}
    </main>
  );
}

