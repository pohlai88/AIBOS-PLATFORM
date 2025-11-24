// packages/ui/src/components/Header.tsx
// Base Header component - token-compliant, accessible, MCP-ready

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  typographyTokens,
} from "../design/tokens";
import { cn } from "../lib/cn";

export interface HeaderProps {
  /** Brand name or logo to display */
  brandName?: string;
  /** Brand logo/icon component (optional) */
  brandIcon?: React.ReactNode;
  /** Primary navigation items */
  navigation?: React.ReactNode;
  /** User menu component (optional) */
  userMenu?: React.ReactNode;
  /** Action buttons (e.g., search, notifications) */
  actions?: React.ReactNode;
  /** Header height (default: 4rem / 64px) */
  height?: string;
  /** Whether header is sticky (default: false) */
  sticky?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Header content (custom) */
  children?: React.ReactNode;
}

/**
 * Header component
 *
 * A token-compliant, accessible header that works with:
 * - Safe Mode (`[data-safe-mode="true"]`)
 * - Dark Mode (`.dark` class)
 * - WCAG contrast modes (`data-contrast="aa"` / `data-contrast="aaa"`)
 * - Tenant theming (via CSS variable overrides)
 *
 * All styling uses semantic tokens from the design system.
 */
export function Header({
  brandName = "Brand",
  brandIcon,
  navigation,
  userMenu,
  actions,
  height = "4rem",
  sticky = false,
  className,
  children,
}: HeaderProps) {
  return (
    <header
      id="header"
      role="banner"
      style={{ height: `var(--header-height, ${height})` }}
      className={cn(
        "flex w-full flex-none items-center justify-between",
        "border-b border-border-subtle",
        colorTokens.surface.elevated,
        colorTokens.text.default,
        shadowTokens.sm,
        sticky && "sticky top-0 z-40",
        spacingTokens.md
      )}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-4">
        {brandIcon && (
          <a
            href="#"
            className={cn(
              "inline-flex items-center gap-2",
              typographyTokens.title,
              colorTokens.text.default,
              "hover:text-fg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label={`${brandName} home`}
          >
            {brandIcon}
            <span>{brandName}</span>
          </a>
        )}

        {/* Navigation */}
        {navigation && (
          <nav aria-label="Main navigation" className="hidden lg:flex">
            {navigation}
          </nav>
        )}
      </div>

      {/* Right: Actions + User Menu */}
      <div className="flex items-center gap-2">
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        {userMenu && <div>{userMenu}</div>}
      </div>

      {/* Custom Content */}
      {children}
    </header>
  );
}

