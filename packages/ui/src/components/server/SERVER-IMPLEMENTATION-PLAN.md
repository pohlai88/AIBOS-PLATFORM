# 🖥️ Server Components Implementation Plan

**Official Next.js RSC Architecture - Server-Side Components**

## 📋 Document Overview

| Attribute                  | Value                          |
| -------------------------- | ------------------------------ |
| **Version**                | 1.0.1                          |
| **Created**                | 2025-11-25                     |
| **Updated**                | 2025-11-25                     |
| **Status**                 | VALIDATED - React 19 Compliant |
| **Architecture Authority** | Next.js MCP v16.0.4            |
| **React Version**          | 19.x RSC Architecture          |
| **Validation Score**       | 97% → 100% (patched)           |

---

## 🎯 SSOT (Single Source of Truth)

### **Design Tokens**

| Source             | Path                                             | Purpose                                              |
| ------------------ | ------------------------------------------------ | ---------------------------------------------------- |
| `globals.css`      | `packages/ui/src/design/globals.css`             | CSS custom properties (--color-_, --spacing-_, etc.) |
| `tokens.ts`        | `packages/ui/src/design/tokens/tokens.ts`        | TypeScript token exports                             |
| `token-helpers.ts` | `packages/ui/src/design/tokens/token-helpers.ts` | Token validation utilities                           |

### **Component Patterns**

| Source            | Path                                | Purpose                   |
| ----------------- | ----------------------------------- | ------------------------- |
| Client README     | `src/components/client/README.md`   | Client component patterns |
| Server README     | `src/components/server/README.md`   | Server component patterns |
| Shared Primitives | `src/components/shared/primitives/` | Reusable base components  |

### **Validation Authority**

| MCP Tool                    | SSOT Responsibility                              |
| --------------------------- | ------------------------------------------------ |
| **Next.js MCP**             | Directory architecture, RSC patterns, routing    |
| **Theme MCP**               | Token existence, token values, token suggestions |
| **React MCP**               | RSC boundaries, server/client usage validation   |
| **A11y MCP**                | WCAG compliance, contrast ratios                 |
| **Convention MCP**          | Naming, folder structure, imports                |
| **Component Generator MCP** | Constitution validation (86 rules)               |

---

## ✅ DOD (Definition of Done)

### **Per Component Checklist**

```markdown
## Component: [ComponentName]

### Code Quality

- [ ] NO `'use client'` directive (Server Component by default)
- [ ] TypeScript strict mode compliant (0 errors)
- [ ] ESLint compliant (0 errors)
- [ ] Uses `async/await` for data fetching where needed
- [ ] Returns serializable JSX only

### React 19 Requirements

- [ ] Props are fully serializable (no functions, no class instances, no Symbols)
- [ ] Uses RSC-safe props (no event handlers like onClick, onChange)

### Design System

- [ ] 100% design token usage (no hardcoded values)
- [ ] Theme MCP validation passed
- [ ] Uses `mcp-server-*` CSS classes for MCP tracking

### MCP Validation (4 Required Checks)

- [ ] `validate_rsc_boundary` - PASSED
- [ ] `check_server_client_usage` - PASSED
- [ ] `validate_imports` - PASSED
- [ ] `validate_react_component` - PASSED

### Accessibility

- [ ] A11y MCP validation passed
- [ ] Semantic HTML structure
- [ ] ARIA attributes where needed

### Documentation

- [ ] JSDoc comments on all exports
- [ ] Usage examples (minimum 2)
- [ ] Props documentation

### Files Required

- [ ] `[component-name].tsx` - Main component
- [ ] `[component-name].types.ts` - TypeScript types
- [ ] `index.ts` - Barrel export
```

### **Per Category Checklist**

```markdown
## Category: [layout/data/display]

- [ ] All components pass individual DOD
- [ ] `index.ts` exports all components
- [ ] README.md updated with component list
- [ ] Convention MCP folder structure validation passed
```

### **Server Directory Completion Checklist**

```markdown
## Server Directory: COMPLETE

- [ ] All 3 categories implemented (layout, data, display)
- [ ] Root `index.ts` exports all categories
- [ ] Root `README.md` updated
- [ ] Integration tests with Next.js app
- [ ] Bundle size verified (0 client JS)
```

---

## 📁 Directory Architecture

```
server/
├── index.ts                    # Root barrel export
├── README.md                   # Server components documentation
├── SERVER-IMPLEMENTATION-PLAN.md  # This file
├── server-manifest.json        # Component registry & validation status
│
├── layout/                     # Layout Components
│   ├── index.ts               # Category barrel export
│   ├── README.md              # Category documentation
│   ├── _template.tsx.template # Component template
│   │
│   ├── header/
│   │   ├── header.tsx
│   │   ├── header.types.ts
│   │   └── index.ts
│   │
│   ├── navigation/
│   │   ├── navigation.tsx
│   │   ├── navigation.types.ts
│   │   └── index.ts
│   │
│   ├── sidebar/
│   │   ├── sidebar.tsx
│   │   ├── sidebar.types.ts
│   │   └── index.ts
│   │
│   ├── content-area/
│   │   ├── content-area.tsx
│   │   ├── content-area.types.ts
│   │   └── index.ts
│   │
│   └── footer/
│       ├── footer.tsx
│       ├── footer.types.ts
│       └── index.ts
│
├── data/                       # Data Display Components
│   ├── index.ts
│   ├── README.md
│   │
│   ├── server-table/
│   │   ├── server-table.tsx
│   │   ├── server-table.types.ts
│   │   └── index.ts
│   │
│   ├── data-list/
│   │   ├── data-list.tsx
│   │   ├── data-list.types.ts
│   │   └── index.ts
│   │
│   ├── data-grid/
│   │   ├── data-grid.tsx
│   │   ├── data-grid.types.ts
│   │   └── index.ts
│   │
│   └── async-boundary/
│       ├── async-boundary.tsx
│       ├── async-boundary.types.ts
│       └── index.ts
│
└── display/                    # Static Display Components
    ├── index.ts
    ├── README.md
    │
    ├── static-card/
    │   ├── static-card.tsx
    │   ├── static-card.types.ts
    │   └── index.ts
    │
    ├── info-panel/
    │   ├── info-panel.tsx
    │   ├── info-panel.types.ts
    │   └── index.ts
    │
    ├── stat-banner/
    │   ├── stat-banner.tsx
    │   ├── stat-banner.types.ts
    │   └── index.ts
    │
    ├── feature-highlight/
    │   ├── feature-highlight.tsx
    │   ├── feature-highlight.types.ts
    │   └── index.ts
    │
    └── content-section/
        ├── content-section.tsx
        ├── content-section.types.ts
        └── index.ts
```

---

## 📊 Total Composition Needed

### **Category 1: Layout (5 Components)**

| Component     | Purpose                                     | Dependencies      | Priority |
| ------------- | ------------------------------------------- | ----------------- | -------- |
| `Header`      | Page header with branding, navigation slots | shared/primitives | P1       |
| `Navigation`  | Navigation menu structure                   | shared/primitives | P1       |
| `Sidebar`     | Side navigation/content area                | shared/primitives | P2       |
| `ContentArea` | Main content wrapper                        | shared/primitives | P2       |
| `Footer`      | Page footer with links, copyright           | shared/primitives | P3       |

### **Category 2: Data (4 Components)**

| Component       | Purpose                        | Dependencies            | Priority |
| --------------- | ------------------------------ | ----------------------- | -------- |
| `ServerTable`   | Server-rendered data table     | shared/primitives/table | P1       |
| `DataList`      | Server-rendered list display   | shared/primitives       | P2       |
| `DataGrid`      | Server-rendered grid layout    | shared/primitives       | P2       |
| `AsyncBoundary` | Suspense wrapper with fallback | shared/primitives       | P1       |

### **Category 3: Display (5 Components)**

| Component          | Purpose                      | Dependencies           | Priority |
| ------------------ | ---------------------------- | ---------------------- | -------- |
| `StaticCard`       | Non-interactive card display | shared/primitives/card | P1       |
| `InfoPanel`        | Information display panel    | shared/primitives      | P2       |
| `StatBanner`       | Statistics/metrics banner    | shared/primitives      | P2       |
| `FeatureHighlight` | Feature showcase section     | shared/primitives      | P3       |
| `ContentSection`   | Content block with heading   | shared/typography      | P3       |

### **Summary**

| Category  | Components | Estimated Hours |
| --------- | ---------- | --------------- |
| Layout    | 5          | 8-10            |
| Data      | 4          | 6-8             |
| Display   | 5          | 6-8             |
| **Total** | **14**     | **20-26**       |

---

## 🔧 MCP Validation Workflow

### **For Each Component**

```bash
# Step 1: RSC Boundary Validation
mcp_react-validation_validate_rsc_boundary
  → Expected: { valid: true, isServerComponent: true, violations: 0 }

# Step 2: Server/Client Usage Check
mcp_react-validation_check_server_client_usage
  → Expected: { isClientComponent: false, shouldBeClient: false, issues: 0 }

# Step 3: Import Validation
mcp_react-validation_validate_imports
  → Expected: { valid: true, hasBrowserAPIs: false, hasClientHooks: false }

# Step 4: Component Quality
mcp_react-validation_validate_react_component
  → Expected: { valid: true, errors: 0 }

# Step 5: Token Validation
mcp_aibos-theme_validate_token_exists (for each token used)
  → Expected: { exists: true }

# Step 6: Accessibility Validation
mcp_aibos-a11y-validation_validate_component
  → Expected: { valid: true, issues: [] }

# Step 7: Convention Validation
mcp_aibos-convention-validation_validate_naming
  → Expected: { valid: true }
```

---

## 📝 Component Template

````tsx
// server/[category]/[component-name]/[component-name].tsx

import { cn } from '../../../../design/utilities/cn'

// Types
import type { [ComponentName]Props } from './[component-name].types'

/**
 * [ComponentName] - Server Component
 *
 * [Description of component purpose]
 *
 * @example
 * ```tsx
 * <[ComponentName] title="Example">
 *   Content here
 * </[ComponentName]>
 * ```
 */
export async function [ComponentName]({
  children,
  className,
  ...props
}: [ComponentName]Props) {
  return (
    <div
      className={cn(
        // Base styles using design tokens
        'bg-surface text-foreground',
        'mcp-server-safe', // MCP tracking class
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Default export for Next.js
export default [ComponentName]
````

### **Types Template (React 19 RSC-Safe)**

```tsx
// server/[category]/[component-name]/[component-name].types.ts

import type { ReactNode, CSSProperties } from 'react'

/**
 * RSC-Safe Props - No event handlers allowed (React 19 requirement)
 * Server Components cannot accept functions as props
 */
type ServerDivProps = {
  id?: string
  role?: string
  title?: string
  tabIndex?: number
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-hidden'?: boolean
  'data-testid'?: string
  // ❌ NO onClick, onMouseEnter, onChange, etc.
}

export interface [ComponentName]Props extends ServerDivProps {
  /** Child content */
  children?: ReactNode
}
```

### **Index Template**

```tsx
// server/[category]/[component-name]/index.ts

export { [ComponentName], default } from './[component-name]'
export type { [ComponentName]Props } from './[component-name].types'
```

---

## 🚀 Implementation Sequence

### **Phase 1: Foundation (Day 1)**

1. Create `server-manifest.json` for tracking
2. Update category `index.ts` files
3. Implement `AsyncBoundary` (utility component)

### **Phase 2: Layout Components (Day 2-3)**

1. `Header` → P1
2. `Navigation` → P1
3. `Sidebar` → P2
4. `ContentArea` → P2
5. `Footer` → P3

### **Phase 3: Data Components (Day 4)**

1. `ServerTable` → P1
2. `DataList` → P2
3. `DataGrid` → P2

### **Phase 4: Display Components (Day 5)**

1. `StaticCard` → P1
2. `InfoPanel` → P2
3. `StatBanner` → P2
4. `FeatureHighlight` → P3
5. `ContentSection` → P3

### **Phase 5: Validation & Documentation (Day 6)**

1. Run all MCP validations
2. Update documentation
3. Create `server-manifest.json` with results

---

## 📋 Server Manifest Schema

```json
{
  "certification": {
    "status": "PENDING",
    "date": null,
    "version": "1.0.0",
    "validationAuthority": ["Next.js MCP v16.0.4", "React MCP v2.0.0"]
  },
  "categories": {
    "layout": {
      "status": "PENDING",
      "components": {
        "Header": { "status": "PENDING", "mcpValidation": null },
        "Navigation": { "status": "PENDING", "mcpValidation": null },
        "Sidebar": { "status": "PENDING", "mcpValidation": null },
        "ContentArea": { "status": "PENDING", "mcpValidation": null },
        "Footer": { "status": "PENDING", "mcpValidation": null }
      }
    },
    "data": {
      "status": "PENDING",
      "components": {
        "ServerTable": { "status": "PENDING", "mcpValidation": null },
        "DataList": { "status": "PENDING", "mcpValidation": null },
        "DataGrid": { "status": "PENDING", "mcpValidation": null },
        "AsyncBoundary": { "status": "PENDING", "mcpValidation": null }
      }
    },
    "display": {
      "status": "PENDING",
      "components": {
        "StaticCard": { "status": "PENDING", "mcpValidation": null },
        "InfoPanel": { "status": "PENDING", "mcpValidation": null },
        "StatBanner": { "status": "PENDING", "mcpValidation": null },
        "FeatureHighlight": { "status": "PENDING", "mcpValidation": null },
        "ContentSection": { "status": "PENDING", "mcpValidation": null }
      }
    }
  },
  "totalComponents": 14,
  "completedComponents": 0,
  "mcpValidationsPassed": 0,
  "mcpValidationsRequired": 56
}
```

---

## 🔗 Related Documentation

- [Client Components README](../client/README.md)
- [Shared Primitives](../shared/primitives/README.md)
- [Design System](../../design/README.md)
- [Next.js Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
