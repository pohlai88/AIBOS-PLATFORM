# Apps Directory Architecture Audit & ERP SaaS Best Practices

**Audit Date:** November 27, 2025  
**Platform:** AI-BOS ERP Platform  
**Validator:** Next.js 16 MCP + Architecture Review  
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

---

## 📊 **Current State Analysis**

### Apps Inventory

| App       | Port | Purpose                | Next.js   | Status           |
| --------- | ---- | ---------------------- | --------- | ---------------- |
| `web`     | 3000 | Main ERP Application   | 16.0.3 ✅ | Active           |
| `day.tsx` | 3001 | DevTools Dashboard     | 16.0.3 ✅ | ⚠️ Naming Issue  |
| `docs`    | 3001 | Documentation (Nextra) | 16.0.3 ✅ | ⚠️ Port Conflict |

---

## 🚨 **Critical Issues**

### 1. 🔴 **Port Conflict** (BLOCKING)

**Issue:** Both `docs` and `day.tsx` configured for port 3001

```json
// apps/day.tsx/package.json
"dev": "next dev -p 3001"

// apps/docs/package.json
"dev": "pnpm sync-docs && next dev -p 3001"
```

**Impact:**

- Cannot run both apps simultaneously
- Developer confusion
- Build conflicts

**Fix:**

```json
// apps/docs/package.json
"dev": "pnpm sync-docs && next dev -p 3002",
"start": "next start -p 3002"
```

---

### 2. 🔴 **Inconsistent App Naming**

**Issue:** `day.tsx` is misleading - it's actually DevTools

**Current:**

```
apps/
├── web/           ✅ Clear purpose
├── day.tsx/       ❌ What is "day.tsx"?
└── docs/          ✅ Clear purpose
```

**Should be:**

```
apps/
├── web/           → Main ERP application
├── devtools/      → Developer tools dashboard
└── docs/          → Documentation site
```

**Action Required:** Rename `apps/day.tsx` → `apps/devtools`

---

### 3. 🟠 **Flat Architecture in Web App**

**Current Structure (Flat):**

```
apps/web/app/
├── api/
│   ├── generate-ui/
│   ├── health/
│   ├── invoices/
│   ├── mcp/
│   └── tenants/
├── components/
│   └── DarkModeToggle.tsx
├── master-kernel/
│   └── page.tsx
└── page.tsx
```

**Issues:**

- ❌ No separation of ERP modules
- ❌ No multi-tenant routing
- ❌ No feature-based organization
- ❌ Mixing API routes with pages
- ❌ No clear domain boundaries

---

### 4. 🟠 **Missing Theme Provider in Layout**

**Current (apps/web/app/layout.tsx):**

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body> {/* ❌ No theme provider */}
    </html>
  );
}
```

**Should be:**

```tsx
import { McpThemeProvider } from "@aibos/ui/mcp/providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <McpThemeProvider tenant="default">{children}</McpThemeProvider>
      </body>
    </html>
  );
}
```

---

### 5. 🟡 **Inline Styles in DevTools** (Constitution Violation)

**apps/day.tsx/app/layout.tsx:**

```tsx
<body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <nav style={{ width: 220, background: "#1a1a2e", color: "#fff" }}>
```

**Issue:** Violates design token governance - should use shell components

**Should be:**

```tsx
import {
  AppShell,
  ShellSidebar,
  ShellContent,
  ShellHeader,
  ShellMain,
} from "@aibos/ui/shell";

export default function DevToolsLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell layoutMode="sidebar-fixed">
          <ShellSidebar>{/* Nav */}</ShellSidebar>
          <ShellContent>
            <ShellMain>{children}</ShellMain>
          </ShellContent>
        </AppShell>
      </body>
    </html>
  );
}
```

---

## 🎯 **Recommended ERP SaaS Architecture**

### **Option A: Multi-Tenant Modular (RECOMMENDED)**

Best for: Enterprise ERP with multiple tenants and modules

```
apps/
├── web/                              ← Main ERP Application (Port 3000)
│   ├── app/
│   │   ├── (auth)/                   ← Auth routes (public)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/              ← Authenticated app shell
│   │   │   ├── layout.tsx            → AppShell wrapper
│   │   │   ├── page.tsx              → Dashboard home
│   │   │   │
│   │   │   ├── (modules)/            ← ERP Modules (nested route group)
│   │   │   │   ├── accounting/
│   │   │   │   │   ├── accounts/
│   │   │   │   │   ├── journal/
│   │   │   │   │   ├── reports/
│   │   │   │   │   └── layout.tsx
│   │   │   │   │
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── items/
│   │   │   │   │   ├── warehouses/
│   │   │   │   │   ├── stock-transfer/
│   │   │   │   │   └── layout.tsx
│   │   │   │   │
│   │   │   │   ├── sales/
│   │   │   │   │   ├── orders/
│   │   │   │   │   ├── invoices/
│   │   │   │   │   ├── customers/
│   │   │   │   │   └── layout.tsx
│   │   │   │   │
│   │   │   │   ├── procurement/
│   │   │   │   ├── manufacturing/
│   │   │   │   ├── hr-payroll/
│   │   │   │   └── crm/
│   │   │   │
│   │   │   └── (settings)/           ← Settings & Admin
│   │   │       ├── profile/
│   │   │       ├── tenants/
│   │   │       ├── users/
│   │   │       └── system/
│   │   │
│   │   ├── api/                      ← API Routes
│   │   │   ├── (modules)/            → Module-specific APIs
│   │   │   │   ├── accounting/
│   │   │   │   ├── inventory/
│   │   │   │   └── sales/
│   │   │   │
│   │   │   ├── (platform)/           → Platform APIs
│   │   │   │   ├── health/
│   │   │   │   ├── tenants/
│   │   │   │   ├── auth/
│   │   │   │   └── webhooks/
│   │   │   │
│   │   │   └── (ai)/                 → AI/MCP APIs
│   │   │       ├── generate-ui/
│   │   │       ├── mcp/
│   │   │       └── chat/
│   │   │
│   │   ├── layout.tsx                → Root layout (ThemeProvider)
│   │   └── globals.css
│   │
│   ├── components/                   ← App-specific components
│   │   ├── modules/
│   │   │   ├── accounting/
│   │   │   ├── inventory/
│   │   │   └── sales/
│   │   ├── navigation/
│   │   │   ├── ModuleSwitcher.tsx
│   │   │   ├── AppNavigation.tsx
│   │   │   └── UserMenu.tsx
│   │   └── providers/
│   │       ├── TenantProvider.tsx
│   │       └── PermissionProvider.tsx
│   │
│   ├── lib/                          ← App utilities
│   │   ├── auth.ts
│   │   ├── kernel-client.ts
│   │   ├── supabase.ts
│   │   ├── permissions.ts
│   │   └── api-client.ts
│   │
│   └── package.json
│
├── devtools/                         ← Developer Tools (Port 3001)
│   ├── app/
│   │   ├── layout.tsx                → Use AppShell
│   │   ├── page.tsx                  → Dashboard
│   │   ├── engines/
│   │   ├── metadata/
│   │   ├── actions/
│   │   ├── events/
│   │   └── tenants/
│   │
│   └── package.json
│
├── docs/                             ← Documentation (Port 3002)
│   ├── app/
│   ├── pages/
│   └── package.json
│
└── admin/                            ← Optional: Separate admin app (Port 3003)
    ├── app/
    │   ├── (super-admin)/
    │   │   ├── tenants/
    │   │   ├── billing/
    │   │   ├── analytics/
    │   │   └── system/
    │   └── layout.tsx
    └── package.json
```

### **Key Benefits:**

1. ✅ **Module Isolation** - Each ERP module is self-contained
2. ✅ **Multi-Tenant Ready** - Route groups support tenant switching
3. ✅ **Clear Separation** - Auth, Dashboard, Modules, Settings are distinct
4. ✅ **Scalable** - Easy to add/remove modules
5. ✅ **Consistent Shell** - AppShell wrapper provides uniform UX
6. ✅ **API Organization** - Grouped by domain (modules, platform, AI)

---

### **Option B: Tenant-First Architecture**

Best for: SaaS with strong tenant isolation

```
apps/web/app/
├── [tenant]/                         ← Dynamic tenant routing
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (dashboard)/
│   │   ├── accounting/
│   │   ├── inventory/
│   │   ├── sales/
│   │   └── layout.tsx
│   │
│   └── layout.tsx                    → Tenant context provider
│
├── api/
│   └── [tenant]/                     ← Tenant-scoped APIs
│       ├── accounting/
│       └── inventory/
│
└── layout.tsx                        → Root layout
```

**Trade-offs:**

- ✅ Strong tenant isolation
- ✅ SEO-friendly tenant URLs
- ❌ More complex routing
- ❌ Harder to share cross-tenant UI

---

### **Option C: Domain-Driven Design (DDD)**

Best for: Complex enterprise with bounded contexts

```
apps/
├── accounting/                       ← Separate app per domain
├── inventory/
├── sales/
├── shared-web/                       ← Shared portal
└── gateway/                          ← API gateway
```

**Trade-offs:**

- ✅ Maximum isolation
- ✅ Independent deployment
- ❌ More complex monorepo
- ❌ Shared UI challenges

---

## 📋 **Migration Action Plan**

### Phase 1: Foundation (Week 1) 🔴 CRITICAL

```bash
# 1. Rename day.tsx to devtools
cd D:\AIBOS-PLATFORM\apps
git mv day.tsx devtools

# 2. Fix port conflicts
# Update apps/docs/package.json → port 3002
# Update apps/devtools/package.json → keep port 3001

# 3. Update theme provider in web/app/layout.tsx
```

- [ ] Rename `day.tsx` → `devtools`
- [ ] Fix port conflicts
- [ ] Add `McpThemeProvider` to web layout
- [ ] Update turbo.json references
- [ ] Update package.json references
- [ ] Test all apps start without conflicts

### Phase 2: Structure (Week 2) 🟠 HIGH

```bash
# Create new route groups in apps/web
mkdir -p apps/web/app/\(auth\)/{login,register}
mkdir -p apps/web/app/\(dashboard\)/\(modules\)/{accounting,inventory,sales}
mkdir -p apps/web/app/\(dashboard\)/\(settings\)/{profile,tenants,users}
```

- [ ] Create (auth) route group
- [ ] Create (dashboard) route group
- [ ] Create (modules) nested group
- [ ] Create (settings) nested group
- [ ] Migrate existing pages
- [ ] Create layout files

### Phase 3: Modules (Week 3-4) 🟡 MEDIUM

- [ ] Extract accounting module
- [ ] Extract inventory module
- [ ] Extract sales module
- [ ] Create module-specific API routes
- [ ] Implement module navigation
- [ ] Add module permissions

### Phase 4: Components (Week 4-5) 🔵 LOW

- [ ] Integrate AppShell in devtools
- [ ] Create ModuleSwitcher component
- [ ] Build AppNavigation
- [ ] Implement TenantProvider
- [ ] Add PermissionProvider
- [ ] Remove inline styles from devtools

---

## 🎓 **Best Practices for ERP SaaS**

### 1. **Route Organization**

```tsx
// ✅ GOOD: Grouped by feature
app/
├── (dashboard)/
│   └── (modules)/
│       └── accounting/
│           ├── accounts/
│           ├── journal/
│           └── reports/

// ❌ BAD: Flat structure
app/
├── accounts/
├── journal/
├── reports/
└── invoices/
```

### 2. **Module Layouts**

```tsx
// apps/web/app/(dashboard)/(modules)/accounting/layout.tsx
import { ModuleBreadcrumb } from "@/components/navigation/ModuleBreadcrumb";

export default function AccountingLayout({ children }) {
  return (
    <div>
      <ModuleBreadcrumb module="accounting" />
      <nav>{/* Module-specific nav */}</nav>
      {children}
    </div>
  );
}
```

### 3. **API Route Organization**

```
api/
├── (modules)/          → Business logic APIs
│   └── accounting/
│       └── route.ts
│
├── (platform)/         → Infrastructure APIs
│   └── health/
│       └── route.ts
│
└── (ai)/              → AI/MCP APIs
    └── generate-ui/
        └── route.ts
```

### 4. **Multi-Tenant Support**

```tsx
// app/layout.tsx
import { TenantProvider } from "@/components/providers/TenantProvider";
import { McpThemeProvider } from "@aibos/ui/mcp/providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TenantProvider>
          <McpThemeProvider>{children}</McpThemeProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
```

### 5. **Permission-Based Rendering**

```tsx
// components/modules/accounting/AccountsList.tsx
import { PermissionGate } from "@/components/providers/PermissionProvider";

export function AccountsList() {
  return (
    <PermissionGate module="accounting" action="read">
      <div>{/* Accounts list */}</div>
    </PermissionGate>
  );
}
```

---

## 📊 **Architecture Scorecard**

| Category                 | Current | Target | Gap   |
| ------------------------ | ------- | ------ | ----- |
| **Module Separation**    | 2/10    | 9/10   | 🔴 -7 |
| **Multi-Tenant Support** | 3/10    | 9/10   | 🔴 -6 |
| **Route Organization**   | 4/10    | 9/10   | 🟠 -5 |
| **Theme Integration**    | 6/10    | 10/10  | 🟡 -4 |
| **API Structure**        | 5/10    | 9/10   | 🟠 -4 |
| **Component Reuse**      | 7/10    | 9/10   | 🔵 -2 |
| **Port Management**      | 3/10    | 10/10  | 🔴 -7 |
| **Naming Conventions**   | 6/10    | 10/10  | 🟡 -4 |

**Overall Score:** 4.5/10 → **Target:** 9.2/10

---

## 🚀 **Quick Wins (This Week)**

### 1. Fix Port Conflicts (15 mins)

```bash
# apps/docs/package.json
{
  "scripts": {
    "dev": "pnpm sync-docs && next dev -p 3002",
    "start": "next start -p 3002"
  }
}
```

### 2. Rename DevTools (10 mins)

```bash
cd D:\AIBOS-PLATFORM\apps
git mv day.tsx devtools
```

### 3. Add Theme Provider (5 mins)

```tsx
// apps/web/app/layout.tsx
import { McpThemeProvider } from "@aibos/ui/mcp/providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <McpThemeProvider tenant="default">{children}</McpThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Use AppShell in DevTools (30 mins)

```tsx
// apps/devtools/app/layout.tsx
import {
  AppShell,
  ShellSidebar,
  ShellContent,
  ShellMain,
} from "@aibos/ui/shell";

export default function DevToolsLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell layoutMode="sidebar-fixed">
          <ShellSidebar>{/* Navigation */}</ShellSidebar>
          <ShellContent>
            <ShellMain>{children}</ShellMain>
          </ShellContent>
        </AppShell>
      </body>
    </html>
  );
}
```

**Total Time:** 1 hour → **Impact:** High

---

## 📚 **References**

- [Next.js 14+ App Router Best Practices](https://nextjs.org/docs/app/building-your-application/routing)
- [Multi-Tenant SaaS Architecture](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/multi-tenant-saas-architecture.html)
- [ERP System Design Patterns](https://martinfowler.com/eaaCatalog/)
- [Monorepo Best Practices](https://turbo.build/repo/docs/handbook)

---

**Next Steps:** Start with Phase 1 quick wins, then proceed to modular restructure.

**Status:** Audit Complete ✅  
**Priority:** HIGH - Begin migration immediately
