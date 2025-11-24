// packages/ui/src/components/Navigation.tsx
// Base Navigation component - token-compliant, accessible, MCP-ready

import {
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
  accessibilityTokens,
} from "../design/tokens";
import { cn } from "../lib/cn";

export interface NavigationItem {
  /** Item label */
  label: string;
  /** Item href or action */
  href?: string;
  /** Item icon (optional) */
  icon?: React.ReactNode;
  /** Whether item is active/current */
  active?: boolean;
  /** Badge/count to display (optional) */
  badge?: string | number;
  /** Sub-navigation items (optional) */
  children?: NavigationItem[];
  /** Click handler (if href is not provided) */
  onClick?: () => void;
}

export interface NavigationProps {
  /** Navigation items */
  items: NavigationItem[];
  /** Navigation orientation */
  orientation?: "vertical" | "horizontal";
  /** Whether to show section labels */
  showSections?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation component
 *
 * A token-compliant, accessible navigation that works with:
 * - Safe Mode (`[data-safe-mode="true"]`)
 * - Dark Mode (`.dark` class)
 * - WCAG contrast modes (`data-contrast="aa"` / `data-contrast="aaa"`)
 * - Tenant theming (via CSS variable overrides)
 *
 * All styling uses semantic tokens from the design system.
 */
export function Navigation({
  items,
  orientation = "vertical",
  showSections = false,
  className,
}: NavigationProps) {
  const renderItem = (item: NavigationItem, index: number) => {
    const baseClasses = cn(
      "group flex items-center gap-2",
      radiusTokens.lg,
      "border border-transparent",
      spacingTokens.md,
      typographyTokens.bodySm,
      "font-medium",
      "transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    );

    const activeClasses = item.active
      ? cn(
          colorTokens.accent.primarySoftBg,
          accessibilityTokens.textOnPrimary
        )
      : cn(
          colorTokens.text.muted,
          "hover:bg-primary-soft hover:text-fg",
          "active:border-border"
        );

    const iconClasses = cn(
      "flex flex-none items-center",
      item.active ? colorTokens.text.default : colorTokens.text.subtle,
      "group-hover:text-fg-muted"
    );

    const content = (
      <>
        {item.icon && <span className={iconClasses}>{item.icon}</span>}
        <span className="grow py-2">{item.label}</span>
        {item.badge !== undefined && (
          <span
            className={cn(
              "inline-flex",
              radiusTokens.full,
              "border border-primary",
              "bg-primary-soft",
              "px-1.5 py-0.5",
              "text-xs leading-4 font-semibold",
              accessibilityTokens.textOnPrimary
            )}
          >
            {item.badge}
          </span>
        )}
      </>
    );

    const itemClasses = cn(baseClasses, activeClasses);

    if (item.href) {
      return (
        <a
          key={index}
          href={item.href}
          className={itemClasses}
          aria-current={item.active ? "page" : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        key={index}
        type="button"
        onClick={item.onClick}
        className={itemClasses}
        aria-current={item.active ? "page" : undefined}
      >
        {content}
      </button>
    );
  };

  const containerClasses = cn(
    orientation === "vertical" ? "space-y-1" : "flex flex-row gap-1",
    className
  );

  return (
    <nav
      aria-label="Main navigation"
      className={containerClasses}
      role={orientation === "horizontal" ? "menubar" : "navigation"}
    >
      {items.map((item, index) => renderItem(item, index))}
    </nav>
  );
}

