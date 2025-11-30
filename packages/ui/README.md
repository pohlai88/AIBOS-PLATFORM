# @aibos/ui - Next.js MCP Optimized UI Package

> **A Next.js 16+ optimized UI component library with MCP integration and AI-BOS Constitution
> Framework**

## 🏗️ Architecture Overview

This UI package is architected for **Next.js 16+ App Router** with **MCP (Model Context Protocol)**
integration and **AI-BOS Constitution Framework** governance.

> **📊 Current Status:** See [`UI-PACKAGE-STATUS.md`](./UI-PACKAGE-STATUS.md) for consolidated implementation status.  
> **🗺️ Implementation Plan:** See [`IMPLEMENTATION-ROADMAP.md`](./IMPLEMENTATION-ROADMAP.md) for roadmap.

### 📁 Directory Structure

```
packages/ui/
├── constitution/              # 🏛️ AI-BOS Constitution Framework
│   ├── components.yml         # Component governance rules
│   ├── tokens.yml            # Token governance rules
│   ├── rsc.yml               # RSC boundary rules
│   └── validators/           # Constitution validators
├── mcp/                      # 🤖 MCP Integration Layer
│   ├── providers/            # MCP context providers
│   ├── hooks/                # MCP validation & generation hooks
│   ├── tools/                # Runtime validation tools
│   └── types/                # MCP type definitions
├── src/
│   ├── components/           # 🧩 Component Library
│   │   ├── server/           # Server Components only
│   │   │   ├── data/         # Data-fetching components
│   │   │   ├── display/      # Static display components
│   │   │   └── layout/       # Layout components
│   │   ├── client/           # Client Components only
│   │   │   ├── interactive/  # Interactive UI components
│   │   │   ├── forms/        # Form components
│   │   │   └── providers/    # Client context providers
│   │   └── shared/           # Works in both environments
│   │       ├── primitives/   # Basic UI building blocks
│   │       └── typography/   # Text components
│   ├── design/               # 🎨 Design System
│   │   ├── tokens/           # Token utilities
│   │   │   ├── server.ts     # Server-safe tokens
│   │   │   └── client.ts     # Client-safe tokens
│   │   ├── themes/           # Theme definitions
│   │   │   ├── default.css   # Default theme (tenant-customizable)
│   │   │   ├── wcag-aa.css   # WCAG AA compliance (fixed)
│   │   │   └── wcag-aaa.css  # WCAG AAA compliance (fixed)
│   │   ├── utilities/        # Design utilities
│   │   └── globals.css       # Source of truth for all tokens
│   ├── hooks/                # Custom hooks
│   ├── layouts/              # Layout components
│   └── lib/                  # Utilities
└── package.json              # Package configuration
```

## 🎯 Key Principles

### 1. **Server-First Architecture**

- **Server Components by default** - Minimize client-side JavaScript
- **Clear Server/Client boundaries** - Explicit separation for optimal performance
- **Shared components** - Work in both environments when possible

### 2. **MCP Integration**

- **Real-time validation** - Components validated against constitution
- **AI-powered generation** - MCP tools for component creation
- **Constitution enforcement** - Machine-readable governance rules

### 3. **Constitution Governance**

- **Token immutability** - Controlled token system with governance
- **Accessibility compliance** - WCAG AA/AAA enforcement
- **RSC boundary validation** - Prevent server/client violations
- **Design drift prevention** - Automated validation pipeline

## 🚀 Usage Guide

### Component Environment Guidelines

#### ✅ **Server Components** (`src/components/server/`)

```tsx
// ✅ Good - Server Component (no 'use client')
export default async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId); // ✅ Direct data fetching

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**Use for:**

- Data fetching from APIs/databases
- Static content rendering
- SEO-critical content
- Layout components

#### ✅ **Client Components** (`src/components/client/`)

```tsx
"use client"; // ✅ Required directive

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0); // ✅ React hooks allowed

  return (
    <button onClick={() => setCount(count + 1)}>
      {" "}
      {/* ✅ Event handlers */}
      Count: {count}
    </button>
  );
}
```

**Use for:**

- Interactive UI (buttons, forms, modals)
- Browser APIs (localStorage, geolocation)
- React hooks (useState, useEffect)
- Event handlers (onClick, onChange)

#### ✅ **Shared Components** (`src/components/shared/`)

```tsx
// ✅ Good - No 'use client' directive
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void; // ✅ Optional - parent provides
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  onClick,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      onClick={onClick} // ✅ Works in client, ignored on server
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

**Use for:**

- UI primitives (badges, cards, separators)
- Typography components
- Layout utilities
- Non-interactive display components

### Package Exports

```typescript
// Server Components (default)
import { UserProfile, DataTable } from "@aibos/ui/server";

// Client Components (explicit)
import { Button, Modal } from "@aibos/ui/client";

// Shared Components
import { Badge, Card } from "@aibos/ui";

// MCP Integration
import { McpProvider, useMcpValidation } from "@aibos/ui/mcp";

// Design Tokens
import { serverTokens } from "@aibos/ui/design/tokens/server";
import { clientTokens } from "@aibos/ui/design/tokens/client";
```

## 🔧 Integration Steps

### Phase 1: Component Migration (Current → New Structure)

1. **Audit existing components** for client-side features
2. **Move interactive components** to `src/components/client/`
3. **Move static components** to `src/components/server/`
4. **Keep versatile components** in `src/components/shared/`

### Phase 2: MCP Enhancement

1. **Integrate MCP providers** in your app
2. **Use validation hooks** for real-time feedback
3. **Leverage constitution rules** for governance

### Phase 3: Advanced Features

1. **Theme customization** with tenant overrides
2. **Advanced validation** with visual regression
3. **AI-powered generation** with MCP tools

## 📋 Component Migration Checklist

### Moving to Server Components

- [ ] Remove `'use client'` directive
- [ ] Remove React hooks (useState, useEffect, etc.)
- [ ] Remove event handlers (onClick, onChange, etc.)
- [ ] Remove browser APIs (window, localStorage, etc.)
- [ ] Add async/await for data fetching if needed

### Moving to Client Components

- [ ] Add `'use client'` directive at top of file
- [ ] Ensure component needs client-side features
- [ ] Consider if it can remain a Server Component
- [ ] Minimize the client boundary

### Keeping as Shared Components

- [ ] Remove `'use client'` directive
- [ ] Accept event handlers as optional props
- [ ] Ensure compatibility with both environments
- [ ] Test in both server and client contexts

## 🎨 Design System Integration

### Token Usage

```tsx
// Server-safe tokens
import { serverTokens } from "@aibos/ui/design/tokens/server";

// Client-reactive tokens
import { clientTokens } from "@aibos/ui/design/tokens/client";

// Token utilities
import { tokenHelpers } from "@aibos/ui/design/utilities/token-helpers";
```

### Theme Support

- **Default Theme** - Tenant-customizable aesthetic
- **WCAG AA Theme** - Legal compliance (fixed)
- **WCAG AAA Theme** - Highest accessibility (fixed)
- **Safe Mode** - Cognitive comfort with WCAG AAA

## 🤖 MCP Features

### Real-time Validation

```tsx
import { useMcpValidation } from "@aibos/ui/mcp";

const { isValid, violations, suggestions } = useMcpValidation(componentCode);
```

### Component Generation

```tsx
import { useMcpComponents } from "@aibos/ui/mcp";

const { generateComponent, validateComponent } = useMcpComponents({
  componentName: "MyButton",
  componentType: "primitive",
});
```

### Constitution Enforcement

- **86 validation rules** across tokens, components, RSC, accessibility
- **Machine-readable governance** with automatic enforcement
- **Design drift prevention** with visual regression testing

## 📖 Documentation

### Core GRCD Documents

- **GRCD-UI.md** - Master UI package GRCD (single source of truth)
- **GRCD-GLOBALS-CSS.md** - CSS variables SSOT layer
- **GRCD-TOKEN-THEME.md** - Theme management layer
- **GRCD-COMPONENTS.md** - Component consumption layer
- **GRCD-ARCHITECTURE-OVERVIEW.md** - Layered architecture overview
- **GRCD-TESTING.md** - Testing infrastructure GRCD

### Status & Planning

- **UI-PACKAGE-STATUS.md** - Consolidated implementation status
- **IMPLEMENTATION-ROADMAP.md** - Clean implementation roadmap

### Reference Documents

- **THEME-ARCHITECTURE.md** - Theme architecture details
- **WCAG-THEME-VALIDATION.md** - WCAG theme validation
- **COMPONENT-MIGRATION-AUDIT.md** - Migration audit (historical)

### Framework Documentation

- **Constitution Framework**: See `constitution/README.md`
- **MCP Integration**: See `mcp/README.md`
- **Component Guidelines**: See individual component README files
- **Design System**: See `src/design/README.md`

## 🔗 Related Packages

- `@aibos/config-eslint` - ESLint configuration
- Next.js 16+ - App Router with Server Components
- React 19+ - Latest React features

---

**Version**: 0.1.0  
**Status**: ✅ Ready for Next.js 16+ MCP Integration  
**Constitution**: v2.2.0 Enterprise-Grade Production-Ready
