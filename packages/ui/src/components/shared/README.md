# Shared Components

**Official Next.js RSC Architecture - Environment-Agnostic Components**

This directory contains components that work seamlessly in both Server and Client Component
environments, providing maximum flexibility and reusability.

## 🎯 RSC Architecture Foundation

Based on
[Next.js Official Documentation](https://nextjs.org/docs/app/getting-started/server-and-client-components):

### **When to Use Shared Components:**

- ✅ **Reusable UI primitives** - Basic building blocks used everywhere
- ✅ **Environment-agnostic** - Work in both server and client contexts
- ✅ **Minimize client JavaScript** - No unnecessary client-side code
- ✅ **Consistent base components** - Foundation for complex components
- ✅ **Composition patterns** - Building blocks for larger components

### **Required Patterns:**

```tsx
// NO 'use client' directive - Environment agnostic

interface SharedButtonProps {
  children: React.ReactNode
  onClick?: () => void // Optional - parent decides
  variant?: 'primary' | 'secondary'
  className?: string
}

export function SharedButton({
  children,
  onClick,
  variant = 'primary',
  className,
}: SharedButtonProps) {
  return (
    <button
      onClick={onClick} // Works in client, ignored on server
      className={cn(buttonVariants[variant], className)}
    >
      {children}
    </button>
  )
}
```

## 📁 Directory Structure

### `/primitives/` - Basic UI Building Blocks

Fundamental components that form the foundation of the design system.

**Examples:** Buttons, Cards, Badges, Separators, Containers, Layout primitives

### `/typography/` - Text and Content Components

Components for displaying text, headings, and formatted content with consistent styling.

**Examples:** Headings, Paragraphs, Text styles, Code blocks, Lists

## 🚨 Critical Rules

### **✅ MUST DO:**

- NO `'use client'` directive - Let parent environment determine rendering
- Accept event handlers as optional props - `onClick?: () => void`
- Use only server-safe utilities and design tokens
- Return pure JSX - no side effects or state
- Support both server and client rendering contexts
- Use semantic HTML elements for accessibility

### **❌ NEVER DO:**

- Browser APIs (`window`, `localStorage`, `document`, etc.)
- React hooks (`useState`, `useEffect`, `useCallback`, etc.)
- Direct event handling - accept as props instead
- Client-specific logic or state management
- Environment-specific code

## 🔄 Universal Rendering Pattern

```tsx
// ✅ Works in both Server and Client Components

// Server Component usage
// app/page.tsx (Server Component)
import { SharedCard } from '@/components/shared/primitives/card'

export default function ServerPage() {
  return (
    <SharedCard variant="elevated">
      <h1>Server-rendered content</h1>
    </SharedCard>
  )
}

// Client Component usage
// app/interactive.tsx (Client Component)
;('use client')

import { SharedCard } from '@/components/shared/primitives/card'
import { useState } from 'react'

export default function ClientComponent() {
  const [clicked, setClicked] = useState(false)

  return (
    <SharedCard
      variant="interactive"
      onClick={() => setClicked(true)} // Event handler provided by client
    >
      <p>{clicked ? 'Clicked!' : 'Click me'}</p>
    </SharedCard>
  )
}
```

## 🎨 Design System Integration

All Shared Components must use the AI-BOS design system tokens and utilities:

```tsx
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  componentTokens,
} from '../../../design/tokens/tokens'
import { cn } from '../../../design/utilities/cn'

// Variant system using design tokens
const cardVariants = {
  base: [componentTokens.card, 'relative overflow-hidden transition-all duration-200'].join(' '),
  variants: {
    variant: {
      default: `${colorTokens.bgElevated} ${colorTokens.border}`,
      elevated: `${colorTokens.bgElevated} ${shadowTokens.md}`,
      interactive: `${colorTokens.bgElevated} cursor-pointer hover:${shadowTokens.lg}`,
    },
  },
}

export function SharedCard({ variant = 'default', className, onClick, children }: SharedCardProps) {
  return (
    <div
      className={cn(
        cardVariants.base,
        cardVariants.variants.variant[variant],
        'mcp-shared-component', // MCP validation marker
        className
      )}
      onClick={onClick} // Optional - works in client, ignored on server
    >
      {children}
    </div>
  )
}
```

## 🔧 Component Composition Patterns

### **Compound Components:**

```tsx
// Card with sub-components
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter
}

// Usage in both environments
<Card.Root>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
</Card.Root>
```

### **Polymorphic Components:**

```tsx
interface PolymorphicProps<T extends React.ElementType> {
  as?: T
  children: React.ReactNode
}

export function Polymorphic<T extends React.ElementType = 'div'>({
  as,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || 'div'

  return <Component {...props}>{children}</Component>
}

// Usage
<Polymorphic as="section">Section content</Polymorphic>
<Polymorphic as="article">Article content</Polymorphic>
```

## 📋 Implementation Checklist

- [ ] NO `'use client'` directive
- [ ] Accept event handlers as optional props
- [ ] Use only server-safe design tokens and utilities
- [ ] Add `mcp-shared-component` class for validation
- [ ] Support semantic HTML elements
- [ ] Provide proper TypeScript interfaces
- [ ] Test in both server and client contexts
- [ ] Document usage examples for both environments
- [ ] Implement proper accessibility patterns

## 🧪 Testing Strategy

```tsx
// Test in Server Component context
import { render } from '@testing-library/react'
import { SharedButton } from './shared-button'

// Server rendering test
test('renders without client features', () => {
  const { container } = render(<SharedButton>Server Button</SharedButton>)
  expect(container.firstChild).toMatchSnapshot()
})

// Client rendering test
test('handles client interactions', () => {
  const handleClick = jest.fn()
  const { getByRole } = render(<SharedButton onClick={handleClick}>Client Button</SharedButton>)

  fireEvent.click(getByRole('button'))
  expect(handleClick).toHaveBeenCalled()
})
```

## 🔗 Related Documentation

- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [AI-BOS Design System](../../design/README.md)
- [Component Architecture Guide](../README.md)
