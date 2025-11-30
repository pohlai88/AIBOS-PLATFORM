# @aibos/ui

**AI-BOS UI Component Library** - React 19 RSC + Next.js 16 App Router

## 📦 Installation

```bash
pnpm add @aibos/ui
```

## 🏗️ Architecture

```
@aibos/ui
├── server/          # Server Components (14 components)
│   ├── layout/      # Header, Navigation, Sidebar, ContentArea, Footer
│   ├── data/        # AsyncBoundary, ServerTable, DataList, DataGrid
│   └── display/     # StaticCard, InfoPanel, StatBanner, FeatureHighlight, ContentSection
│
├── client/          # Client Components (Layer 2 + Layer 3)
│   ├── compositions/  # Radix UI based (Dialog, Tabs, Accordion, etc.)
│   └── functional/    # Data-driven (DataTable, Charts, Editors, etc.)
│
├── shared/          # Universal Components (40+ primitives)
│   ├── primitives/  # Button, Input, Card, Badge, etc.
│   └── typography/  # Text, Heading, Link, Code
│
└── design/          # Design System
    ├── tokens/      # CSS variables & TypeScript tokens
    └── utilities/   # cn(), token helpers
```

## 📥 Import Patterns

### Server Components (Zero client JS)

```tsx
import { Header, Footer, Navigation } from "@aibos/ui/server";
import { ServerTable, DataList } from "@aibos/ui/server/data";
import { StaticCard, InfoPanel } from "@aibos/ui/server/display";
```

### Client Components (Interactive)

```tsx
import { Dialog, Tabs, Accordion } from "@aibos/ui/client";
import { DataTable, LineChart } from "@aibos/ui/client/functional";
```

### Shared Components (Universal)

```tsx
import { Button, Input, Card, Badge } from "@aibos/ui/shared";
import { Text, Heading } from "@aibos/ui/shared/typography";
```

### Design System

```tsx
import { cn } from "@aibos/ui/design/utilities";
import "@aibos/ui/design/globals.css";
```

## ✅ MCP Validation

All components are validated by:

| MCP Tool       | Purpose                        |
| -------------- | ------------------------------ |
| React MCP      | RSC boundary validation        |
| Theme MCP      | Token compliance               |
| A11y MCP       | WCAG accessibility             |
| Convention MCP | Naming & structure enforcement |

## 📊 Component Summary

| Category | Components | Status       |
| -------- | ---------- | ------------ |
| Server   | 14         | ✅ Certified |
| Client   | 80+        | ✅ Complete  |
| Shared   | 40+        | ✅ Complete  |

## 📄 Documentation

- [Server Components](./src/components/server/README.md)
- [Client Components](./src/components/client/README.md)
- [Shared Components](./src/components/shared/README.md)
- [Implementation Plan](./IMPLEMENTATION-PLAN.md)

## 🔧 Development

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Format
pnpm format
```

## 📜 License

MIT
