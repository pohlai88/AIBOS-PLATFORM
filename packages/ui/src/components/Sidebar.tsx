// packages/ui/src/components/Sidebar.tsx
// Base Sidebar component - token-compliant, accessible, MCP-ready

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  typographyTokens,
  componentTokens,
} from "../design/tokens";
import { cn } from "../lib/cn";

export interface SidebarProps {
  /** Brand name or logo to display in sidebar header */
  brandName?: string;
  /** Brand logo/icon component (optional) */
  brandIcon?: React.ReactNode;
  /** Navigation items to render in sidebar */
  navigation?: React.ReactNode;
  /** User menu component (optional) */
  userMenu?: React.ReactNode;
  /** Sidebar width (default: 16rem) */
  width?: string;
  /** Whether sidebar is open on desktop (default: true) */
  desktopOpen?: boolean;
  /** Whether sidebar is open on mobile (default: false) */
  mobileOpen?: boolean;
  /** Callback when mobile sidebar should close */
  onMobileClose?: () => void;
  /** Callback when desktop sidebar toggle is clicked */
  onDesktopToggle?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Sidebar content (footer, etc.) */
  children?: React.ReactNode;
}

/**
 * Sidebar component
 *
 * A token-compliant, accessible sidebar that works with:
 * - Safe Mode (`[data-safe-mode="true"]`)
 * - Dark Mode (`.dark` class)
 * - WCAG contrast modes (`data-contrast="aa"` / `data-contrast="aaa"`)
 * - Tenant theming (via CSS variable overrides)
 *
 * All styling uses semantic tokens from the design system.
 */
export function Sidebar({
  brandName = "Brand",
  brandIcon,
  navigation,
  userMenu,
  width = "16rem",
  desktopOpen = true,
  mobileOpen = false,
  onMobileClose,
  onDesktopToggle,
  className,
  children,
}: SidebarProps) {
  return (
    <nav
      id="sidebar"
      aria-label="Main Sidebar Navigation"
      style={{ width: `var(--sidebar-width, ${width})` }}
      className={cn(
        "fixed top-0 bottom-0 left-0 z-50 flex h-full w-full flex-col",
        "border-r border-border-subtle",
        colorTokens.surface.muted, // "bg-bg-muted"
        colorTokens.text.muted, // "text-fg-muted"
        "transition-transform duration-300 ease-out",
        `lg:w-[var(--sidebar-width,${width})]`,
        desktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      {/* Sidebar Header */}
      <div
        className={cn(
          "flex h-16 w-full flex-none items-center justify-between",
          colorTokens.surface.muted,
          spacingTokens.md,
          "lg:justify-center"
        )}
      >
        {/* Brand */}
        <a
          href="#"
          className={cn(
            "group inline-flex items-center gap-2",
            typographyTokens.title,
            colorTokens.text.default,
            "hover:text-fg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label={`${brandName} home`}
        >
          {brandIcon || (
            <svg
              className="size-5 text-primary transition group-hover:scale-110"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.638 1.093a.75.75 0 01.724 0l2 1.104a.75.75 0 11-.724 1.313L10 2.607l-1.638.903a.75.75 0 11-.724-1.313l2-1.104zM5.403 4.287a.75.75 0 01-.295 1.019l-.805.444.805.444a.75.75 0 01-.724 1.314L3.5 7.02v.73a.75.75 0 01-1.5 0v-2a.75.75 0 01.388-.657l1.996-1.1a.75.75 0 011.019.294zm9.194 0a.75.75 0 011.02-.295l1.995 1.101A.75.75 0 0118 5.75v2a.75.75 0 01-1.5 0v-.73l-.884.488a.75.75 0 11-.724-1.314l.806-.444-.806-.444a.75.75 0 01-.295-1.02zM7.343 8.284a.75.75 0 011.02-.294L10 8.893l1.638-.903a.75.75 0 11.724 1.313l-1.612.89v1.557a.75.75 0 01-1.5 0v-1.557l-1.612-.89a.75.75 0 01-.295-1.019zM2.75 11.5a.75.75 0 01.75.75v1.557l1.608.887a.75.75 0 01-.724 1.314l-1.996-1.101A.75.75 0 012 14.25v-2a.75.75 0 01.75-.75zm14.5 0a.75.75 0 01.75.75v2a.75.75 0 01-.388.657l-1.996 1.1a.75.75 0 11-.724-1.313l1.608-.887V12.25a.75.75 0 01.75-.75zm-7.25 4a.75.75 0 01.75.75v.73l.888-.49a.75.75 0 01.724 1.313l-2 1.104a.75.75 0 01-.724 0l-2-1.104a.75.75 0 11.724-1.313l.888.49v-.73a.75.75 0 01.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>{brandName}</span>
        </a>

        {/* Close Sidebar on Mobile */}
        {onMobileClose && (
          <div className="lg:hidden">
            <button
              onClick={onMobileClose}
              type="button"
              className={cn(
                "inline-flex items-center justify-center gap-2",
                radiusTokens.lg,
                "border border-border-subtle",
                colorTokens.surface.muted,
                spacingTokens.sm,
                typographyTokens.bodySm,
                "font-semibold",
                colorTokens.text.muted,
                "hover:border-border hover:text-fg",
                shadowTokens.xs,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "active:border-border active:shadow-none"
              )}
              aria-label="Close sidebar"
            >
              <svg
                className="size-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}

        {/* Desktop Toggle */}
        {onDesktopToggle && (
          <div className="hidden lg:block">
            <button
              onClick={onDesktopToggle}
              type="button"
              className={cn(
                "inline-flex items-center justify-center",
                radiusTokens.md,
                spacingTokens.sm,
                colorTokens.text.muted,
                "hover:text-fg",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={desktopOpen}
            >
              <svg
                className="size-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Navigation */}
      {navigation && (
        <div className="flex-1 overflow-y-auto">
          <div className={cn("w-full", spacingTokens.lg)}>{navigation}</div>
        </div>
      )}

      {/* Sidebar Footer / User Menu */}
      {(userMenu || children) && (
        <div
          className={cn(
            "flex-none border-t border-border-subtle",
            colorTokens.surface.muted,
            spacingTokens.md
          )}
        >
          {userMenu}
          {children}
        </div>
      )}
    </nav>
  );
}
