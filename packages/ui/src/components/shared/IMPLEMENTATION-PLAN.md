# Shared Components Implementation Plan

**RSC-Compliant Shared Components for AI-BOS Design System**

## 🎯 Architecture Foundation

Based on Next.js official RSC documentation and AI-BOS design system requirements.

### **Core Principles:**

- ✅ **Environment Agnostic** - Work in both Server and Client contexts
- ✅ **No `'use client'` directive** - Let parent determine rendering environment
- ✅ **Design Token Integration** - Use AI-BOS token system exclusively
- ✅ **MCP Validation** - Include MCP compliance markers
- ✅ **Accessibility First** - WCAG 2.1 AA/AAA compliance
- ✅ **TypeScript Strict** - Full type safety and IntelliSense

## 📁 Implementation Structure

```
packages/ui/src/components/shared/
├── primitives/
│   ├── button/
│   │   ├── button.tsx           # Main button component
│   │   ├── button.variants.ts   # Variant system
│   │   ├── button.types.ts      # TypeScript interfaces
│   │   └── index.ts            # Barrel export
│   ├── card/
│   │   ├── card.tsx            # Compound card component
│   │   ├── card.variants.ts    # Card variant system
│   │   ├── card.types.ts       # Card interfaces
│   │   └── index.ts           # Barrel export
│   ├── badge/
│   ├── separator/
│   ├── container/
│   └── index.ts               # All primitives export
└── typography/
    ├── heading/
    │   ├── heading.tsx         # Semantic headings
    │   ├── heading.variants.ts # Typography variants
    │   ├── heading.types.ts    # Heading interfaces
    │   └── index.ts           # Barrel export
    ├── text/
    ├── code/
    ├── list/
    └── index.ts               # All typography export
```

## 🧩 Primitives Implementation Plan

### **Phase 1: Core Primitives (Week 1)**

#### 1.1 Button Component

```tsx
// packages/ui/src/components/shared/primitives/button/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}
```

**Features:**

- ✅ Variant system using design tokens
- ✅ Size system with WCAG touch targets
- ✅ Loading states with spinner
- ✅ Icon support (left/right)
- ✅ Polymorphic `asChild` pattern
- ✅ Full accessibility (ARIA, keyboard navigation)

#### 1.2 Card Component

```tsx
// Compound component pattern
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'interactive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

// Sub-components
;(Card.Header, Card.Content, Card.Footer, Card.Title, Card.Description)
```

**Features:**

- ✅ Compound component architecture
- ✅ Interactive variant for clickable cards
- ✅ Flexible padding system
- ✅ Semantic HTML structure
- ✅ Accessibility landmarks

#### 1.3 Badge Component

```tsx
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}
```

### **Phase 2: Layout Primitives (Week 2)**

#### 2.1 Container Component

```tsx
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}
```

#### 2.2 Separator Component

```tsx
interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}
```

### **Phase 3: Advanced Primitives (Week 3)**

#### 3.1 Avatar Component

#### 3.2 Progress Component

#### 3.3 Skeleton Component

## 📝 Typography Implementation Plan

### **Phase 1: Core Typography (Week 1)**

#### 1.1 Heading Component

```tsx
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'default' | 'muted' | 'subtle' | 'primary' | 'success' | 'warning' | 'danger'
  asChild?: boolean
}
```

**Features:**

- ✅ Semantic heading levels (h1-h6)
- ✅ Visual size independent of semantic level
- ✅ Typography token integration
- ✅ Color variants using design tokens
- ✅ Polymorphic rendering

#### 1.2 Text Component

```tsx
interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'label' | 'legend'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'default' | 'muted' | 'subtle' | 'primary' | 'success' | 'warning' | 'danger'
  align?: 'left' | 'center' | 'right' | 'justify'
  truncate?: boolean
}
```

#### 1.3 Code Component

```tsx
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'inline' | 'block'
  language?: string
  size?: 'sm' | 'md' | 'lg'
}
```

## 🎨 Design Token Integration

### **Token Usage Pattern:**

```tsx
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  shadowTokens,
  typographyTokens,
  componentTokens,
} from '../../../design/tokens/tokens'
import { cn } from '../../../design/utilities/cn'

const buttonVariants = {
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'mcp-shared-component', // MCP validation marker
  ].join(' '),
  variants: {
    variant: {
      primary: [
        colorTokens.primarySurface,
        accessibilityTokens.textOnPrimary,
        shadowTokens.xs,
        'hover:opacity-90',
      ].join(' '),
      // ... other variants
    },
    size: {
      sm: [spacingTokens.sm, typographyTokens.bodySm, radiusTokens.md, 'h-9'].join(' '),
      // ... other sizes
    },
  },
}
```

## 🔧 Template Structure

### **Component Template:**

```tsx
/**
 * [ComponentName] - RSC-Compatible Shared Component
 *
 * Environment: Server & Client Compatible
 * MCP Validation: Enabled
 * Design System: AI-BOS Tokens
 * Accessibility: WCAG 2.1 AA/AAA
 */

import * as React from 'react'
import { colorTokens, spacingTokens, componentTokens } from '../../../../design/tokens/tokens'
import { cn } from '../../../../design/utilities/cn'

// Variant system
const componentVariants = {
  base: 'mcp-shared-component',
  variants: {
    // Use design tokens only
  },
}

// TypeScript interface
export interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  // Event handlers as optional props
  onClick?: () => void
}

// Component implementation
export const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ variant = 'default', size = 'md', className, onClick, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn(
          componentVariants.base,
          componentVariants.variants.variant[variant],
          componentVariants.variants.size[size],
          className
        )}
        onClick={onClick} // Works in client, ignored on server
        {...props}
      />
    )
  }
)

Component.displayName = 'Component'
```

## 📋 Implementation Checklist

### **For Each Component:**

- [ ] Create component directory structure
- [ ] Implement main component with RSC compatibility
- [ ] Create variant system using design tokens
- [ ] Define TypeScript interfaces
- [ ] Add MCP validation markers
- [ ] Implement accessibility features
- [ ] Create barrel exports
- [ ] Write usage documentation
- [ ] Add unit tests (server + client contexts)
- [ ] Validate with React MCP tools

### **Quality Gates:**

- [ ] No `'use client'` directive
- [ ] No React hooks usage
- [ ] No browser APIs
- [ ] Event handlers as optional props only
- [ ] Design tokens used exclusively
- [ ] MCP validation passes
- [ ] Accessibility audit passes
- [ ] TypeScript strict mode passes
- [ ] Works in both Server and Client contexts

## 🚀 Delivery Timeline

**Week 1:** Core Primitives (Button, Card, Badge) **Week 2:** Layout Primitives (Container,
Separator) + Core Typography (Heading, Text) **Week 3:** Advanced Primitives + Typography (Code,
List) + Documentation **Week 4:** Testing, MCP Validation, Final Polish

## 🔗 Dependencies

- `@/design/tokens/tokens` - Design token system
- `@/design/utilities/cn` - Class name utility
- `react` - React 19.2.0+ (RSC compatible)
- `@types/react` - TypeScript definitions

This implementation plan ensures we build RSC-compliant shared components that work perfectly in
both Server and Client contexts while maintaining full design system compliance and MCP validation.
