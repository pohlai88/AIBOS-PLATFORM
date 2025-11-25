# AI-BOS Component Architecture Foundation

**Official Next.js RSC Architecture Implementation - Never Drift Again**

This document establishes the immutable foundation for all AI-BOS components, ensuring perfect
alignment with Next.js RSC architecture and preventing architectural drift.

## 🎯 Architecture Principles

### **1. RSC Compliance (Non-Negotiable)**

Based on
[Next.js Official Documentation](https://nextjs.org/docs/app/getting-started/server-and-client-components):

- ✅ **Server Components** - Default, no `'use client'`, async allowed, no hooks
- ✅ **Client Components** - Require `'use client'`, hooks allowed, browser APIs allowed
- ✅ **Shared Components** - Environment agnostic, no `'use client'`, no hooks, event handlers as
  props

### **2. MCP Validation (Mandatory)**

Every component must include MCP compliance markers:

- `data-mcp-validated="true"`
- `data-constitution-compliant="[component-type]"`
- CSS classes: `mcp-server-safe`, `mcp-client-interactive`, `mcp-shared-component`

### **3. Design System Integration (Exclusive)**

All styling must use AI-BOS design tokens exclusively:

```tsx
import {
  colorTokens,
  spacingTokens,
  typographyTokens,
  componentTokens,
} from '@/design/tokens/tokens'
```

## 📁 Directory Structure (Immutable)

```
packages/ui/src/components/
├── shared/              # Environment agnostic (NO 'use client')
│   ├── primitives/      # Basic building blocks
│   │   ├── button/      # Button primitive
│   │   ├── card/        # Card primitive
│   │   ├── badge/       # Badge primitive
│   │   └── _template.tsx # RSC shared template
│   ├── typography/      # Text components
│   │   ├── heading/     # Semantic headings
│   │   ├── text/        # Text components
│   │   └── _template.tsx # Typography template
│   └── IMPLEMENTATION-PLAN.md
├── server/              # Server-only (NO 'use client')
│   ├── data/           # Data fetching components
│   ├── display/        # Static display components
│   ├── layout/         # Server layouts
│   └── _template.tsx   # Server template
├── client/             # Client-only (REQUIRES 'use client')
│   ├── interactive/    # Interactive components
│   ├── forms/          # Form components
│   ├── providers/      # Context providers
│   └── _template.tsx   # Client template
└── ARCHITECTURE-FOUNDATION.md # This file
```

## 🚨 Immutable Rules (Never Break These)

### **Shared Components (`/shared/`)**

```tsx
// ✅ CORRECT - RSC Shared Component
interface SharedButtonProps {
  onClick?: () => void // Optional - parent provides
  variant?: 'primary' | 'secondary'
}

export function SharedButton({ onClick, variant, children }: SharedButtonProps) {
  return (
    <button
      onClick={onClick} // Works in client, ignored on server
      className={cn(variants[variant], 'mcp-shared-component')}
    >
      {children}
    </button>
  )
}
```

### **Server Components (`/server/`)**

```tsx
// ✅ CORRECT - Server Component
export default async function ServerComponent({ userId }: { userId: string }) {
  const data = await fetchUserData(userId) // Server-side data fetching

  return (
    <div className={cn(colorTokens.bgElevated, 'mcp-server-safe')}>
      <h1>{data.name}</h1>
    </div>
  )
}
```

### **Client Components (`/client/`)**

```tsx
// ✅ CORRECT - Client Component
'use client'

export function ClientComponent() {
  const [state, setState] = useState(0) // Hooks allowed

  return (
    <button
      onClick={() => setState(state + 1)} // Event handlers allowed
      className={cn(colorTokens.primarySurface, 'mcp-client-interactive')}
    >
      {state}
    </button>
  )
}
```

## 🔧 Template Usage Guide

### **1. Shared Component Template**

```bash
# Copy template
cp packages/ui/src/components/shared/primitives/_template.tsx \
   packages/ui/src/components/shared/primitives/my-component.tsx

# Replace placeholders
[COMPONENT_NAME] → MyComponent
[COMPONENT_NAME_LOWER] → myComponent
[component-name] → my-component
```

### **2. Client Component Template**

```bash
# Copy template
cp packages/ui/src/components/client/_template.tsx \
   packages/ui/src/components/client/interactive/my-component.tsx

# Replace placeholders
[CLIENT_COMPONENT] → MyClientComponent
[CLIENT_COMPONENT_LOWER] → myClientComponent
[client-component] → my-client-component
```

### **3. Server Component Template**

```bash
# Copy template
cp packages/ui/src/components/server/_template.tsx \
   packages/ui/src/components/server/display/my-component.tsx

# Replace placeholders
[SERVER_COMPONENT] → MyServerComponent
[SERVER_COMPONENT_LOWER] → myServerComponent
[server-component] → my-server-component
```

## 🎨 Design Token Integration (Mandatory)

### **Required Imports**

```tsx
import {
  colorTokens, // Colors: bg, text, border
  spacingTokens, // Spacing: sm, md, lg
  typographyTokens, // Typography: bodySm, headingLg
  radiusTokens, // Border radius: sm, md, lg
  shadowTokens, // Shadows: xs, sm, md
  componentTokens, // Presets: buttonPrimary, card
  accessibilityTokens, // A11y: textOnPrimary, textOnDanger
} from '@/design/tokens/tokens'
import { cn } from '@/design/utilities/cn'
```

### **Variant System Pattern**

```tsx
const componentVariants = {
  base: [
    'relative transition-all duration-200',
    'mcp-[component-type]', // Required MCP marker
  ].join(' '),
  variants: {
    variant: {
      primary: [
        colorTokens.primarySurface,
        accessibilityTokens.textOnPrimary,
        shadowTokens.xs,
      ].join(' '),
    },
    size: {
      md: [spacingTokens.md, typographyTokens.bodyMd, radiusTokens.md].join(' '),
    },
  },
}
```

## 📋 Component Checklist (Every Component Must Pass)

### **Shared Component Checklist**

- [ ] NO `'use client'` directive
- [ ] NO React hooks (`useState`, `useEffect`, etc.)
- [ ] NO browser APIs (`window`, `localStorage`, etc.)
- [ ] Event handlers as optional props only
- [ ] Design tokens used exclusively
- [ ] `mcp-shared-component` class included
- [ ] Works in both Server and Client contexts
- [ ] TypeScript interfaces defined
- [ ] Accessibility compliant (WCAG 2.1 AA)

### **Client Component Checklist**

- [ ] `'use client'` directive at top
- [ ] React hooks allowed and used appropriately
- [ ] Browser APIs used safely
- [ ] Event handlers implemented
- [ ] Design tokens used exclusively
- [ ] `mcp-client-interactive` class included
- [ ] Analytics integration ready
- [ ] Loading and error states handled
- [ ] Accessibility compliant with interactions

### **Server Component Checklist**

- [ ] NO `'use client'` directive
- [ ] NO React hooks
- [ ] NO browser APIs
- [ ] NO event handlers
- [ ] Async operations allowed (`await`, `fetch`)
- [ ] Design tokens used exclusively
- [ ] `mcp-server-safe` class included
- [ ] SEO optimized
- [ ] Server-side data processing
- [ ] Error boundaries implemented

## 🔒 Architectural Guarantees

### **1. RSC Compliance**

Following these templates guarantees:

- ✅ Server Components render on server
- ✅ Client Components hydrate properly
- ✅ Shared Components work in both contexts
- ✅ No RSC boundary violations
- ✅ Optimal performance and SEO

### **2. MCP Validation**

All components include:

- ✅ MCP compliance markers
- ✅ Constitution validation hooks
- ✅ Design system enforcement
- ✅ Accessibility validation
- ✅ Performance monitoring

### **3. Design System Consistency**

Enforced through:

- ✅ Exclusive token usage
- ✅ Consistent variant patterns
- ✅ Standardized prop interfaces
- ✅ Unified accessibility patterns
- ✅ Predictable component APIs

## 🚀 Implementation Workflow

### **1. Choose Component Type**

- **Interactive/Stateful** → Client Component (`/client/`)
- **Data Fetching/Static** → Server Component (`/server/`)
- **Reusable Primitive** → Shared Component (`/shared/`)

### **2. Copy Appropriate Template**

- Use the exact template for your component type
- Replace all placeholder values
- Follow naming conventions

### **3. Implement Component Logic**

- Follow the template structure exactly
- Use only allowed APIs for each type
- Include all required MCP markers

### **4. Validate Implementation**

- Run React MCP validation tools
- Test in both development and production
- Verify accessibility compliance
- Check design token usage

### **5. Document and Export**

- Add proper TypeScript interfaces
- Include usage examples
- Export from appropriate index files
- Update component documentation

## 🔗 Related Documentation

- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [AI-BOS Design System](../design/README.md)
- [Shared Components Implementation Plan](./shared/IMPLEMENTATION-PLAN.md)
- [Component READMEs](./client/README.md)

---

**This architecture foundation is immutable. Any changes must be approved through the MCP validation
process and updated across all templates simultaneously to prevent drift.**
