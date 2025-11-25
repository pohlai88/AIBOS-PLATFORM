# Client Components

**Official Next.js RSC Architecture - Client Boundary Components**

This directory contains React Client Components that run in the browser and require the
`'use client'` directive.

## 🎯 RSC Architecture Foundation

Based on
[Next.js Official Documentation](https://nextjs.org/docs/app/getting-started/server-and-client-components):

### **When to Use Client Components:**

- ✅ **State and event handlers** - `onClick`, `onChange`, `useState`
- ✅ **Lifecycle logic** - `useEffect`, `useLayoutEffect`
- ✅ **Browser-only APIs** - `localStorage`, `window`, `Navigator.geolocation`
- ✅ **Custom hooks** - Any hook that uses browser APIs or state
- ✅ **Interactive functionality** - User interactions, animations
- ✅ **Context providers** - React context that needs client state

### **Required Patterns:**

```tsx
'use client' // ← MANDATORY at top of file

import { useState } from 'react'

export default function ClientComponent() {
  const [state, setState] = useState(0)

  return <button onClick={() => setState(state + 1)}>{state}</button>
}
```

## 📁 Directory Structure

### `/compositions/` - 🆕 Layer 2 Radix Compositions (MCP Certified)

**Status:** ✅ CERTIFIED - Ready for Implementation **Validation:** Next.js MCP v16.0.4 + React MCP
v2.0.0 **Last Updated:** November 25, 2025

Radix UI-powered compositions that integrate Layer 1 primitives (Typography) with Radix UI
primitives.

**Components:**

- `dialog/` - Modal dialogs with focus trap (Radix Dialog + Layer 1 Typography)
- `popover/` - Floating popovers with positioning (Radix Popover + Layer 1 Typography)
- `tooltip/` - Hover tooltips with keyboard access (Radix Tooltip + Layer 1 Typography)
- `scroll-area/` - Custom scrollbars (Radix ScrollArea)

**Documentation:**

- [LAYER2_ARCHITECTURE_VALIDATION.md](./LAYER2_ARCHITECTURE_VALIDATION.md) - Detailed validation
- [LAYER2_CERTIFICATION_SUMMARY.md](./LAYER2_CERTIFICATION_SUMMARY.md) - MCP certification

**Installation:**

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-tooltip @radix-ui/react-scroll-area
```

### `/interactive/` - Interactive UI Components

Components that handle user interactions, animations, and dynamic behavior.

**Examples:** Modals, Dropdowns, Tooltips, Carousels, Interactive Buttons

### `/forms/` - Form Components

Components for form inputs, validation, submission, and form state management.

**Examples:** Form wrappers, Input fields, Validation components, Form providers

### `/providers/` - Context Providers

React context providers that manage client-side state and need browser APIs.

**Examples:** Theme providers, Auth providers, Shopping cart providers

## 🚨 Critical Rules

### **✅ MUST DO:**

- Add `'use client'` directive at the top of every file
- Use for interactivity, state, event handlers, browser APIs
- Minimize client bundle size - only mark interactive parts as client
- Accept data as props from Server Components (serializable only)

### **❌ NEVER DO:**

- Direct data fetching (use Server Components or data fetching hooks)
- Server-only APIs (database access, file system, etc.)
- Expose secrets or API keys
- Make entire layouts client components unnecessarily

## 🔄 Server ↔ Client Data Flow

```tsx
// ✅ Server Component passes data to Client Component
// app/page.tsx (Server Component)
import ClientButton from './client-button'
import { getData } from '@/lib/data'

export default async function Page() {
  const data = await getData() // Server-side data fetching

  return <ClientButton data={data} /> // Pass serializable data as props
}

// app/client-button.tsx (Client Component)
;('use client')

export default function ClientButton({ data }) {
  const [clicked, setClicked] = useState(false)

  return <button onClick={() => setClicked(true)}>{clicked ? 'Clicked!' : data.label}</button>
}
```

## 🎨 Design System Integration

All Client Components must use the AI-BOS design system:

```tsx
'use client'

import { colorTokens, spacingTokens, componentTokens } from '../../../design/tokens/tokens'
import { cn } from '../../../design/utilities/cn'

export default function ClientComponent() {
  return (
    <div
      className={cn(
        componentTokens.card,
        colorTokens.primarySurface,
        'mcp-client-interactive' // Mark as client component in globals.css
      )}
    >
      Interactive content
    </div>
  )
}
```

## 📋 Implementation Checklist

- [ ] Add `'use client'` directive at top
- [ ] Import only client-safe utilities and tokens
- [ ] Use `mcp-client-*` classes for MCP validation
- [ ] Accept data as props (no direct fetching)
- [ ] Handle loading and error states
- [ ] Add proper TypeScript types
- [ ] Test in both development and production
- [ ] Verify bundle size impact

## 🔗 Related Documentation

- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [React use client directive](https://react.dev/reference/react/use-client)
- [AI-BOS Design System](../../design/README.md)
