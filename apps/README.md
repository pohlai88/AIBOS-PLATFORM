# Apps Directory - AI-BOS Platform

**Status:** 🟡 Needs Restructuring  
**Architecture Score:** 4.5/10 → **Target:** 9.2/10  
**Priority:** 🔴 HIGH

---

## 📱 **Applications**

| App | Port | Purpose | Status |
|-----|------|---------|--------|
| **web** | 3000 | Main ERP Application | ✅ Active |
| **devtools** | 3001 | Developer Tools Dashboard | ⚠️ Needs rename from `day.tsx` |
| **docs** | 3002 | Documentation Site | ⚠️ Port conflict with devtools |

---

## 🚨 **Critical Issues**

### 🔴 **1. Port Conflict**
- Both `devtools` and `docs` use port 3001
- **Fix:** Change docs to port 3002

### 🔴 **2. Naming Issue**
- `day.tsx` → unclear purpose
- **Fix:** Rename to `devtools`

### 🟠 **3. Flat Architecture**
- No ERP module separation
- **Fix:** Use route groups for modules

---

## 🚀 **Quick Start**

### Development

```bash
# From workspace root
cd D:\AIBOS-PLATFORM

# Start all apps
pnpm dev

# Or start individually
cd apps/web && pnpm dev      # Port 3000
cd apps/devtools && pnpm dev # Port 3001 (after fixes)
cd apps/docs && pnpm dev     # Port 3002 (after fixes)
```

### Production Build

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/web && pnpm build
```

---

## 📚 **Documentation**

### **Start Here:**
1. 📊 **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)** - Overview & next steps
2. 🔧 **[QUICK_FIX_GUIDE.md](./QUICK_FIX_GUIDE.md)** - Immediate fixes (1 hour)
3. 📋 **[APPS_ARCHITECTURE_AUDIT.md](./APPS_ARCHITECTURE_AUDIT.md)** - Complete audit

---

## 🎯 **Recommended Architecture**

### **Current (Flat)**

```
apps/
├── web/app/
│   ├── api/
│   │   ├── generate-ui/
│   │   ├── invoices/
│   │   └── tenants/
│   └── page.tsx
│
├── day.tsx/app/        ❌ Confusing name
│   └── (pages)
│
└── docs/               ❌ Port 3001 conflict
```

### **Recommended (Modular)**

```
apps/
├── web/app/
│   ├── (auth)/                   ← Public routes
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (dashboard)/              ← Authenticated app
│   │   ├── layout.tsx            → AppShell
│   │   │
│   │   ├── (modules)/            ← ERP Modules
│   │   │   ├── accounting/
│   │   │   ├── inventory/
│   │   │   ├── sales/
│   │   │   ├── procurement/
│   │   │   └── manufacturing/
│   │   │
│   │   └── (settings)/           ← Admin
│   │       ├── profile/
│   │       └── tenants/
│   │
│   ├── api/
│   │   ├── (modules)/            → Module APIs
│   │   ├── (platform)/           → System APIs
│   │   └── (ai)/                 → AI/MCP
│   │
│   └── layout.tsx                → Theme provider
│
├── devtools/app/                 ✅ Clear name
│   ├── layout.tsx                → AppShell
│   └── (diagnostics pages)
│
└── docs/                         ✅ Port 3002
```

---

## 🔧 **Quick Fixes** (1 Hour)

### 1. Fix Port Conflicts

```json
// apps/docs/package.json
{
  "scripts": {
    "dev": "pnpm sync-docs && next dev -p 3002",  // ← Change from 3001
    "start": "next start -p 3002"                 // ← Change from 3001
  }
}
```

### 2. Rename DevTools

```bash
cd D:\AIBOS-PLATFORM\apps
git mv day.tsx devtools
```

### 3. Add Theme Provider

```tsx
// apps/web/app/layout.tsx
import { McpThemeProvider } from "@aibos/ui/mcp/providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <McpThemeProvider tenant="default">
          {children}
        </McpThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Use AppShell in DevTools

```tsx
// apps/devtools/app/layout.tsx
import { AppShell, ShellSidebar, ShellContent, ShellMain } from "@aibos/ui/shell";

export default function Layout({ children }) {
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

---

## 📊 **Technology Stack**

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.3 | React framework |
| React | 19.2.0 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 4.1.6 | Styling |
| Turbo | 2.3.0 | Monorepo management |
| pnpm | 8.15.0 | Package manager |

---

## 🛠️ **Development**

### Prerequisites

```bash
node >= 18.0.0
pnpm >= 8.0.0
```

### Setup

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build

# Start development
pnpm dev
```

### Lint & Format

```bash
# Lint all apps
pnpm lint

# Fix linting issues
pnpm lint --fix

# Format code
pnpm format
```

---

## 📦 **Build & Deploy**

### Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @aibos/web build
pnpm --filter @aibos/devtools build
pnpm --filter @aibos/docs build
```

### Start Production

```bash
# Start all apps
pnpm start

# Start specific app
cd apps/web && pnpm start
```

---

## 🧪 **Testing**

```bash
# Run all tests
pnpm test

# Test specific app
cd apps/web && pnpm test

# E2E tests
pnpm test:e2e
```

---

## 📖 **App-Specific READMEs**

- [Web App](./web/README.md) - Main ERP application
- [DevTools](./devtools/README.md) - Developer dashboard (after rename)
- [Docs](./docs/README.md) - Documentation site

---

## 🚧 **Migration Status**

### Phase 1: Quick Wins (This Week)
- [ ] Fix port conflicts
- [ ] Rename `day.tsx` → `devtools`
- [ ] Add theme provider
- [ ] Integrate AppShell in devtools

### Phase 2: Structure (Week 2)
- [ ] Create route groups
- [ ] Separate auth routes
- [ ] Organize modules

### Phase 3: Modules (Week 3-4)
- [ ] Extract accounting
- [ ] Extract inventory
- [ ] Extract sales

---

## 🤝 **Contributing**

1. Create feature branch
2. Make changes
3. Test locally (`pnpm dev`)
4. Run linter (`pnpm lint`)
5. Build (`pnpm build`)
6. Submit PR

---

## 📚 **Resources**

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [AI-BOS Design System](../packages/ui/README.md)
- [Shell Components](../packages/ui/src/components/shell/README.md)

---

## 🆘 **Support**

- **Issues:** See `APPS_ARCHITECTURE_AUDIT.md`
- **Quick Fixes:** See `QUICK_FIX_GUIDE.md`
- **Architecture:** See `ARCHITECTURE_SUMMARY.md`

---

**Last Updated:** 2025-11-27  
**Next Review:** After Phase 1 completion  
**Maintained By:** Platform Team

