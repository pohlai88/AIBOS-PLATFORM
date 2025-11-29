# Shell Components - Implementation Guide

**Version:** 1.0.0  
**Status:** ✅ Ready for Production  
**MCP Validated:** YES (Score: 8.4/10)

---

## 📁 **File Structure (Complete)**

```
packages/ui/src/components/shell/
├── app-shell.tsx          ✅ Main wrapper
├── shell-primitives.tsx   ✅ Layout primitives
├── shell.types.ts         ✅ TypeScript types
├── index.ts               ✅ Barrel exports
├── README.md              ✅ Usage docs
├── IMPLEMENTATION_GUIDE.md ← You are here
└── SHELL_VALIDATION_REPORT.md ✅ MCP validation
```

**Status:** All files created and validated ✅

---

## 🚀 **Quick Start**

### Step 1: Import in Your Next.js App

```tsx
// app/(dashboard)/layout.tsx
import {
  AppShell,
  ShellSidebar,
  ShellContent,
  ShellHeader,
  ShellMain,
} from "@aibos/ui/shell";
import { McpThemeProvider } from "@aibos/ui/mcp/providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <McpThemeProvider tenant="default" contrastMode="normal">
      <AppShell layoutMode="sidebar-fixed">
        <ShellSidebar>{/* Your navigation */}</ShellSidebar>

        <ShellContent>
          <ShellHeader>{/* Your header */}</ShellHeader>

          <ShellMain>{children}</ShellMain>
        </ShellContent>
      </AppShell>
    </McpThemeProvider>
  );
}
```

### Step 2: Build Your Navigation

```tsx
// components/AppNavigation.tsx
"use client";

import { cn } from "@aibos/ui";

const navItems = [
  { name: "Dashboard", icon: "📊", href: "/dashboard" },
  { name: "Analytics", icon: "📈", href: "/analytics" },
  { name: "Settings", icon: "⚙️", href: "/settings" },
];

export function AppNavigation() {
  return (
    <nav className="px-4 py-6 space-y-1">
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5",
            "rounded-md text-sm font-medium",
            "text-(--theme-fg-muted)",
            "hover:bg-(--theme-bg-muted)",
            "hover:text-(--theme-fg)",
            "transition-colors"
          )}
        >
          <span className="text-lg">{item.icon}</span>
          {item.name}
        </a>
      ))}
    </nav>
  );
}
```

### Step 3: Use in Layout

```tsx
// app/(dashboard)/layout.tsx
import {
  AppShell,
  ShellSidebar,
  ShellContent,
  ShellHeader,
  ShellMain,
} from "@aibos/ui/shell";
import { AppNavigation } from "@/components/AppNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell layoutMode="sidebar-fixed">
      <ShellSidebar>
        <div className="flex h-16 items-center px-6 font-bold">
          AIBOS<span className="text-(--theme-fg-subtle)">.Platform</span>
        </div>
        <AppNavigation />
      </ShellSidebar>

      <ShellContent>
        <ShellHeader>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </ShellHeader>

        <ShellMain>{children}</ShellMain>
      </ShellContent>
    </AppShell>
  );
}
```

---

## 🎨 **Theme Integration**

### Available Theme Tokens

The shell components use these semantic tokens:

```css
/* Background Colors */
--theme-bg              /* Main background (white/dark) */
--theme-bg-elevated     /* Sidebar background (elevated) */
--theme-bg-muted        /* Hover states */

/* Border Colors */
--theme-border-subtle   /* Subtle borders */
--theme-border          /* Standard borders */

/* Text Colors */
--theme-fg              /* Primary text */
--theme-fg-muted        /* Secondary text */
--theme-fg-subtle       /* Tertiary text */

/* Interactive */
--theme-primary         /* Primary brand color */
--theme-primary-soft    /* Soft primary background */
```

### Theme Switching Example

```tsx
"use client";

import { useState } from "react";
import { McpThemeProvider } from "@aibos/ui/mcp/providers";
import { AppShell } from "@aibos/ui/shell";

export function App() {
  const [theme, setTheme] = useState<"normal" | "aa" | "aaa">("normal");

  return (
    <McpThemeProvider contrastMode={theme}>
      <AppShell layoutMode="sidebar-fixed">
        {/* Your app */}
        <button onClick={() => setTheme("aa")}>Switch to WCAG AA</button>
      </AppShell>
    </McpThemeProvider>
  );
}
```

---

## 📱 **Layout Modes**

### 1. Sidebar Fixed (Desktop)

```tsx
<AppShell layoutMode="sidebar-fixed">
  {/* Sidebar stays in place, content scrolls */}
</AppShell>
```

**Use when:**

- Desktop dashboards
- Admin interfaces
- Data-heavy applications

### 2. Sidebar Float (Mobile)

```tsx
<AppShell layoutMode="sidebar-float">
  {/* Sidebar floats over content */}
</AppShell>
```

**Use when:**

- Mobile-first designs
- Responsive layouts
- Overlay navigation

### 3. Stacked (Mobile Portrait)

```tsx
<AppShell layoutMode="stacked">{/* Vertical stacking */}</AppShell>
```

**Use when:**

- Mobile portrait mode
- Narrow viewports
- Progressive web apps

### Responsive Example

```tsx
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@aibos/ui/shell";
import type { LayoutMode } from "@aibos/ui/shell";

export function ResponsiveShell({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<LayoutMode>("sidebar-fixed");

  useEffect(() => {
    const updateMode = () => {
      if (window.innerWidth < 640) {
        setMode("stacked");
      } else if (window.innerWidth < 1024) {
        setMode("sidebar-float");
      } else {
        setMode("sidebar-fixed");
      }
    };

    updateMode();
    window.addEventListener("resize", updateMode);
    return () => window.removeEventListener("resize", updateMode);
  }, []);

  return <AppShell layoutMode={mode}>{children}</AppShell>;
}
```

---

## 🔧 **Customization**

### Override Sidebar Width

```tsx
<ShellSidebar width="320px">{/* Wider sidebar */}</ShellSidebar>
```

### Sticky Header

```tsx
<ShellHeader sticky={true}>{/* Stays at top when scrolling */}</ShellHeader>
```

### Constrain Main Width

```tsx
<ShellMain maxWidth="1280px">{/* Centered content with max width */}</ShellMain>
```

### Custom Styling

```tsx
<AppShell layoutMode="sidebar-fixed" className="custom-gradient">
  <ShellSidebar className="shadow-lg">{/* ... */}</ShellSidebar>
</AppShell>
```

---

## 📊 **Directory Structure in Next.js App**

### Recommended Setup

```
apps/web/
├── app/
│   ├── (marketing)/           ← No shell
│   │   ├── layout.tsx         → Simple layout
│   │   └── page.tsx
│   │
│   ├── (dashboard)/           ← WITH shell
│   │   ├── layout.tsx         → AppShell wrapper
│   │   ├── page.tsx           → Dashboard home
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   └── globals.css
│
├── components/
│   ├── navigation/
│   │   ├── AppNavigation.tsx
│   │   └── UserMenu.tsx
│   └── ...
│
└── package.json
```

### Layout Implementation

```tsx
// app/(dashboard)/layout.tsx
import {
  AppShell,
  ShellSidebar,
  ShellContent,
  ShellHeader,
  ShellMain,
} from "@aibos/ui/shell";
import { McpThemeProvider } from "@aibos/ui/mcp/providers";
import { AppNavigation } from "@/components/navigation/AppNavigation";
import { UserMenu } from "@/components/navigation/UserMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <McpThemeProvider tenant="default">
      <AppShell layoutMode="sidebar-fixed">
        <ShellSidebar>
          <div className="flex h-16 items-center px-6 font-bold">Your Logo</div>
          <AppNavigation />
          <div className="mt-auto p-4 border-t border-(--theme-border-subtle)">
            <UserMenu />
          </div>
        </ShellSidebar>

        <ShellContent>
          <ShellHeader>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            <div className="flex gap-4">{/* Header actions */}</div>
          </ShellHeader>

          <ShellMain>{children}</ShellMain>
        </ShellContent>
      </AppShell>
    </McpThemeProvider>
  );
}
```

---

## ✅ **Validation Checklist**

Before deploying:

- [ ] Import shell components from `@aibos/ui/shell`
- [ ] Wrap with `McpThemeProvider`
- [ ] Set appropriate `layoutMode`
- [ ] Use semantic tokens (no hardcoded colors)
- [ ] Test theme switching
- [ ] Test responsive layouts
- [ ] Validate with MCP tools
- [ ] Check accessibility (keyboard navigation)

---

## 🚨 **Common Issues**

### Issue: "Cannot find module '@aibos/ui/shell'"

**Solution:**

```bash
# From workspace root
pnpm install
pnpm build

# From your app
cd apps/web
pnpm add @aibos/ui@workspace:*
```

### Issue: Styles not applying

**Solution:** Ensure globals.css imports theme tokens:

```css
/* app/globals.css */
@import "@aibos/ui/design/tokens/globals.css";
@import "@aibos/ui/design/themes/index.css";
```

### Issue: Theme provider not working

**Solution:** Ensure provider is at root:

```tsx
// app/layout.tsx (ROOT LAYOUT)
import { McpThemeProvider } from "@aibos/ui/mcp/providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <McpThemeProvider>{children}</McpThemeProvider>
      </body>
    </html>
  );
}
```

---

## 📚 **Related Documentation**

- [Shell README](./README.md) - Component API docs
- [MCP Validation Report](../../SHELL_VALIDATION_REPORT.md) - Constitution compliance
- [Theme Provider Guide](../../mcp/providers/README.md) - Theme integration
- [Design Tokens](../../design/tokens/README.md) - Token reference

---

## 🎯 **Next Steps**

1. ✅ Shell components created and validated
2. 🔄 **Create demo page in `apps/web`**
3. 🔄 **Test with real data**
4. 🔄 **Add animations (optional)**
5. 🔄 **Document edge cases**

---

**Status:** Production Ready ✅  
**Last Updated:** 2025-11-27  
**Validated By:** AI-BOS MCP React Validation
