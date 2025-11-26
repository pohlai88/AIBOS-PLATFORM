# Components

**React 19 RSC + Next.js 16 App Router Architecture**

## Directory Structure

```
components/
├── server/          # Server Components (RSC)
│   ├── layout/      # Header, Navigation, Sidebar, ContentArea, Footer
│   ├── data/        # AsyncBoundary, ServerTable, DataList, DataGrid
│   └── display/     # StaticCard, InfoPanel, StatBanner, etc.
│
├── client/          # Client Components ('use client')
│   ├── compositions/  # Layer 2: Radix UI based
│   └── functional/    # Layer 3: Data-driven components
│
└── shared/          # Universal Components
    ├── primitives/  # Button, Input, Card, Badge, etc.
    └── typography/  # Text, Heading, Link, Code
```

## Import Patterns

```tsx
// Server (zero client JS)
import { Header, Footer } from "@aibos/ui/server";

// Client (interactive)
import { Dialog, Tabs } from "@aibos/ui/client";

// Shared (universal)
import { Button, Input } from "@aibos/ui/shared";
```

## Component Categories

| Category | Location         | Use Case                    |
| -------- | ---------------- | --------------------------- |
| Server   | `./server/`      | Static content, data fetch  |
| Client   | `./client/`      | Interactive, state, hooks   |
| Shared   | `./shared/`      | Works in both environments  |

## MCP Validation

All components pass:
- RSC boundary validation
- Token compliance
- WCAG accessibility
- Naming conventions
