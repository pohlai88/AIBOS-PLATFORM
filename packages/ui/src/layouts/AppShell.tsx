// packages/ui/src/layouts/AppShell.tsx
// Default App Shell layout - token-compliant, accessible, MCP-ready
// Composes Sidebar, Header, ContentArea, Navigation, and UserMenu primitives

"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { ContentArea } from "../components/ContentArea";
import { Navigation, NavigationItem } from "../components/Navigation";
import { UserMenu, UserMenuItem } from "../components/UserMenu";
import { Button } from "../components/button";
import { cn } from "../lib/cn";
import { colorTokens } from "../design/tokens";

export interface AppShellProps {
  /** Brand name to display in sidebar and header */
  brandName?: string;
  /** Brand logo/icon component (optional) */
  brandIcon?: ReactNode;
  /** Navigation items for sidebar */
  navItems?: NavigationItem[];
  /** User menu items */
  userMenuItems?: UserMenuItem[];
  /** User information for user menu */
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    avatarFallback?: string;
  };
  /** Header actions (e.g., search, notifications) */
  headerActions?: ReactNode;
  /** Sidebar width (default: 16rem) */
  sidebarWidth?: string;
  /** Whether sidebar starts open on desktop (default: true) */
  defaultSidebarOpen?: boolean;
  /** Content area variant */
  contentVariant?: "full" | "boxed" | "narrow";
  /** Content area padding */
  contentPadding?: "none" | "sm" | "md" | "lg";
  /** Whether header is sticky */
  stickyHeader?: boolean;
  /** Additional CSS classes for root container */
  className?: string;
  /** Main page content */
  children: ReactNode;
}

/**
 * AppShell component
 *
 * A complete application shell that combines:
 * - Sidebar (left, collapsible)
 * - Header (top, with brand, navigation, actions, user menu)
 * - ContentArea (main content area)
 *
 * Features:
 * - Responsive: Sidebar becomes drawer on mobile
 * - Token-compliant: All styling via design tokens
 * - Accessible: Full keyboard navigation and ARIA support
 * - Safe Mode compatible: Works with `[data-safe-mode="true"]`
 * - Dark mode compatible: Works with `.dark` class
 * - WCAG contrast modes: Works with `data-contrast="aa"` / `data-contrast="aaa"`
 *
 * All styling uses semantic tokens from the design system.
 */
export function AppShell({
  brandName = "AI-BOS",
  brandIcon,
  navItems = [],
  userMenuItems = [],
  user,
  headerActions,
  sidebarWidth = "16rem",
  defaultSidebarOpen = true,
  contentVariant = "full",
  contentPadding = "md",
  stickyHeader = false,
  className,
  children,
}: AppShellProps) {
  // Sidebar state management
  const [desktopSidebarOpen, setDesktopSidebarOpen] =
    useState(defaultSidebarOpen);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Build Navigation component from items
  const navigation =
    navItems.length > 0 ? (
      <Navigation items={navItems} orientation="vertical" />
    ) : undefined;

  // Build UserMenu component
  const userMenu =
    user || userMenuItems.length > 0 ? (
      <UserMenu
        userName={user?.name}
        userEmail={user?.email}
        userAvatar={user?.avatar}
        userAvatarFallback={user?.avatarFallback}
        items={userMenuItems}
      />
    ) : undefined;

  // Mobile menu button (hamburger) to open sidebar
  const mobileMenuButton = (
    <Button
      variant="ghost"
      onClick={() => setMobileSidebarOpen(true)}
      className={cn("lg:hidden")}
      aria-label="Open navigation menu"
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
          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          clipRule="evenodd"
        />
      </svg>
    </Button>
  );

  // Combine header actions with mobile menu button
  const headerActionsWithMobile = (
    <>
      {mobileMenuButton}
      {headerActions}
    </>
  );

  return (
    <div
      className={cn(
        "flex min-h-screen w-full flex-col",
        colorTokens.surface.default,
        colorTokens.text.default,
        className
      )}
    >
      {/* Sidebar */}
      <Sidebar
        brandName={brandName}
        brandIcon={brandIcon}
        navigation={navigation}
        userMenu={userMenu}
        width={sidebarWidth}
        desktopOpen={desktopSidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onDesktopToggle={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
      />

      {/* Main content area (header + content) */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          "transition-all duration-300 ease-out",
          desktopSidebarOpen
            ? `lg:ml-[var(--sidebar-width,${sidebarWidth})]`
            : "lg:ml-0"
        )}
      >
        {/* Header */}
        <Header
          brandName={brandName}
          brandIcon={brandIcon}
          userMenu={userMenu}
          actions={headerActionsWithMobile}
          sticky={stickyHeader}
        />

        {/* Content Area */}
        <main
          id="main-content"
          role="main"
          aria-label={`${brandName} main content`}
          className={cn("flex-1")}
        >
          <ContentArea variant={contentVariant} padding={contentPadding}>
            {children}
          </ContentArea>
        </main>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {/* TODO Phase-2: Replace bg-black/50 with colorTokens.overlay.scrim when token is added */}
      {mobileSidebarOpen && (
        <div
          className={cn("fixed inset-0 z-40", "bg-black/50", "lg:hidden")}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
