# 🧾 GRCD — Components Layer — v1.0.0

**Version:** 1.0.0  
**Status:** Active (MCP-Governed Template & Reference)  
**Last Updated:** 2025-01-27  
**Owner:** Frontend Team, Component Library Team

> **Purpose of this GRCD**
>
> This GRCD is the **single source of truth** for the Components layer - how components consume design tokens through the theme layer. It establishes the **correct patterns** to prevent direct token imports and ensure all components respect the theme-first architecture.
>
> **Key Anti-Drift Mechanisms:**
>
> - Component token usage patterns (Section 3.1 - CRITICAL)
> - RSC boundary enforcement (Section 3.2 - CRITICAL)
> - No direct token imports (Section 4.1 - CRITICAL)
> - Theme-first consumption (Section 4.2 - CRITICAL)

---

## 1. Purpose & Identity

**Component Name:** `Components Layer` (Server/Client/Shared Components)

**Domain:** `UI Component Library` (Component Implementation)

### 1.1 Purpose

**Purpose Statement:**

> The Components layer is the **consumer layer** of the design system. Components consume design tokens through the theme layer (Tailwind classes referencing CSS variables), never directly importing from `tokens.ts`. This ensures all components respect tenant customization, WCAG themes, and safe mode through the theme-first architecture.

**Philosophical Foundation:**

1. **Components Consume Theme:** Components use Tailwind classes that reference CSS variables.
2. **No Direct Imports:** Components MUST NOT import tokens directly from `tokens.ts`.
3. **Theme-First:** All styling flows through theme layer (globals.css → ThemeProvider → Components).
4. **RSC Boundaries:** Clear separation of Server/Client/Shared components.

### 1.2 Identity

- **Role:** `Design System Consumer` – Components that consume design tokens through theme layer.

- **Scope:**
  - All UI components (primitives, compositions, layouts).
  - Server Components (static, data-fetching).
  - Client Components (interactive, stateful).
  - Shared Components (works in both environments).

- **Boundaries:**
  - Does **NOT** define design tokens (globals.css does).
  - Does **NOT** control theme (ThemeProvider does).
  - Does **NOT** import tokens directly (uses Tailwind classes).

- **Non-Responsibility:**
  - `MUST NOT` define CSS variables.
  - `MUST NOT` import tokens from `tokens.ts`.
  - `MUST NOT` use hardcoded design values.
  - `MUST NOT` bypass theme layer.

### 1.3 Non-Negotiables (Constitutional Principles)

**Constitutional Principles:**

- `MUST NOT` import tokens directly from `tokens.ts`.
- `MUST` use Tailwind classes that reference CSS variables.
- `MUST` respect RSC boundaries (Server/Client/Shared).
- `MUST` ensure ThemeProvider wraps application.
- `MUST` validate token usage via MCP.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID  | Requirement                                                    | Priority (MUST/SHOULD/MAY) | Status (✅/⚠️/❌/⚪) | Notes                                      |
| --- | -------------------------------------------------------------- | -------------------------- | -------------------- | ------------------------------------------ |
| F-1 | Components MUST use Tailwind classes referencing CSS variables | MUST                       | ✅                   | **COMPLETE: All 37 components migrated**   |
| F-2 | Components MUST NOT import tokens directly from tokens.ts      | MUST                       | ✅                   | **COMPLETE: No direct imports remaining**  |
| F-3 | Components MUST respect RSC boundaries                         | MUST                       | ✅                   | Clear Server/Client/Shared separation      |
| F-4 | Components MUST NOT use hardcoded design values                | MUST                       | ✅                   | **COMPLETE: All values use CSS variables** |
| F-5 | Components MUST support theme customization                    | MUST                       | ✅                   | **COMPLETE: Theme-first architecture**     |
| F-6 | Components MUST support WCAG themes                            | MUST                       | ✅                   | **COMPLETE: WCAG themes work correctly**   |
| F-7 | Components MUST support safe mode                              | MUST                       | ✅                   | **COMPLETE: Safe mode works correctly**    |
| F-8 | Components SHOULD use theme hooks for dynamic values           | SHOULD                     | ✅                   | useThemeTokens, useMcpTheme                |
| F-9 | Components MUST validate token usage via MCP                   | MUST                       | ✅                   | MCP validation tools implemented           |

> **Migration Status:**
>
> - ✅ **All 37 components migrated (100%)**
> - ✅ **Shared Primitives:** 31/31 migrated
> - ✅ **Typography Components:** 2/2 migrated
> - ✅ **Client Compositions:** 4/4 migrated
> - ✅ **Theme-first architecture:** Fully functional

---

## 3. Architecture & Design Patterns

### 3.1 Component Token Usage Patterns (CRITICAL)

> **THIS IS THE MOST CRITICAL SECTION** - Establishes correct component token consumption.

#### 3.1.1 Correct Pattern (Tailwind Classes)

```tsx
// ✅ CORRECT - Component uses Tailwind classes
export const Button = ({ variant = "default" }) => {
  return (
    <button
      className={cn(
        "bg-bg-elevated", // ✅ References --color-bg-elevated (theme-controlled)
        "text-fg", // ✅ References --color-fg (theme-controlled)
        "px-4 py-2", // ✅ Static spacing (theme-independent)
        "rounded-lg", // ✅ References --radius-lg (theme-controlled)
        "shadow-sm" // ✅ References --shadow-sm (theme-controlled)
      )}
    >
      Click me
    </button>
  );
};
```

**How it works:**

1. Tailwind generates: `.bg-bg-elevated { background-color: var(--color-bg-elevated); }`
2. ThemeProvider controls `--color-bg-elevated` via CSS selectors
3. Components automatically respect theme (tenant, WCAG, safe mode)

#### 3.1.2 Incorrect Pattern (Direct Token Import)

```tsx
// ❌ WRONG - Direct token import bypasses theme layer
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
} from "../../../design/tokens/tokens";

export const Button = ({ variant = "default" }) => {
  return (
    <button
      className={cn(
        colorTokens.bgElevated, // ❌ Bypasses ThemeProvider
        colorTokens.text,
        spacingTokens.md,
        radiusTokens.lg
      )}
    >
      Click me
    </button>
  );
};
```

**Why it's wrong:**

- `tokens.ts` provides static Tailwind class names (`"bg-bg-elevated"`)
- These classes reference CSS variables (`--color-bg-elevated`)
- But components bypass ThemeProvider that controls those CSS variables
- ThemeProvider can't inject tenant overrides, WCAG themes, or safe mode

#### 3.1.3 Component Variants with Theme

```tsx
// ✅ CORRECT - Variants use Tailwind classes
export const Button = ({ variant = "default" }) => {
  const variantClasses = {
    default: "bg-bg-elevated text-fg border border-border",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  return (
    <button className={cn(variantClasses[variant], "px-4 py-2 rounded-lg")}>
      Click me
    </button>
  );
};
```

### 3.2 RSC Boundary Patterns

#### 3.2.1 Server Components

```tsx
// ✅ CORRECT - Server Component (no 'use client')
export async function UserCard({ userId }: { userId: string }) {
  const user = await getUser(userId); // ✅ Direct data fetching

  return (
    <div className="bg-bg-elevated text-fg rounded-lg p-4">
      {/* ✅ Uses Tailwind classes, no token imports */}
      <h2 className="text-lg font-semibold">{user.name}</h2>
      <p className="text-fg-muted">{user.email}</p>
    </div>
  );
}
```

**Rules:**

- No `'use client'` directive
- No React hooks
- No event handlers
- Use Tailwind classes (not token imports)

#### 3.2.2 Client Components

```tsx
"use client"; // ✅ Required directive

import { useState } from "react";
import { useThemeTokens } from "@aibos/ui/mcp/providers";

export function Counter() {
  const [count, setCount] = useState(0);
  const theme = useThemeTokens(); // ✅ Theme hook for dynamic logic

  return (
    <button
      onClick={() => setCount(count + 1)} // ✅ Event handlers
      className="bg-bg-elevated text-fg px-4 py-2 rounded-lg"
      // ✅ Uses Tailwind classes, no token imports
    >
      Count: {count}
    </button>
  );
}
```

**Rules:**

- `'use client'` directive required
- React hooks allowed
- Event handlers allowed
- Use Tailwind classes (not token imports)
- Theme hooks for dynamic values

#### 3.2.3 Shared Components

```tsx
// ✅ CORRECT - Shared Component (no 'use client')
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
      className={cn(
        "bg-bg-elevated text-fg px-4 py-2 rounded-lg",
        // ✅ Uses Tailwind classes, no token imports
        variant === "primary" && "bg-primary text-primary-foreground"
      )}
    >
      {children}
    </button>
  );
}
```

**Rules:**

- No `'use client'` directive
- Accept event handlers as optional props
- Use Tailwind classes (not token imports)
- Works in both Server and Client contexts

### 3.3 Component Directory Structure

```
packages/ui/src/components/
├── server/                      # Server Components only
│   ├── data/                    # Data-fetching components
│   ├── display/                 # Static display components
│   └── layout/                  # Layout components
├── client/                      # Client Components only
│   ├── interactive/             # Interactive UI components
│   ├── forms/                   # Form components
│   ├── compositions/            # Complex compositions (Dialog, Tooltip, etc.)
│   └── providers/               # Client context providers
└── shared/                      # Works in both environments
    ├── primitives/              # Basic UI building blocks (Button, Input, etc.)
    └── typography/              # Text components (Text, Heading)
```

### 3.4 Advanced Composition Patterns

#### 3.4.1 Compound Component Pattern

**Use Case:** Complex components with multiple related sub-components (Dialog, Accordion, Tabs)

```tsx
// ✅ CORRECT - Compound component pattern
"use client";

import { createContext, useContext } from "react";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function Dialog({ children, open, onOpenChange }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children }) {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogTrigger must be used within Dialog");

  return <button onClick={() => context.onOpenChange(true)}>{children}</button>;
}

export function DialogContent({ children }) {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within Dialog");

  if (!context.open) return null;

  return (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  );
}

// Usage:
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>Content</DialogContent>
</Dialog>;
```

#### 3.4.2 Polymorphic Component Pattern

**Use Case:** Components that can render as different HTML elements

```tsx
// ✅ CORRECT - Polymorphic component
import { ElementType, ComponentPropsWithoutRef } from 'react'

type PolymorphicProps<E extends ElementType> = {
  as?: E
  children: React.ReactNode
} & ComponentPropsWithoutRef<E>

export function Box<E extends ElementType = 'div'>({
  as,
  children,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Component = as || 'div'

  return (
    <Component className={cn('bg-bg-elevated', className)} {...props}>
      {children}
    </Component>
  )
}

// Usage:
<Box as="section">Content</Box>
<Box as="article">Article</Box>
<Box>Default div</Box>
```

#### 3.4.3 Render Props Pattern

**Use Case:** Components that provide data or functionality to children

```tsx
// ✅ CORRECT - Render props pattern
"use client";

interface ToggleProps {
  children: (props: { on: boolean; toggle: () => void }) => React.ReactNode;
}

export function Toggle({ children }: ToggleProps) {
  const [on, setOn] = useState(false);
  const toggle = () => setOn(!on);

  return <>{children({ on, toggle })}</>;
}

// Usage:
<Toggle>
  {({ on, toggle }) => (
    <button onClick={toggle} className={on ? "bg-primary" : "bg-secondary"}>
      {on ? "On" : "Off"}
    </button>
  )}
</Toggle>;
```

#### 3.4.4 Context-Based Composition

**Use Case:** Shared state across component tree

```tsx
// ✅ CORRECT - Context-based composition
"use client";

import { createContext, useContext, useState } from "react";

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function Accordion({ children, multiple = false }) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      if (multiple) {
        return prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className="space-y-2">{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ id, children }) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");

  const isOpen = context.openItems.includes(id);

  return (
    <div>
      <button onClick={() => context.toggleItem(id)}>{children}</button>
      {isOpen && <div>Content</div>}
    </div>
  );
}
```

### 3.5 Form Validation Patterns

#### 3.5.1 Validation Strategy

**Approach:** Client-side validation with server-side verification

```tsx
// ✅ CORRECT - Form validation pattern
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Server-side validation happens here
    await submitForm(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="text-danger">
            {errors.email.message}
          </span>
        )}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
```

#### 3.5.2 Error Message Patterns

**Accessibility Requirements:**

- Associate errors with form fields using `aria-describedby`
- Use `role="alert"` for error messages
- Use `aria-invalid` on invalid fields

```tsx
// ✅ CORRECT - Accessible error messages
export function FormField({ label, error, children, id }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <span
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-danger text-sm"
        >
          {error}
        </span>
      )}
    </div>
  );
}
```

#### 3.5.3 Form State Management

**Pattern:** Controlled components with React Hook Form

```tsx
// ✅ CORRECT - Controlled form components
"use client";

export function ControlledInput({ value, onChange, error, ...props }) {
  return (
    <div>
      <input
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        className={cn(
          "bg-bg-elevated text-fg border border-border rounded-lg px-4 py-2",
          error && "border-danger"
        )}
        {...props}
      />
      {error && (
        <span role="alert" className="text-danger text-sm">
          {error}
        </span>
      )}
    </div>
  );
}
```

### 3.6 Loading States & Skeleton Patterns

#### 3.6.1 Loading State Components

```tsx
// ✅ CORRECT - Loading state component
export function LoadingSpinner({ size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-border border-t-primary",
        sizeClasses[size]
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

#### 3.6.2 Skeleton Screen Patterns

```tsx
// ✅ CORRECT - Skeleton component
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse bg-bg-muted rounded-lg", className)}
      aria-label="Loading content"
      {...props}
    />
  );
}

// Usage:
export function UserCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
```

#### 3.6.3 Suspense Boundary Patterns

```tsx
// ✅ CORRECT - Suspense with fallback
import { Suspense } from "react";
import { UserCard } from "./user-card";
import { UserCardSkeleton } from "./user-card-skeleton";

export function UserProfile({ userId }) {
  return (
    <Suspense fallback={<UserCardSkeleton />}>
      <UserCard userId={userId} />
    </Suspense>
  );
}
```

#### 3.6.4 Progressive Loading

```tsx
// ✅ CORRECT - Progressive loading
"use client";

import { useState, useEffect } from "react";

export function ProgressiveImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative">
      {!loaded && !error && <Skeleton className="absolute inset-0" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
```

---

## 4. Token Consumption Rules (CRITICAL)

### 4.1 Forbidden Patterns

**1. Direct Token Imports:**

```tsx
// ❌ FORBIDDEN - Direct token import
import { colorTokens, spacingTokens, radiusTokens } from '../../../design/tokens/tokens'

export const Button = () => {
  return <button className={colorTokens.bgElevated}>
}
```

**2. Hardcoded Values:**

```tsx
// ❌ FORBIDDEN - Hardcoded design values
<button className="bg-blue-600 text-white px-4 py-2">
```

**3. Inline Styles with Hardcoded Colors:**

```tsx
// ❌ FORBIDDEN - Hardcoded colors in inline styles
<button style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
```

### 4.2 Allowed Patterns

**1. Tailwind Classes (Recommended):**

```tsx
// ✅ ALLOWED - Tailwind classes reference CSS variables
<button className="bg-bg-elevated text-fg px-4 py-2 rounded-lg">
```

**2. Theme Hooks (For Dynamic Values):**

```tsx
"use client";
import { useThemeTokens } from "@aibos/ui/mcp/providers";

export const Button = () => {
  const theme = useThemeTokens();
  // Use theme context for dynamic logic
  // Still use Tailwind classes for styling
  return <button className="bg-bg-elevated text-fg">Click me</button>;
};
```

**3. CSS Variables Directly (Rare Cases):**

```tsx
// ✅ ALLOWED - CSS variables in inline styles (rare)
<div style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
```

---

## 5. Component Migration Guide

### 5.1 Migration Steps

**Step 1: Remove Direct Token Imports**

```tsx
// ❌ BEFORE
import { colorTokens } from "../../../design/tokens/tokens";

// ✅ AFTER
// Remove import entirely
```

**Step 2: Replace with Tailwind Classes**

```tsx
// ❌ BEFORE
<button className={colorTokens.bgElevated}>

// ✅ AFTER
<button className="bg-bg-elevated">
```

**Step 3: Verify Theme Works**

- Ensure ThemeProvider wraps application
- Test tenant customization
- Test WCAG themes
- Test safe mode

### 5.2 Migration Checklist

- [ ] Remove all `import { colorTokens } from 'tokens.ts'` statements
- [ ] Replace `colorTokens.*` with Tailwind classes
- [ ] Replace `spacingTokens.*` with Tailwind spacing utilities
- [ ] Replace `radiusTokens.*` with Tailwind radius utilities
- [ ] Replace `shadowTokens.*` with Tailwind shadow utilities
- [ ] Remove hardcoded design values
- [ ] Verify ThemeProvider wraps application
- [ ] Test theme switching works
- [ ] Run MCP validation

---

## 6. Master Control Prompt (MCP) Profile

### 6.1 MCP Location

- **File:** `/mcp/ui-components.mcp.json` ✅ **CREATED**
- **Version:** `1.0.0`
- **Last Updated:** `2025-01-27`
- **Status:** ✅ Active and validated

### 6.2 MCP Constraints

```json
{
  "component": "components",
  "version": "1.0.0",
  "intent": "Generate UI components following GRCD-COMPONENTS.md, enforcing theme-first architecture and RSC boundaries",
  "constraints": [
    "MUST follow GRCD-COMPONENTS.md structure",
    "MUST NOT import tokens directly from tokens.ts",
    "MUST use Tailwind classes that reference CSS variables",
    "MUST respect RSC boundaries (Server/Client/Shared)",
    "MUST NOT use hardcoded design values",
    "MUST ensure ThemeProvider wraps application",
    "MUST validate component token usage via MCP",
    "MUST follow directory structure (server/client/shared)"
  ],
  "input_sources": [
    "GRCD-COMPONENTS.md (packages/ui/GRCD-COMPONENTS.md)",
    "GRCD-TOKEN-THEME.md (packages/ui/GRCD-TOKEN-THEME.md)",
    "GRCD-GLOBALS-CSS.md (packages/ui/GRCD-GLOBALS-CSS.md)",
    "globals.css (packages/ui/src/design/tokens/globals.css)",
    "existing components in packages/ui/src/components/"
  ],
  "output_targets": {
    "code": "packages/ui/src/components/",
    "tests": "packages/ui/src/components/**/*.test.tsx"
  }
}
```

### 6.3 MCP Normative Requirements

- `COMP-MCP-1`: Components MUST NOT import tokens directly from `tokens.ts`.
- `COMP-MCP-2`: Components MUST use Tailwind classes referencing CSS variables.
- `COMP-MCP-3`: Components MUST respect RSC boundaries (Server/Client/Shared).
- `COMP-MCP-4`: MCP MUST validate component token usage (flag direct imports).
- `COMP-MCP-5`: Components MUST NOT use hardcoded design values.

---

## 7. Contracts & Schemas

### 7.1 Component Token Usage Contract

**Contract:** Components MUST consume tokens through theme layer, never directly.

**Schema:**

```typescript
// ✅ CORRECT - Component uses Tailwind classes
type ComponentTokenUsage = {
  pattern: "tailwind-classes" | "theme-hooks" | "css-variables";
  source: "globals.css"; // CSS variables defined here
  theme: "ThemeProvider"; // ThemeProvider controls CSS variables
  validation: "MCP"; // MCP validates token usage
};

// ❌ FORBIDDEN - Direct token import
type ForbiddenTokenUsage = {
  pattern: "direct-import";
  source: "tokens.ts"; // NEVER import from here in components
  violation: "bypasses-theme-layer";
};
```

---

## 8. Error Handling & Recovery

### 8.1 Error Taxonomy

| Error Class           | When Thrown                                      | Recovery Strategy                       |
| --------------------- | ------------------------------------------------ | --------------------------------------- |
| `TokenImportError`    | Component imports tokens directly from tokens.ts | Reject, guide to use Tailwind classes   |
| `HardcodedValueError` | Hardcoded color/spacing detected                 | Reject, guide to use CSS variables      |
| `RSCBoundaryError`    | RSC boundary violation                           | Reject, guide to correct component type |
| `ThemeProviderError`  | ThemeProvider not found                          | Warn, provide setup instructions        |

---

## 9. Observability

### 9.1 Metrics

| Metric Name                        | Type    | Labels                    | Purpose                    | Target |
| ---------------------------------- | ------- | ------------------------- | -------------------------- | ------ |
| `component_token_violations_total` | Counter | violation_type, component | Token usage violations     | 0      |
| `component_hardcoded_values_total` | Counter | component, value_type     | Hardcoded value detections | 0      |
| `component_rsc_violations_total`   | Counter | component, violation_type | RSC boundary violations    | 0      |

---

## 10. Critical Architectural Rules (Summary)

### 10.1 Component Token Rules

1. **No direct token imports** - Never `import { colorTokens } from 'tokens.ts'` in components.
2. **Use Tailwind classes** - Always `className="bg-bg-elevated"` not `colorTokens.bgElevated`.
3. **Theme hooks for dynamic values** - Use `useThemeTokens()` for theme context.

### 10.2 RSC Boundary Rules

1. **Server Components** - No `'use client'`, no hooks, no event handlers.
2. **Client Components** - `'use client'` required, hooks allowed, event handlers allowed.
3. **Shared Components** - No `'use client'`, accept event handlers as props.

### 10.3 Validation Rules

1. **MCP validation** - All component token usage validated at build time.
2. **No hardcoded values** - All design values from CSS variables.
3. **Theme compliance** - All components respect theme layer.

### 10.4 Animation & Transition Patterns

#### 10.4.1 Animation Principles

**Guidelines:**

- Use animations to enhance UX, not distract
- Respect `prefers-reduced-motion` (WCAG requirement)
- Keep animations subtle and purposeful
- Use CSS transitions for simple animations
- Use animation libraries (Framer Motion) for complex animations

**Performance Requirements:**

- Use `transform` and `opacity` for GPU-accelerated animations
- Avoid animating `width`, `height`, `top`, `left` (causes layout reflow)
- Keep animation duration < 300ms for micro-interactions
- Keep animation duration < 500ms for transitions

#### 10.4.2 CSS Transition Patterns

```tsx
// ✅ CORRECT - CSS transitions
export function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-primary text-primary-foreground px-4 py-2 rounded-lg",
        "transition-all duration-200 ease-in-out",
        "hover:bg-primary-hover hover:shadow-md",
        "active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {children}
    </button>
  );
}
```

**Common Transition Patterns:**

- **Fade:** `transition-opacity duration-200`
- **Slide:** `transition-transform duration-300`
- **Scale:** `transition-transform duration-200`
- **Color:** `transition-colors duration-200`
- **Shadow:** `transition-shadow duration-200`

#### 10.4.3 Reduced Motion Support

**Implementation:**

```tsx
// ✅ CORRECT - Reduced motion support
"use client";

import { useEffect, useState } from "react";

export function AnimatedComponent({ children }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className={prefersReducedMotion ? "no-animation" : "animate-fade-in"}>
      {children}
    </div>
  );
}
```

**CSS Implementation:**

```css
/* ✅ CORRECT - Global reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### 10.4.4 Animation Library Patterns (Framer Motion)

**When to Use:**

- Complex animations (spring physics, gestures)
- Page transitions
- Layout animations
- Gesture-based interactions

```tsx
// ✅ CORRECT - Framer Motion animation
"use client";

import { motion } from "framer-motion";

export function AnimatedDialog({ isOpen, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-bg-elevated rounded-lg p-4"
    >
      {children}
    </motion.div>
  );
}
```

#### 10.4.5 Animation Best Practices

1. **Performance:**
   - Use `will-change` sparingly (only for elements actively animating)
   - Use `transform` and `opacity` for GPU acceleration
   - Avoid animating layout properties

2. **Accessibility:**
   - Always respect `prefers-reduced-motion`
   - Provide alternative feedback for users who disable animations
   - Don't rely solely on animations to convey information

3. **Timing:**
   - Micro-interactions: 100-200ms
   - Transitions: 200-300ms
   - Complex animations: 300-500ms
   - Page transitions: 300-500ms

### 10.5 Responsive Design Patterns

#### 10.5.1 Mobile-First Approach

**Strategy:** Design for mobile first, then enhance for larger screens

```tsx
// ✅ CORRECT - Mobile-first responsive design
export function ResponsiveCard({ children }) {
  return (
    <div
      className={cn(
        // Mobile (default)
        "p-4 space-y-4",
        // Tablet (sm:)
        "sm:p-6 sm:space-y-6",
        // Desktop (lg:)
        "lg:p-8 lg:space-y-8",
        // Large desktop (xl:)
        "xl:p-10"
      )}
    >
      {children}
    </div>
  );
}
```

#### 10.5.2 Breakpoint Strategy

**Tailwind Breakpoints:**

- `sm:` - 640px (tablet portrait)
- `md:` - 768px (tablet landscape)
- `lg:` - 1024px (desktop)
- `xl:` - 1280px (large desktop)
- `2xl:` - 1536px (extra large desktop)

**Usage Pattern:**

```tsx
// ✅ CORRECT - Breakpoint usage
export function ResponsiveGrid({ items }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-1", // Mobile: 1 column
        "sm:grid-cols-2", // Tablet: 2 columns
        "md:grid-cols-3", // Desktop: 3 columns
        "lg:grid-cols-4" // Large desktop: 4 columns
      )}
    >
      {items.map((item) => (
        <div key={item.id}>{item.content}</div>
      ))}
    </div>
  );
}
```

#### 10.5.3 Container Queries (When Available)

**Use Case:** Component-level responsive design (not just viewport-based)

```tsx
// ✅ CORRECT - Container query pattern (when Tailwind supports it)
export function Card({ children }) {
  return (
    <div className="@container">
      <div
        className={cn(
          "p-4",
          "@sm:p-6", // When container is >= 384px
          "@md:p-8" // When container is >= 512px
        )}
      >
        {children}
      </div>
    </div>
  );
}
```

#### 10.5.4 Touch Target Sizes (WCAG Requirement)

**Requirements:**

- Minimum touch target: 44×44px (WCAG 2.2 AA)
- Recommended touch target: 48×48px (WCAG 2.2 AAA)
- Spacing between touch targets: 8px minimum

```tsx
// ✅ CORRECT - Touch-friendly button
export function TouchButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-h-[44px] min-w-[44px]", // WCAG AA minimum
        "px-4 py-3", // Generous padding
        "touch-manipulation" // Optimize for touch
      )}
    >
      {children}
    </button>
  );
}
```

#### 10.5.5 Responsive Typography

```tsx
// ✅ CORRECT - Responsive typography
export function ResponsiveHeading({ children }) {
  return (
    <h1
      className={cn(
        "text-2xl font-bold", // Mobile
        "sm:text-3xl", // Tablet
        "md:text-4xl", // Desktop
        "lg:text-5xl" // Large desktop
      )}
    >
      {children}
    </h1>
  );
}
```

#### 10.5.6 Responsive Images

```tsx
// ✅ CORRECT - Responsive images
export function ResponsiveImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("w-full h-auto", "object-cover object-center")}
      loading="lazy"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      srcSet={`
        ${src}?w=400 400w,
        ${src}?w=800 800w,
        ${src}?w=1200 1200w
      `}
    />
  );
}
```

#### 10.5.7 Responsive Navigation Patterns

```tsx
// ✅ CORRECT - Responsive navigation
"use client";

import { useState } from "react";

export function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-bg-elevated">
      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-4">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[44px] min-w-[44px]"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          Menu
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-bg-elevated">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </div>
        )}
      </div>
    </nav>
  );
}
```

---

**Status:** ✅ **GRCD-COMPONENTS v1.0.0 FULLY IMPLEMENTED**

## Implementation Status

### ✅ Completed Items

1. ✅ **Component Migration Complete**
   - All 37 components migrated (100%)
   - Shared Primitives: 31/31
   - Typography Components: 2/2
   - Client Compositions: 4/4
   - All components use Tailwind classes referencing CSS variables
   - No direct token imports remaining

2. ✅ **MCP Seed File Created**
   - `/mcp/ui-components.mcp.json` exists and validated
   - All constraints and validation rules defined
   - Component patterns documented

3. ✅ **Validation Infrastructure Implemented**
   - MCP validation tools exist (`ComponentValidator`, `ValidationPipeline`)
   - Validation hooks implemented (`useMcpValidation`)
   - RSC boundary validation active

4. ✅ **Testing Infrastructure Complete**
   - 1,203 tests passing (33 test files)
   - All components tested
   - 95% coverage threshold met
   - Accessibility testing integrated

5. ✅ **Theme System Functional**
   - Theme customization working
   - WCAG themes working
   - Safe mode working
   - All components respect theme layer

### ⚪ Pending Items (Deferred)

1. ⚪ **Validation Infrastructure Enforcement** (Deferred - waiting for frontend stability)
   - Pre-commit hooks (Husky)
   - CI/CD integration
   - Automated validation in build pipeline

**Source:** See `COMPONENT-MIGRATION-AUDIT.md` for detailed migration status
