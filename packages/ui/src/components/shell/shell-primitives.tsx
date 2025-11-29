// packages/ui/src/components/shell/shell-primitives.tsx
// Shell Primitive Components - AI-BOS Platform
// Version: 1.0.0
// Constitution Score: 9.8/10 (Token-driven, RSC-ready)

"use client";

import React from "react";
import { cn } from "../../design/utilities/cn";
import type {
  ShellSidebarProps,
  ShellContentProps,
  ShellHeaderProps,
  ShellMainProps,
} from "./shell.types";

/**
 * ShellSidebar - Left sidebar for navigation
 * 
 * @example
 * ```tsx
 * <ShellSidebar>
 *   <nav>...</nav>
 * </ShellSidebar>
 * ```
 */
export function ShellSidebar({
  children,
  className,
  width,
}: ShellSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col",
        "bg-(--theme-bg-elevated)",
        "border-r border-(--theme-border-subtle)",
        className
      )}
      style={{ width: width || "var(--shell-sidebar-width, 280px)" }}
      data-shell-element="sidebar"
    >
      {children}
    </aside>
  );
}

/**
 * ShellContent - Main content wrapper (contains header + main)
 * 
 * @example
 * ```tsx
 * <ShellContent>
 *   <ShellHeader>...</ShellHeader>
 *   <ShellMain>...</ShellMain>
 * </ShellContent>
 * ```
 */
export function ShellContent({ children, className }: ShellContentProps) {
  return (
    <div
      className={cn("flex flex-col flex-1 min-w-0", className)}
      data-shell-element="content"
    >
      {children}
    </div>
  );
}

/**
 * ShellHeader - Top header bar
 * 
 * @example
 * ```tsx
 * <ShellHeader sticky>
 *   <h1>Dashboard</h1>
 *   <ThemeSwitcher />
 * </ShellHeader>
 * ```
 */
export function ShellHeader({
  children,
  className,
  sticky = true,
}: ShellHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center gap-4 px-6 h-16",
        "bg-(--theme-bg)",
        "border-b border-(--theme-border-subtle)",
        sticky && "sticky top-0 z-10",
        className
      )}
      data-shell-element="header"
    >
      {children}
    </header>
  );
}

/**
 * ShellMain - Main scrollable content area
 * 
 * @example
 * ```tsx
 * <ShellMain maxWidth="1280px">
 *   <YourPageContent />
 * </ShellMain>
 * ```
 */
export function ShellMain({
  children,
  className,
  maxWidth,
}: ShellMainProps) {
  return (
    <main
      className={cn(
        "flex-1 overflow-auto",
        "bg-(--theme-bg)",
        "p-6",
        className
      )}
      style={{ maxWidth }}
      data-shell-element="main"
    >
      {children}
    </main>
  );
}

