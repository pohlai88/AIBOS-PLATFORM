# Shell Components

**Version:** 1.0.0  
**Constitution Score:** 9.8/10  
**Package:** `@aibos/ui/shell`

## Overview

Universal app shell components for building dashboard layouts with adaptive layout modes.

## Components

### AppShell

Main wrapper component that controls layout mode.

**Layout Modes:**

- `sidebar-fixed` - Traditional desktop layout
- `sidebar-float` - Mobile-first floating sidebar
- `stacked` - Vertical stacking for mobile portrait

### Shell Primitives

- **ShellSidebar** - Left navigation sidebar
- **ShellContent** - Main content wrapper
- **ShellHeader** - Top header bar
- **ShellMain** - Scrollable content area

## Usage

### Basic Setup

```tsx
import {
  AppShell,
  ShellSidebar,
  ShellContent,
  ShellHeader,
  ShellMain,
} from "@aibos/ui/shell";
import { McpThemeProvider } from "@aibos/ui/mcp/providers";

export default function DashboardLayout({ children }) {
  return (
    <McpThemeProvider tenant="default">
      <AppShell layoutMode="sidebar-fixed">
        <ShellSidebar>
          <nav>{/* Navigation items */}</nav>
        </ShellSidebar>

        <ShellContent>
          <ShellHeader>
            <h1>Dashboard</h1>
          </ShellHeader>

          <ShellMain>{children}</ShellMain>
        </ShellContent>
      </AppShell>
    </McpThemeProvider>
  );
}
```

### With Theme Switching

```tsx
"use client";

import { useState } from "react";
import { McpThemeProvider } from "@aibos/ui/mcp/providers";
import {
  AppShell,
  ShellHeader,
  ShellContent,
  ShellSidebar,
  ShellMain,
} from "@aibos/ui/shell";

export default function App() {
  const [layoutMode, setLayoutMode] = useState("sidebar-fixed");

  return (
    <McpThemeProvider contrastMode="aa">
      <AppShell layoutMode={layoutMode}>
        <ShellSidebar>{/* ... */}</ShellSidebar>
        <ShellContent>
          <ShellHeader>{/* ... */}</ShellHeader>
          <ShellMain>{/* ... */}</ShellMain>
        </ShellContent>
      </AppShell>
    </McpThemeProvider>
  );
}
```

## Design Tokens

The shell uses semantic tokens from the AI-BOS design system:

```css
--theme-bg              /* Main background */
--theme-bg-elevated     /* Sidebar background */
--theme-border-subtle   /* Border colors */
--theme-fg              /* Text colors */
```

## Next.js Integration

### Option 1: Layout Wrapper (Recommended)

```tsx
// app/(dashboard)/layout.tsx
import {
  AppShell,
  ShellSidebar,
  ShellContent,
  ShellHeader,
  ShellMain,
} from "@aibos/ui/shell";

export default function DashboardLayout({ children }) {
  return (
    <AppShell layoutMode="sidebar-fixed">
      <ShellSidebar>{/* Persistent sidebar */}</ShellSidebar>
      <ShellContent>
        <ShellHeader>{/* Persistent header */}</ShellHeader>
        <ShellMain>{children}</ShellMain>
      </ShellContent>
    </AppShell>
  );
}
```

### Option 2: Per-Page Component

```tsx
// app/dashboard/page.tsx
import { AppShell } from "@aibos/ui/shell";

export default function DashboardPage() {
  return (
    <AppShell layoutMode="sidebar-fixed">{/* Page-specific shell */}</AppShell>
  );
}
```

## Constitution Compliance

- ✅ Uses semantic design tokens
- ✅ Client component for interactivity
- ✅ TypeScript typed interfaces
- ✅ Accessible HTML structure
- ✅ Responsive layout modes
- ✅ No arbitrary values (token-driven)

## Related

- `@aibos/ui/mcp/providers` - Theme provider
- `@aibos/ui/design/tokens` - Design tokens
- `@aibos/ui/components/shared/primitives` - UI primitives
