# Apps Quick Fix Guide - Immediate Actions

**⏱️ Total Time:** 1 hour  
**🎯 Impact:** High  
**🔥 Priority:** CRITICAL

---

## 🚀 **Step-by-Step Implementation**

### ✅ **Step 1: Fix Port Conflicts** (15 minutes)

**Problem:** Both `docs` and `day.tsx` use port 3001

**Solution:**

```bash
# Navigate to docs app
cd D:\AIBOS-PLATFORM\apps\docs
```

**Edit `package.json`:**

```json
{
  "scripts": {
    "build": "pnpm sync-docs && next build",
    "dev": "pnpm sync-docs && next dev -p 3002",      // ← CHANGE: 3001 → 3002
    "lint": "eslint . --config ../../eslint.config.mjs",
    "start": "next start -p 3002",                   // ← CHANGE: 3001 → 3002
    "sync-docs": "tsx scripts/sync-docs.ts"
  }
}
```

**Verify:**
```bash
# Test that all apps start without conflict
cd D:\AIBOS-PLATFORM
pnpm dev
# Should see:
# - web: http://localhost:3000
# - day.tsx (devtools): http://localhost:3001
# - docs: http://localhost:3002
```

---

### ✅ **Step 2: Rename `day.tsx` → `devtools`** (10 minutes)

**Problem:** Confusing app name

**Solution:**

```bash
cd D:\AIBOS-PLATFORM\apps

# Rename directory
git mv day.tsx devtools

# Or if not using git:
# mv day.tsx devtools
# (Windows PowerShell)
# Rename-Item -Path "day.tsx" -NewName "devtools"
```

**Update references in `turbo.json` (if any):**

No changes needed - turbo auto-discovers apps

**Update workspace references:**

Check `pnpm-workspace.yaml` (usually auto-detected):
```yaml
packages:
  - 'apps/*'      # ✅ This covers the renamed directory
  - 'packages/*'
```

**Verify:**
```bash
cd devtools
pnpm install
pnpm dev
# Should start on port 3001
```

---

### ✅ **Step 3: Add Theme Provider to Web App** (5 minutes)

**Problem:** Missing theme integration

**File:** `apps/web/app/layout.tsx`

**Current:**
```tsx
import type { Metadata } from "next";
import "@aibos/ui/design/globals.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-BOS Platform",
  description: "AI-BOS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**New:**
```tsx
import type { Metadata } from "next";
import "@aibos/ui/design/globals.css";
import "./globals.css";
import { McpThemeProvider } from "@aibos/ui/mcp/providers";

export const metadata: Metadata = {
  title: "AI-BOS Platform",
  description: "AI-BOS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <McpThemeProvider 
          tenant="default" 
          contrastMode="normal"
          enableDomAttributes
        >
          {children}
        </McpThemeProvider>
      </body>
    </html>
  );
}
```

**Verify:**
```bash
cd apps/web
pnpm dev
# Check browser console for theme initialization
```

---

### ✅ **Step 4: Integrate AppShell in DevTools** (30 minutes)

**Problem:** Inline styles violate design system

**File:** `apps/devtools/app/layout.tsx`

**Current (Inline Styles):**
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-BOS DevTools",
  description: "Kernel Diagnostics & Developer Tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <nav style={{ width: 220, background: "#1a1a2e", color: "#fff", padding: 20 }}>
            <h2 style={{ fontSize: 18, marginBottom: 24 }}>🔧 DevTools</h2>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: 2 }}>
              <li><a href="/" style={{ color: "#8be9fd" }}>Dashboard</a></li>
              <li><a href="/engines" style={{ color: "#8be9fd" }}>Engines</a></li>
              {/* ... more links ... */}
            </ul>
          </nav>
          <main style={{ flex: 1, padding: 32, background: "#0f0f23" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

**New (Token-Based with AppShell):**
```tsx
import type { Metadata } from "next";
import "@aibos/ui/design/globals.css";
import { McpThemeProvider } from "@aibos/ui/mcp/providers";
import { AppShell, ShellSidebar, ShellContent, ShellHeader, ShellMain } from "@aibos/ui/shell";
import { cn } from "@aibos/ui";

export const metadata: Metadata = {
  title: "AI-BOS DevTools",
  description: "Kernel Diagnostics & Developer Tools",
};

const navItems = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Engines", href: "/engines", icon: "⚙️" },
  { name: "Metadata", href: "/metadata", icon: "📋" },
  { name: "UI Schemas", href: "/ui-schema", icon: "🎨" },
  { name: "Actions", href: "/actions", icon: "⚡" },
  { name: "Events", href: "/events", icon: "📡" },
  { name: "Tenants", href: "/tenants", icon: "🏢" },
  { name: "Contracts", href: "/contracts", icon: "📝" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <McpThemeProvider tenant="default" contrastMode="normal">
          <AppShell layoutMode="sidebar-fixed">
            <ShellSidebar>
              {/* Logo/Title */}
              <div className="flex h-16 items-center px-6">
                <h2 className="text-lg font-bold text-(--theme-primary)">
                  🔧 DevTools
                </h2>
              </div>

              {/* Navigation */}
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
            </ShellSidebar>

            <ShellContent>
              <ShellHeader>
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-(--theme-fg)">
                    Developer Tools
                  </h1>
                </div>
                <div className="text-xs text-(--theme-fg-subtle) font-mono">
                  v1.0.0
                </div>
              </ShellHeader>

              <ShellMain>
                {children}
              </ShellMain>
            </ShellContent>
          </AppShell>
        </McpThemeProvider>
      </body>
    </html>
  );
}
```

**Add globals.css (if missing):**

```bash
# Create globals.css if it doesn't exist
touch apps/devtools/app/globals.css
```

**Edit `apps/devtools/app/globals.css`:**
```css
@import "@aibos/ui/design/tokens/globals.css";
@import "@aibos/ui/design/themes/index.css";
```

**Update `package.json` dependencies:**
```json
{
  "dependencies": {
    "@aibos/ui": "2.0.0",
    "next": "16.0.3",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

**Install dependencies:**
```bash
cd apps/devtools
pnpm install
pnpm dev
```

**Verify:**
- Navigate to http://localhost:3001
- Check that theme tokens are applied
- Verify sidebar navigation works
- Test responsive behavior

---

## 🧪 **Testing Checklist**

After applying all fixes:

### Port Conflicts
- [ ] Web app starts on port 3000
- [ ] DevTools starts on port 3001
- [ ] Docs starts on port 3002
- [ ] All three run simultaneously without errors

### Directory Structure
- [ ] `apps/day.tsx` renamed to `apps/devtools`
- [ ] All imports updated
- [ ] Turbo detects renamed app

### Theme Integration
- [ ] Web app shows theme tokens
- [ ] DevTools uses AppShell
- [ ] No inline styles in DevTools
- [ ] Theme switching works (if implemented)

### Navigation
- [ ] DevTools sidebar navigation works
- [ ] All routes accessible
- [ ] No console errors

---

## 📊 **Before vs After**

### Port Configuration

**Before:**
```
web:      localhost:3000 ✅
day.tsx:  localhost:3001 ✅
docs:     localhost:3001 ❌ CONFLICT!
```

**After:**
```
web:      localhost:3000 ✅
devtools: localhost:3001 ✅
docs:     localhost:3002 ✅ FIXED!
```

### Directory Structure

**Before:**
```
apps/
├── web/        ✅
├── day.tsx/    ❌ Unclear
└── docs/       ✅
```

**After:**
```
apps/
├── web/        ✅
├── devtools/   ✅ Clear!
└── docs/       ✅
```

### Theme Integration

**Before:**
```tsx
// web/app/layout.tsx
<body>{children}</body>  ❌ No theme
```

**After:**
```tsx
// web/app/layout.tsx
<McpThemeProvider>
  {children}
</McpThemeProvider>  ✅ Themed!
```

### DevTools UI

**Before:**
```tsx
<nav style={{ background: "#1a1a2e" }}>  ❌ Inline styles
```

**After:**
```tsx
<ShellSidebar className="bg-(--theme-bg-elevated)">  ✅ Tokens!
```

---

## 🚨 **Troubleshooting**

### Issue: "Cannot find module '@aibos/ui/shell'"

**Solution:**
```bash
cd D:\AIBOS-PLATFORM
pnpm build
cd apps/devtools
pnpm install
```

### Issue: Port still in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Kill all node processes (use with caution)
taskkill /IM node.exe /F
```

### Issue: Git mv not working

**Solution:**
```powershell
# PowerShell alternative
Rename-Item -Path "apps\day.tsx" -NewName "devtools"
```

### Issue: Theme tokens not applying

**Solution:**
```bash
# Ensure globals.css imports are correct
# apps/devtools/app/globals.css
@import "@aibos/ui/design/tokens/globals.css";
@import "@aibos/ui/design/themes/index.css";
```

---

## ✅ **Success Criteria**

You're done when:

1. ✅ All three apps start without port conflicts
2. ✅ DevTools has clear, descriptive name
3. ✅ Web app has theme provider
4. ✅ DevTools uses AppShell (no inline styles)
5. ✅ All navigation works
6. ✅ No console errors
7. ✅ Token-based styling throughout

---

## 📚 **Next Steps**

After completing quick fixes:

1. **Phase 2:** Restructure `apps/web` with route groups
2. **Phase 3:** Extract ERP modules
3. **Phase 4:** Implement multi-tenant routing

See `APPS_ARCHITECTURE_AUDIT.md` for full migration plan.

---

**Time Investment:** 1 hour  
**ROI:** Immediate improvement in consistency and maintainability

🚀 **Ready to start? Begin with Step 1!**

