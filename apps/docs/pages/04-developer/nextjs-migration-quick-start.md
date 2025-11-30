# Next.js Migration Quick Start

> **Quick reference guide for Next.js migration**  
> **Type:** ⚡ Quick Reference  
> **SSOT:** [nextjs-migration-plan.md](./nextjs-migration-plan.md) - **Follow this for complete details**

---

## ⚠️ Important: Which Document to Follow?

**✅ MAIN DOCUMENT (SSOT):** [nextjs-migration-plan.md](./nextjs-migration-plan.md)  
**⚡ This Document:** Quick commands only - Use for fast reference  
**📄 Summary:** [nextjs-migration-summary.md](./nextjs-migration-summary.md) - Executive overview

**👉 Always refer to the main plan document for complete implementation details.**

---

## Overview

Quick reference guide with essential commands for implementing the Next.js migration plan. For complete details, see the [main migration plan](./nextjs-migration-plan.md).

---

## Phase 1: Foundation (Day 1)

### 1. Upgrade Next.js

```bash
cd apps/web
pnpm add next@latest react@latest react-dom@latest
```

### 2. Run Migration Script

```bash
node .mcp/convention-validation/scripts/migrate-nextjs-phase1.mjs
```

### 3. Enable Cache Components

Update `apps/web/next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true, // Add this
  },
  // ... rest of config
};
```

### 4. Test

```bash
pnpm dev
```

Visit `http://localhost:3000` and verify:
- ✅ Home page loads
- ✅ Dashboard route works (`/dashboard`)
- ✅ Loading state works
- ✅ Error boundary works
- ✅ 404 page works

---

## Phase 2: Data Fetching (Day 2-3)

### 1. Create Server Components

```typescript
// app/(dashboard)/modules/accounting/page.tsx
export default async function AccountingPage() {
  const data = await fetchAccountingData();
  return <AccountingOverview data={data} />;
}
```

### 2. Create Server Actions

```typescript
// app/actions/accounting.ts
'use server';

export async function createJournalEntry(data: JournalEntryData) {
  // Implementation
}
```

---

## Phase 3: Authentication (Day 4-5)

### 1. Install NextAuth.js

```bash
pnpm add next-auth@beta
```

### 2. Setup Auth

Create `app/api/auth/[...nextauth]/route.ts` and configure.

---

## Phase 4: UI Components (Day 6-7)

### 1. Integrate @aibos/ui

Update `app/layout.tsx` to use AppShell and ThemeProvider.

---

## Verification Checklist

After each phase:

- [ ] Run `pnpm dev` - No errors
- [ ] Run `pnpm build` - Build succeeds
- [ ] Run `pnpm lint` - No linting errors
- [ ] Test routes - All routes work
- [ ] Check console - No errors
- [ ] Validate conventions - `npm run mcp:validate-all`

---

## 📚 Related Documents

- **✅ MAIN PLAN (SSOT):** [nextjs-migration-plan.md](./nextjs-migration-plan.md) - **Complete details**
- **📄 Summary:** [nextjs-migration-summary.md](./nextjs-migration-summary.md) - Executive overview
- **⚡ This Document:** Quick commands only

---

**⚠️ Remember:** This is a quick reference only. Always refer to [nextjs-migration-plan.md](./nextjs-migration-plan.md) for complete implementation details.

