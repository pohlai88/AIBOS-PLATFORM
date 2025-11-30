// packages/ui/src/components/shell/shell.types.ts
// Shell Component Types - AI-BOS Platform
// Version: 1.0.0

import { ReactNode } from "react";

/**
 * Layout modes for AppShell
 * - sidebar-fixed: Traditional fixed sidebar (desktop dashboards)
 * - sidebar-float: Floating sidebar over content (mobile-first)
 * - stacked: Vertical stacking (mobile portrait)
 */
export type LayoutMode = "sidebar-fixed" | "sidebar-float" | "stacked";

/**
 * Props for AppShell wrapper component
 */
export interface AppShellProps {
  /** Layout mode controls shell structure */
  layoutMode?: LayoutMode;
  /** Child components (ShellSidebar + ShellContent) */
  children: ReactNode;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Props for ShellSidebar component
 */
export interface ShellSidebarProps {
  /** Sidebar content (navigation, user profile, etc.) */
  children: ReactNode;
  /** Optional className for custom styling */
  className?: string;
  /** Optional width override (uses token by default) */
  width?: string;
}

/**
 * Props for ShellContent wrapper
 */
export interface ShellContentProps {
  /** Content children (ShellHeader + ShellMain) */
  children: ReactNode;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Props for ShellHeader component
 */
export interface ShellHeaderProps {
  /** Header content (title, actions, breadcrumbs, etc.) */
  children: ReactNode;
  /** Optional className for custom styling */
  className?: string;
  /** Optional sticky positioning */
  sticky?: boolean;
}

/**
 * Props for ShellMain component
 */
export interface ShellMainProps {
  /** Main content area */
  children: ReactNode;
  /** Optional className for custom styling */
  className?: string;
  /** Optional max-width constraint */
  maxWidth?: string;
}

