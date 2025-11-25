# 🚀 Layer 3 Quick Start Guide

## ✅ Prerequisites Verified

- [x] Layer 1 Typography complete and validated
- [x] Layer 2 Radix Compositions complete and validated
- [x] 16/16 MCP validations passed (100%)
- [x] Zero TypeScript errors
- [x] Zero ESLint errors
- [x] All design tokens in place

**You are ready to start Layer 3!** 🎉

---

## 🎯 Layer 3 Overview

**Layer 3: Complex Patterns** builds on Layers 1 and 2 to create sophisticated, composable UI
patterns for enterprise applications.

### What You Have Available

#### Layer 1 Components (Server Components)

- `Text` - Body copy, labels, captions
- `Heading` - Semantic headings h1-h6

#### Layer 2 Components (Client Components)

- `Dialog` - Modal dialogs with overlay
- `Popover` - Floating content with positioning
- `Tooltip` - Hover hints and labels
- `ScrollArea` - Custom scrollbars

#### Design Tokens (All Available)

- `colorTokens.*` - Color palette
- `typographyTokens.*` - Typography scale
- `spacingTokens.*` - Spacing system
- `radiusTokens.*` - Border radius
- `shadowTokens.*` - Elevation shadows

---

## 📋 Suggested Implementation Order

### Phase 1: Forms (Highest Priority)

**Why First?** Forms are the most commonly used patterns in enterprise apps.

#### 1.1 FormField (Start Here)

```tsx
// Composition of: Input + Label + Error message
// Uses: Layer 1 (Text), Layer 2 (Tooltip for hints)
// Estimated: 2-3 hours
```

**Features:**

- Input wrapper with label
- Error state styling
- Tooltip for help text
- Required indicator
- Disabled state

**Example Usage:**

```tsx
<FormField
  label="Email Address"
  error="Invalid email format"
  hint="We'll never share your email"
  required
>
  <input type="email" />
</FormField>
```

#### 1.2 FormSection

```tsx
// Group related form fields
// Uses: Layer 1 (Heading, Text)
// Estimated: 1-2 hours
```

#### 1.3 FormWizard

```tsx
// Multi-step form with Dialog
// Uses: Layer 2 (Dialog), Layer 1 (Heading, Text)
// Estimated: 3-4 hours
```

---

### Phase 2: Data Display

**Why Second?** Data display is essential for dashboards and admin interfaces.

#### 2.1 Card (Good Starting Point)

```tsx
// Content container with variants
// Uses: Layer 1 (Heading, Text), Design tokens
// Estimated: 2-3 hours
```

**Features:**

- Header, body, footer sections
- Hover states
- Border/shadow variants
- Clickable/interactive variants

#### 2.2 Badge

```tsx
// Status indicators and labels
// Uses: Layer 1 (Text), Design tokens
// Estimated: 1-2 hours
```

#### 2.3 Table

```tsx
// Data tables with ScrollArea
// Uses: Layer 1 (Text), Layer 2 (ScrollArea)
// Estimated: 4-6 hours
```

---

### Phase 3: Navigation

**Why Third?** Navigation patterns benefit from having forms and data display complete.

#### 3.1 Tabs

```tsx
// Content switching interface
// Uses: Layer 1 (Text), Design tokens
// Estimated: 2-3 hours
```

#### 3.2 Accordion

```tsx
// Collapsible content sections
// Uses: Layer 1 (Heading, Text), Design tokens
// Estimated: 2-3 hours
```

---

### Phase 4: Feedback

**Why Fourth?** Feedback components use patterns from Dialog and other components.

#### 4.1 Alert

```tsx
// Inline notifications
// Uses: Layer 1 (Text), Design tokens
// Estimated: 1-2 hours
```

#### 4.2 Toast

```tsx
// Temporary notifications
// Uses: Layer 2 (Dialog patterns), Layer 1 (Text)
// Estimated: 2-3 hours
```

---

### Phase 5: Layout

**Why Last?** Layout components are simpler and can be done anytime.

#### 5.1 Container

```tsx
// Max-width content wrapper
// Uses: Design tokens only
// Estimated: 30 minutes
```

#### 5.2 Stack

```tsx
// Vertical/horizontal spacing utility
// Uses: Design tokens only
// Estimated: 1 hour
```

---

## 🛠️ Component Template

Use this template for all Layer 3 components:

````tsx
/**
 * [ComponentName] Component - Layer 3 Complex Pattern
 *
 * [Brief description of what this component does]
 *
 * @layer Layer 3 - Complex Patterns
 * @category [Client/Server] Components
 * @example
 * ```tsx
 * import { ComponentName } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <ComponentName>
 *       // Example usage
 *     </ComponentName>
 *   );
 * }
 * ```
 */

'use client' // or omit if server component

import * as React from 'react'

// Import from Layer 1
import { Text, Heading } from '@aibos/ui/typography'

// Import from Layer 2
import { Dialog, Tooltip } from '@aibos/ui/compositions'

// Import design tokens
import { colorTokens, typographyTokens } from '@aibos/ui/tokens'
import { cn } from '@aibos/ui/utilities'

// Import types
import type { ComponentNameProps } from './component-name.types'

/**
 * ComponentName - Main component description
 *
 * @mcp-marker [client-component-pattern or server-component-pattern]
 */
export const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Add design token classes
        colorTokens.bg,
        'rounded-md p-4',
        'mcp-layer3-pattern',
        className
      )}
      data-mcp-validated="pending"
      {...props}
    >
      {children}
    </div>
  )
)
ComponentName.displayName = 'ComponentName'

// Export with default
export default ComponentName
````

---

## ✅ MCP Validation Checklist

Before considering a component complete, run all 4 MCP validations:

### 1. RSC Boundary Validation

```bash
# Check if component needs 'use client'
mcp_react-validat_validate_rsc_boundary
```

**Expected:** `valid: true`

### 2. Server/Client Usage Check

```bash
# Verify correct usage of 'use client'
mcp_react-validat_check_server_client_usage
```

**Expected:** `isClientComponent: true` (if using 'use client')

### 3. Import Validation

```bash
# Ensure no browser APIs or client hooks in wrong context
mcp_react-validat_validate_imports
```

**Expected:** `valid: true, hasBrowserAPIs: false`

### 4. Component Quality

```bash
# Check component structure and best practices
mcp_react-validat_validate_react_component
```

**Expected:** `valid: true, errors: []`

---

## 📁 Directory Structure

Create components in this structure:

```
packages/ui/src/components/client/patterns/
├── form-field/
│   ├── form-field.tsx           (main component)
│   ├── form-field.types.ts      (type definitions)
│   ├── form-field.examples.tsx  (usage examples)
│   └── index.ts                 (barrel export)
├── card/
│   ├── card.tsx
│   ├── card.types.ts
│   ├── card.examples.tsx
│   └── index.ts
└── index.ts                     (export all patterns)
```

---

## 🎨 Design Token Usage

Always use design tokens, never hardcoded values:

### ❌ Bad (Hardcoded)

```tsx
className = 'bg-white text-gray-900 rounded-lg shadow-md'
```

### ✅ Good (Design Tokens)

```tsx
className={cn(
  colorTokens.bg,
  colorTokens.text,
  radiusTokens.lg,
  shadowTokens.md
)}
```

---

## 📝 Type Definition Template

```tsx
/**
 * [ComponentName] Component Types
 * Type definitions for the [ComponentName] pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Size variants
 */
export type ComponentSize = 'sm' | 'md' | 'lg'

/**
 * Visual style variants
 */
export type ComponentVariant = 'default' | 'outlined' | 'filled'

/**
 * Props for the ComponentName component.
 */
export interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size variant
   * @default 'md'
   */
  size?: ComponentSize

  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: ComponentVariant

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Children content
   */
  children: React.ReactNode
}
```

---

## 🧪 Example Template

Create at least 3 examples per component:

```tsx
/**
 * [ComponentName] Examples
 *
 * @layer Layer 3 - Complex Patterns
 * @category Examples
 */

'use client'

import React from 'react'
import { ComponentName } from './component-name'

/**
 * Example 1: Basic Usage
 */
export function BasicExample() {
  return (
    <div className="p-8">
      <ComponentName>Basic usage example</ComponentName>
    </div>
  )
}

/**
 * Example 2: Size Variants
 */
export function SizeVariantsExample() {
  return (
    <div className="space-y-4 p-8">
      <ComponentName size="sm">Small</ComponentName>
      <ComponentName size="md">Medium</ComponentName>
      <ComponentName size="lg">Large</ComponentName>
    </div>
  )
}

/**
 * Example 3: Visual Variants
 */
export function VariantsExample() {
  return (
    <div className="space-y-4 p-8">
      <ComponentName variant="default">Default</ComponentName>
      <ComponentName variant="outlined">Outlined</ComponentName>
      <ComponentName variant="filled">Filled</ComponentName>
    </div>
  )
}
```

---

## 🎯 Success Criteria

A Layer 3 component is complete when:

- [x] All 4 MCP validations pass
- [x] Zero TypeScript errors
- [x] Zero ESLint errors
- [x] 100% design token usage
- [x] WCAG 2.1 AA accessibility
- [x] Minimum 3 usage examples
- [x] Full TypeScript type definitions
- [x] JSDoc comments on all exports
- [x] Proper Layer 1/2 integration

---

## 🚀 Start Building!

### Step 1: Choose Your First Component

**Recommendation:** Start with **FormField** - it's practical, uses multiple layers, and has clear
requirements.

### Step 2: Create the Directory Structure

```bash
mkdir -p packages/ui/src/components/client/patterns/form-field
```

### Step 3: Create the Files

1. `form-field.types.ts` - Type definitions
2. `form-field.tsx` - Main component
3. `form-field.examples.tsx` - Usage examples
4. `index.ts` - Barrel export

### Step 4: Implement Using Available Components

- Use `Text` from Layer 1 for labels and errors
- Use `Tooltip` from Layer 2 for help hints
- Use design tokens for all styling

### Step 5: Run MCP Validations

Run all 4 validations and fix any issues

### Step 6: Create Examples

Build at least 3 comprehensive examples

### Step 7: Export from Patterns Index

Add exports to `patterns/index.ts`

---

## 💡 Tips for Success

1. **Start Simple:** Begin with the smallest, simplest component
2. **Reuse Patterns:** Follow the patterns from Layer 2 (Dialog is a good reference)
3. **Test as You Go:** Run MCP validations frequently
4. **Use IntelliSense:** Let TypeScript guide you
5. **Check Layer 2 Examples:** See how Dialog uses Heading and Text
6. **Keep It Composable:** Design components to work together
7. **Document Everything:** Future you will thank present you

---

## 📚 Additional Resources

- **Layer 2 Reference:** See `dialog/dialog.tsx` for best practices
- **MCP Validation:** See `LAYER3_UNLOCK_CERTIFICATION.md` for validation details
- **Architecture Map:** See `ARCHITECTURE_LAYERS.md` for layer relationships
- **Design Tokens:** See `design/tokens/tokens.ts` for available tokens

---

**Ready to build Layer 3? Let's go!** 🚀

**Suggested First Component:** FormField **Estimated Time:** 2-3 hours **Difficulty:** Medium
**Impact:** High (forms are everywhere!)

---

**Last Updated:** November 25, 2025 **Status:** Layer 3 Unlocked and Ready **Next Action:** Create
`form-field` directory and start building!
