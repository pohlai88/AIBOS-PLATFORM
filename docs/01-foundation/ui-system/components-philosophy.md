# Components Philosophy

> **Component Design Philosophy** - React-First with Integrated MCP Workflow  
> **Version:** 1.0.0  
> **Last Updated:** 2025-01-27  
> **Status:** ✅ SSOT - Single Source of Truth

---

## Overview

This document defines the **AI-BOS component design philosophy** and establishes **React as the primary framework** with integrated MCP (Model Context Protocol) validation across the entire component lifecycle.

**Core Principle:** React components are the **single source of truth** for UI implementation. All other tools (Figma, Tailwind, Next.js) serve to validate, enhance, and govern React components.

**Component Ecosystem:**

- ✅ **Radix UI** - For accessibility-critical interactive components (Dialog, Select, Tooltip)
- ✅ **Shadcn/UI** - Component generator for Radix + Tailwind wrappers (NOT a library)
- ✅ **TanStack Table** - For data tables and grids (React-first, headless)
- ✅ **Recharts/Visx** - For charts and data visualization (React-first)
- ✅ **React Flow** - For graphs and network visualization (React-first)

**Key Distinction:**

> **AI-BOS uses Radix UI for accessibility-driven interactive components and uses React-first headless libraries (TanStack Table, Recharts, Visx, React Flow) for data-driven components. Both are fully validated by React MCP as they follow React-first, token-first, accessibility-first rules.**

---

## Design Philosophy Foundation

### 1. React-First Architecture

**React is the Lead Framework:**

- ✅ **React components** define the UI structure and behavior
- ✅ **React patterns** (forwardRef, displayName, TypeScript) are mandatory
- ✅ **React Server Components (RSC)** boundaries are strictly enforced
- ✅ **All styling** flows through React components via design tokens
- ✅ **All interactivity** is implemented in React (Client Components)

**Why React Leads:**

1. **Component as Contract** - React components are the executable specification
2. **Type Safety** - TypeScript + React provides compile-time guarantees
3. **Server/Client Boundaries** - React RSC is the foundation for Next.js architecture
4. **Composability** - React's component model enables "Lego, not Jenga" philosophy
5. **Validation Target** - All MCP tools validate against React component code

---

## MCP Integration Architecture

### MCP Roles & Responsibilities

**Four MCP servers work together, with React MCP as the orchestrator:**

| MCP Server       | Primary Role                                      | Validates Against | Integration Point                             |
| ---------------- | ------------------------------------------------- | ----------------- | --------------------------------------------- |
| **React MCP**    | Component patterns, RSC boundaries, accessibility | React code        | ✅ **LEAD** - Orchestrates validation         |
| **Figma MCP**    | Design specs, tokens, component mapping           | Figma designs     | Validates design → code alignment             |
| **Tailwind MCP** | Token validation, styling enforcement             | CSS variables     | Validates token usage in components           |
| **Next.js MCP**  | App structure, RSC boundaries, runtime            | Next.js app       | Validates React components in Next.js context |

---

## Component Lifecycle: Design → Code → Validation

### Phase 1: Design (Figma MCP)

**Figma MCP provides design specifications:**

```typescript
// 1. Extract design tokens from Figma
const figmaTokens = await mcp_Figma_get_variable_defs({
  fileKey: "DESIGN_SYSTEM_FILE",
  nodeId: "COMPONENT_NODE_ID",
});

// 2. Get component design context
const designContext = await mcp_Figma_get_design_context({
  fileKey: "DESIGN_SYSTEM_FILE",
  nodeId: "BUTTON_COMPONENT_ID",
});

// 3. Map Figma to code (Code Connect)
const codeMap = await mcp_Figma_get_code_connect_map({
  fileKey: "DESIGN_SYSTEM_FILE",
  nodeId: "COMPONENT_NODE_ID",
});
```

**Output:** Design tokens, component specs, accessibility requirements

---

### Phase 2: Implementation (React)

**React components implement the design:**

```typescript
// packages/ui/src/components/button.tsx
import { forwardRef } from "react";
import { componentTokens, accessibilityTokensAA } from "@aibos/ui/design/tokens";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  "aria-label"?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, "aria-label": ariaLabel, ...props }, ref) => {
    const base = componentTokens[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`];

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        aria-label={ariaLabel}
        className={`${base} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

**Key Principles:**

- ✅ Uses design tokens (not raw colors)
- ✅ Implements accessibility (ARIA, focus rings)
- ✅ Follows React patterns (forwardRef, displayName)
- ✅ TypeScript interfaces for type safety
- ✅ Server Component compatible (unless interactive)

---

### Phase 3: Validation (React MCP + Tailwind MCP)

**React MCP validates component patterns:**

```typescript
// React MCP validates:
const reactValidation = await mcp_React_validate_react_component({
  filePath: "packages/ui/src/components/button.tsx",
  componentName: "Button",
});

// Checks:
// ✅ forwardRef usage
// ✅ displayName set
// ✅ TypeScript interface
// ✅ Props extend HTML attributes
// ✅ Accessibility (ARIA, semantic HTML)
// ✅ Token usage (no raw hex colors)
// ✅ RSC boundary compliance
```

**Tailwind MCP validates token usage:**

```typescript
// Tailwind MCP validates:
const tokenValidation = await mcp_Tailwind_validate_token_exists({
  tokenName: "--color-primary",
});

const classValidation = await mcp_Tailwind_validate_tailwind_class({
  className: "bg-primary",
});
```

**Output:** Validation report with issues and recommendations

---

### Phase 4: Integration (Next.js MCP)

**Next.js MCP validates React components in Next.js context:**

```typescript
// Next.js MCP validates:
const rscCheck = await mcp_React_check_server_client_usage({
  filePath: "app/components/Button.tsx",
});

const rscBoundary = await mcp_React_validate_rsc_boundary({
  filePath: "app/components/Button.tsx",
});

// Next.js Runtime MCP validates at runtime:
const runtimeErrors = await mcp_NextJS_runtime_call_tool({
  port: "3000",
  toolName: "get_errors",
});
```

**Output:** RSC boundary validation, runtime error detection

---

## Component Categories & MCP Validation

**AI-BOS uses three distinct component categories:**

1. **Primitives** - Token-based, no complex logic
2. **Compositions** - Radix UI-based, accessibility-critical interactive components
3. **Functional Components** - Data-driven components (Tables, Charts, Graphs) using React-first headless libraries

**Key Principle:** Radix UI is used for accessibility-critical interactive components. Data visualization components (Tables, Charts, Graphs) use React-first headless libraries (TanStack Table, Recharts, Visx, React Flow), not Radix.

---

### 1. Primitives (React MCP Primary)

**Definition:** Basic, atomic components (Button, Input, Card, Badge, Avatar, Typography)

**Characteristics:**

- ✅ No Radix UI dependencies
- ✅ Server Component compatible (unless interactive)
- ✅ Simple props interface
- ✅ Uses `componentTokens` presets
- ✅ Token-based styling only
- ✅ forwardRef + displayName required

**React MCP Validates:**

- ✅ No Radix UI dependencies
- ✅ Server Component compatible (unless interactive)
- ✅ Simple props interface
- ✅ Uses `componentTokens` presets
- ✅ forwardRef + displayName required

**Example:**

```typescript
// ✅ CORRECT: Primitive component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${componentTokens.buttonPrimary} ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

**MCP Validation Flow:**

1. **React MCP** → Validates React patterns
2. **Tailwind MCP** → Validates token usage
3. **Figma MCP** → Validates design alignment (optional)

---

### 2. Compositions (Radix UI-Based)

**Definition:** Accessibility-critical interactive components built on Radix UI primitives

**Radix UI Role:**

Radix UI provides:

- ✅ Robust keyboard handling
- ✅ Roving tabindex
- ✅ Focus scopes
- ✅ Proper ARIA roles
- ✅ Portal + overlay logic
- ✅ Complex composite widgets

**Radix UI Components (Use Cases):**

- Dialog (modal)
- Drawer
- Tooltip
- Popover
- Select
- DropdownMenu
- Menubar
- HoverCard
- Toast
- Tabs
- Toggle
- Accordion
- NavigationMenu
- Collapsible

**Shadcn/UI Role:**

Shadcn/UI is:

- ✅ **NOT a library** - It's a component generator
- ✅ **NOT shipped as a dependency** - Code is copied into your project
- ✅ **NOT a framework** - It's a styling scaffold around Radix

**Use Shadcn for:**

- Saving time building Radix wrappers
- Removing Radix boilerplate
- Enforcing consistency
- Generating components with Radix + Tailwind

**React MCP Validates:**

- ✅ `"use client"` directive present
- ✅ Built on Radix UI primitives
- ✅ Complex behavior and accessibility
- ✅ Multiple sub-components
- ✅ RSC boundary compliance (Client Component)
- ✅ Radix usage is appropriate (accessibility-critical components)

**Figma MCP Validates:**

- ✅ Design specs match implementation
- ✅ Component structure aligns with Figma
- ✅ Accessibility requirements from design

**Example:**

```typescript
// ✅ CORRECT: Composition component (Radix-based)
"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "./button";
import { componentTokens } from "@aibos/ui/design/tokens";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = DialogPrimitive.Content;

// Wrapped with tokens and styling
export function DialogWrapper({ children, ...props }) {
  return (
    <Dialog>
      <DialogContent className={componentTokens.dialog}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

**MCP Validation Flow:**

1. **React MCP** → Validates RSC boundaries, Radix usage
2. **Figma MCP** → Validates design alignment
3. **Tailwind MCP** → Validates token usage
4. **A11y MCP** → Validates accessibility (Radix provides base, we validate enhancements)

---

### 3. Functional Components (Data Visualization)

**Definition:** Data-driven business components for tables, charts, graphs, and data visualization

**Critical Principle:**

> **Data visualization components (Tables, Charts, Graphs) are NOT built with Radix UI. They use React-first headless libraries (TanStack Table, Recharts, Visx, React Flow) that follow React-first, token-first, accessibility-first rules.**

**Why Not Radix for Data Components:**

- ❌ Radix doesn't provide table or chart components
- ❌ Enterprise data tables require virtualization, infinite scroll, column grouping
- ❌ Charts require complex rendering logic (SVG, Canvas)
- ❌ Data visualization accessibility is complex and requires manual implementation
- ✅ React-first headless libraries provide the flexibility needed

**Functional Component Libraries:**

| Component Type         | Library            | React-First | Headless | Token-Compatible |
| ---------------------- | ------------------ | ----------- | -------- | ---------------- |
| **Data Tables**        | TanStack Table v8  | ✅          | ✅       | ✅               |
| **Data Grids**         | TanStack Table v8  | ✅          | ✅       | ✅               |
| **Charts**             | Recharts / Visx    | ✅          | ✅       | ✅               |
| **Graphs/Networks**    | React Flow         | ✅          | ✅       | ✅               |
| **Scheduler/Calendar** | React Big Calendar | ✅          | ✅       | ✅               |
| **Tree View**          | Headless patterns  | ✅          | ✅       | ✅               |
| **Rich Text Editor**   | TipTap / Lexical   | ✅          | ✅       | ✅               |

**Example Functional Components:**

```typescript
// ✅ CORRECT: Data Table (TanStack Table)
"use client";

import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { componentTokens } from "@aibos/ui/design/tokens";

export function DataTable({ data, columns }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className={componentTokens.table}>
      {/* Table implementation using tokens */}
    </table>
  );
}
```

```typescript
// ✅ CORRECT: Chart (Recharts)
"use client";

import { LineChart, Line, XAxis, YAxis } from "recharts";
import { componentTokens } from "@aibos/ui/design/tokens";

export function DataChart({ data }) {
  return (
    <LineChart
      data={data}
      className={componentTokens.chart}
      style={{ color: "var(--color-primary)" }}
    >
      <Line dataKey="value" stroke="var(--color-primary)" />
      <XAxis dataKey="name" />
      <YAxis />
    </LineChart>
  );
}
```

**React MCP Validates:**

- ✅ No raw colors (uses tokens)
- ✅ Token-based styling
- ✅ Scalable architecture
- ✅ Controlled components
- ✅ Performance optimization
- ✅ No blocking operations
- ✅ Pure React state
- ✅ React-first patterns (no Radix required)

**Tailwind MCP Validates:**

- ✅ No forbidden Tailwind classes
- ✅ Uses tokens instead of palette colors
- ✅ Token values are valid

**A11y MCP Validates:**

- ✅ Tables have correct ARIA roles (`role="table"`, `role="row"`, `role="cell"`)
- ✅ Table rows have focusability
- ✅ Charts include alt text / descriptions
- ✅ Keyboard navigation present for data grids
- ✅ Color contrast meets WCAG requirements
- ✅ Screen reader compatibility

**Figma MCP Validates:**

- ✅ Design alignment (if applicable)
- ✅ Data visualization patterns match design

**MCP Validation Flow:**

1. **React MCP** → Validates React patterns, token usage, performance
2. **Tailwind MCP** → Validates token usage
3. **A11y MCP** → Validates accessibility (manual implementation required)
4. **Figma MCP** → Validates design alignment (optional)

**Important Notes:**

- ✅ **All functional components are React 18+ compatible**
- ✅ **All functional components work with Next.js 16 RSC**
- ✅ **All functional components use design tokens**
- ✅ **All functional components are MCP-validatable**
- ✅ **No conflict with Radix UI** - Different use cases

---

### 4. Layouts (React MCP + Next.js MCP)

**Definition:** Page-level components (AppShell, Header, Sidebar, Navigation)

**Characteristics:**

- ✅ Composed from primitives, compositions, and functional components
- ✅ Client Component for interactivity
- ✅ Responsive design
- ✅ Full keyboard navigation
- ✅ May include data tables or charts (functional components)

**React MCP Validates:**

- ✅ Composed from primitives and compositions
- ✅ Client Component for interactivity
- ✅ Responsive design
- ✅ Full keyboard navigation
- ✅ Proper use of functional components (if applicable)

**Next.js MCP Validates:**

- ✅ App Router structure
- ✅ Server/Client Component boundaries
- ✅ Route organization
- ✅ Runtime errors

**Example:**

```typescript
// ✅ CORRECT: Layout component with data table
"use client";

import { Button } from "@aibos/ui/components/button";
import { Card } from "@aibos/ui/components/card";
import { DataTable } from "@aibos/ui/components/data-table";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header>{/* Header content */}</header>
      <main>
        {children}
        {/* Layout can include functional components */}
        <DataTable data={tableData} columns={columns} />
      </main>
    </div>
  );
}
```

**MCP Validation Flow:**

1. **React MCP** → Validates component patterns
2. **Next.js MCP** → Validates app structure
3. **Tailwind MCP** → Validates responsive tokens
4. **Figma MCP** → Validates layout design (optional)

---

## React Server Components (RSC) Philosophy

### Server Components as Default

**Principle:** All components are Server Components by default unless they require interactivity.

**React MCP Enforces:**

- ✅ No `"use client"` unless needed
- ✅ No browser APIs in Server Components
- ✅ No React hooks (except server-safe ones)
- ✅ No event handlers (use Server Actions)
- ✅ Async components allowed

**Example:**

```typescript
// ✅ CORRECT: Server Component (default)
import { Card } from "@aibos/ui/components/card";

export default async function Page() {
  const data = await fetchData(); // Server-side data fetching
  return (
    <Card>
      <h1>{data.title}</h1>
    </Card>
  );
}
```

---

### Client Components for Interactivity

**Principle:** Use Client Components only when interactivity is required.

**React MCP Enforces:**

- ✅ `"use client"` directive at top of file
- ✅ Can use browser APIs
- ✅ Can use React hooks
- ✅ Can have event handlers
- ✅ Must be wrapped in Server Components when possible

**Example:**

```typescript
// ✅ CORRECT: Client Component (interactive)
"use client";

import { useState } from "react";
import { Button } from "@aibos/ui/components/button";

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}
```

---

## Design Token Integration

### Token-First Styling

**Principle:** All styling flows through design tokens, never raw values.

**React MCP Validates:**

- ❌ No raw hex colors (`#4285f4`)
- ❌ No Tailwind palette colors (`bg-blue-600`)
- ✅ Use design tokens (`componentTokens.buttonPrimary`)
- ✅ Use accessibility tokens (`accessibilityTokensAA.textOnPrimary`)

**Tailwind MCP Validates:**

- ✅ Token exists in `globals.css`
- ✅ Token value is valid
- ✅ Tailwind class uses token correctly

**Example:**

```typescript
// ✅ CORRECT: Token-based styling
import { componentTokens, accessibilityTokensAA } from "@aibos/ui/design/tokens";

<button className={componentTokens.buttonPrimary}>
  <span className={accessibilityTokensAA.textOnPrimary}>
    Primary Action
  </span>
</button>

// ❌ INCORRECT: Raw values
<button className="bg-blue-600 text-white">
  Primary Action
</button>
```

---

## Accessibility Integration

### React MCP + A11y MCP Validation

**React MCP Validates:**

- ✅ Semantic HTML usage
- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management

**A11y MCP Validates:**

- ✅ WCAG contrast ratios
- ✅ Screen reader compatibility
- ✅ Keyboard accessibility
- ✅ Focus indicators

**Example:**

```typescript
// ✅ CORRECT: Accessible component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ "aria-label": ariaLabel, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        {...props}
      />
    );
  }
);
```

---

## Multi-Tenant & Theme Support

### React Components Adapt to Theme

**Principle:** React components use CSS variables that adapt to theme automatically.

**React MCP Validates:**

- ✅ Components use CSS variables (not hardcoded colors)
- ✅ Components work in all themes (Aesthetic, WCAG AA, WCAG AAA)
- ✅ No theme-specific code in components

**Tailwind MCP Validates:**

- ✅ Tokens exist for all themes
- ✅ Theme switching works correctly
- ✅ Tenant overrides work in Aesthetic theme only

**Example:**

```typescript
// ✅ CORRECT: Theme-adaptive component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    // Component tokens automatically adapt to theme via CSS variables
    return (
      <button
        ref={ref}
        className={`${componentTokens.buttonPrimary} ${className ?? ""}`}
        {...props}
      />
    );
  }
);

// Theme switching is handled by CSS, not component code
// <html data-theme="wcag-aa"> → CSS variables change automatically
```

---

## MCP Workflow: Complete Component Lifecycle

### Step 1: Design Phase (Figma MCP)

```typescript
// Extract design from Figma
const design = await mcp_Figma_get_design_context({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "BUTTON_COMPONENT",
});

// Extract tokens
const tokens = await mcp_Figma_get_variable_defs({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "TOKENS_NODE",
});
```

### Step 2: Implementation Phase (React)

```typescript
// Implement component using design tokens
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={componentTokens[`button${variant}`]}
        {...props}
      />
    );
  }
);
```

### Step 3: Validation Phase (React MCP + Tailwind MCP)

```typescript
// React MCP validates component patterns
const reactResult = await mcp_React_validate_react_component({
  filePath: "packages/ui/src/components/button.tsx",
  componentName: "Button",
});

// Tailwind MCP validates token usage
const tokenResult = await mcp_Tailwind_validate_token_exists({
  tokenName: "--color-primary",
});
```

### Step 4: Integration Phase (Next.js MCP)

```typescript
// Next.js MCP validates RSC boundaries
const rscResult = await mcp_React_validate_rsc_boundary({
  filePath: "app/components/Button.tsx",
});

// Next.js Runtime validates at runtime
const runtimeErrors = await mcp_NextJS_runtime_call_tool({
  port: "3000",
  toolName: "get_errors",
});
```

### Step 5: Continuous Validation

```typescript
// Pre-commit validation
pnpm mcp:validate-staged

// Full validation
pnpm mcp:validate-all

// Component-specific validation
pnpm lint:ui-constitution
```

---

## Component Constitution Alignment

**All components must comply with:**

1. **Component Constitution** (`packages/ui/constitution/components.yml`)
   - Structure rules
   - Props rules
   - Accessibility rules
   - Styling rules

2. **RSC Constitution** (`packages/ui/constitution/rsc.yml`)
   - Server/Client Component rules
   - RSC boundary rules
   - Import tracing rules

3. **Accessibility Guidelines** (`docs/01-foundation/ui-system/a11y-guidelines.md`)
   - WCAG compliance
   - Theme-based accessibility
   - Keyboard navigation

4. **Color System** (`docs/01-foundation/ui-system/colors.md`)
   - Token usage
   - Theme support
   - Multi-tenant governance

---

## MCP Tool Reference

### React MCP Tools

**Primary Tools:**

- `validate_react_component` - Validates React patterns
- `check_server_client_usage` - Detects Server/Client usage
- `validate_rsc_boundary` - Validates RSC boundaries

**Usage:**

```typescript
const result = await mcp_React_validate_react_component({
  filePath: "packages/ui/src/components/button.tsx",
  componentName: "Button",
});
```

### Figma MCP Tools

**Primary Tools:**

- `get_design_context` - Get component design specs
- `get_variable_defs` - Extract design tokens
- `get_code_connect_map` - Map Figma to code

**Usage:**

```typescript
const design = await mcp_Figma_get_design_context({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "COMPONENT_NODE_ID",
});
```

### Tailwind MCP Tools

**Primary Tools:**

- `read_tailwind_config` - Read tokens from `globals.css`
- `validate_token_exists` - Check if token exists
- `validate_tailwind_class` - Validate class usage
- `get_token_value` - Get token CSS value

**Usage:**

```typescript
const tokens = await mcp_Tailwind_read_tailwind_config();
const validation = await mcp_Tailwind_validate_token_exists({
  tokenName: "--color-primary",
});
```

### Next.js MCP Tools

**Primary Tools:**

- `nextjs_runtime` - Runtime validation and diagnostics
- `nextjs_docs` - Next.js documentation access
- `upgrade_nextjs_16` - Upgrade guidance

**Usage:**

```typescript
const runtime = await mcp_NextJS_runtime_list_tools({
  port: "3000",
});
const errors = await mcp_NextJS_runtime_call_tool({
  port: "3000",
  toolName: "get_errors",
});
```

---

## Component Development Workflow

### 1. Design → Code Workflow

```
Figma Design
    ↓
Figma MCP (extract tokens & specs)
    ↓
React Component (implement design)
    ↓
React MCP (validate patterns)
    ↓
Tailwind MCP (validate tokens)
    ↓
Next.js MCP (validate integration)
    ↓
Production Component
```

### 2. Code → Design Validation

```
React Component
    ↓
Figma MCP (check design alignment)
    ↓
React MCP (validate implementation)
    ↓
Validation Report
```

### 3. Continuous Validation

```
Component Change
    ↓
Pre-commit Hook
    ↓
React MCP + Tailwind MCP + Next.js MCP
    ↓
Validation Report
    ↓
Commit (if valid) or Reject (if invalid)
```

---

## Component Library Ecosystem

### Radix UI

**Purpose:** Accessibility-critical interactive components

**Use For:**

- Dialog, Tooltip, Popover, Select, DropdownMenu
- Components requiring complex keyboard handling
- Components requiring focus management
- Components requiring ARIA roles

**Do NOT Use For:**

- ❌ Data tables
- ❌ Charts or graphs
- ❌ Data visualization
- ❌ Business logic components

### Shadcn/UI

**Purpose:** Component generator for Radix + Tailwind wrappers

**Use For:**

- Generating consistent Radix wrappers
- Reducing boilerplate
- Enforcing design system patterns

**Note:** Shadcn is NOT a library - it's a code generator. Code is copied into your project.

### TanStack Table v8

**Purpose:** Headless data table and grid components

**Use For:**

- Data tables
- Data grids
- Virtualized tables
- Complex table interactions (sorting, filtering, pagination)

**Characteristics:**

- ✅ React-first
- ✅ Headless (no styling)
- ✅ Fully flexible
- ✅ Token-compatible
- ✅ MCP-validatable

### Recharts / Visx

**Purpose:** React-first chart libraries

**Use For:**

- Line charts
- Bar charts
- Pie charts
- Area charts
- Complex data visualization

**Characteristics:**

- ✅ React-first
- ✅ Accessibility-compatible (with work)
- ✅ Controlled / deterministic
- ✅ Data-driven
- ✅ Tailwind-friendly
- ✅ Token-compatible

### React Flow

**Purpose:** Graph and network visualization

**Use For:**

- Node-based graphs
- Flow diagrams
- Network visualization
- Interactive graphs

**Characteristics:**

- ✅ React-first
- ✅ Fully customizable
- ✅ Token-compatible
- ✅ Accessibility support

---

## Key Principles Summary

### ✅ React-First

- React components are the single source of truth
- All styling flows through React components
- All interactivity is React-based
- React patterns are mandatory
- **All libraries are React 18+ compatible**

### ✅ MCP Integration

- React MCP orchestrates validation
- Figma MCP provides design specs
- Tailwind MCP validates tokens
- Next.js MCP validates integration
- **A11y MCP validates accessibility for all component types**

### ✅ Token-First Styling

- All styling uses design tokens
- No raw colors or values
- Theme switching via CSS variables
- Multi-tenant support via tokens
- **Functional components use tokens, not library defaults**

### ✅ Accessibility-First

- WCAG compliance built-in
- Theme-based accessibility
- Keyboard navigation required
- Screen reader support required
- **Radix provides accessibility for interactive components**
- **Functional components require manual accessibility implementation**

### ✅ Server Components Default

- Default to Server Components
- Use Client Components only when needed
- RSC boundaries strictly enforced
- Next.js integration validated
- **Functional components are Client Components (data-driven)**

### ✅ Library Compatibility

- ✅ Radix UI: React 18+, Next.js 16 compatible
- ✅ TanStack Table: React 18+, Next.js 16 compatible
- ✅ Recharts/Visx: React 18+, Next.js 16 compatible
- ✅ React Flow: React 18+, Next.js 16 compatible
- ✅ **All libraries work together without conflict**
- ✅ **All libraries follow React-first, token-first philosophy**

---

## AI-BOS Component Map (v1.0)

> **Official SSOT Component Inventory** - Complete component catalog organized by layer

This is the **official component map** for the AI-BOS platform, categorized into three structural layers aligned with React-first architecture, Radix composition layer, WCAG compliance, and MCP validation.

---

### High-Level Structure

```
AI-BOS UI SYSTEM

│
├── LAYER 1: PRIMITIVES (React-first, token-first, Radix-free)
│     ├── Typography Primitives
│     ├── Form Primitives
│     ├── Surface Primitives
│     ├── Utility Primitives
│     └── Layout Primitives
│
├── LAYER 2: COMPOSITIONS (Radix-based, interactive)
│     ├── Overlay Components
│     ├── Navigation Components
│     ├── Selection Components
│     ├── Feedback Components
│     └── Interactive Widgets
│
└── LAYER 3: ENTERPRISE FUNCTIONAL COMPONENTS (Data-driven, non-Radix)
      ├── Data Tables (TanStack Table)
      ├── Data Visualizations (Recharts/Visx)
      ├── Workflow Components
      ├── Mapping & Graph Components (React Flow)
      ├── Editors (TipTap/Lexical)
      └── Business Application Widgets
```

---

### Layer 1: Primitives

**Characteristics:**

- ✅ React-first, token-first
- ✅ NO Radix UI dependencies
- ✅ NO complex logic
- ✅ Token-controlled styling
- ✅ RSC-safe (unless interactive)
- ✅ forwardRef + displayName required

**MCP Validation:**

- React MCP (patterns, RSC boundaries)
- Tailwind MCP (token usage)
- A11y MCP (accessibility)

#### 1. Typography Primitives

- `Text` - Base text component
- `Heading` - Semantic headings (h1-h6)
- `MutedText` - Secondary text
- `Code` - Inline and block code
- `Link` - Token-controlled links

#### 2. Form Primitives

- `Input` - Text input
- `Textarea` - Multi-line input
- `Select` - Native HTML select
- `Checkbox` - Native checkbox
- `Switch` - Native switch (RSC-safe)
- `Radio` - Radio button
- `Label` - Form label
- `Fieldset` - Form fieldset
- `FormDescription` - Helper text
- `FormError` - Error message
- `FormGroup` - Form field group

#### 3. Surface Primitives

- `Card` - Card container
- `Paper` / `Surface` / `Block` - Surface container
- `Divider` - Horizontal divider
- `Separator` - Visual separator
- `Section` / `Container` - Section container
- `Skeleton` - Loading skeleton

#### 4. Utility Primitives

- `Button` - All button variants
- `IconButton` - Icon-only button
- `Badge` - Status badge
- `Tag` - Tag component
- `TooltipTrigger` - Non-Radix fallback tooltip
- `Avatar` - User avatar
- `Spinner` / `Loader` - Loading indicator
- `Progress` - Native progress bar

#### 5. Layout Primitives

- `Grid` - CSS Grid wrapper
- `Flex` - Flexbox wrapper
- `Stack` / `VStack` / `HStack` - Stack layout
- `Spacer` - Spacing utility
- `ScrollArea` - Simple scroll container
- `ResponsiveBox` - Responsive container

---

### Layer 2: Compositions (Radix-Powered)

**Characteristics:**

- ✅ Built on Radix UI primitives
- ✅ Interactive and behavior-heavy
- ✅ Client Components (`"use client"`)
- ✅ Complex keyboard navigation
- ✅ Focus management
- ✅ Portal and overlay logic

**MCP Validation:**

- React MCP (RSC boundaries, Radix usage)
- Radix Compliance MCP (Radix patterns)
- Tailwind MCP (token usage)
- A11y MCP (accessibility enhancements)

#### 1. Overlay Components

- `Dialog` - Modal dialog (Radix Dialog)
- `Drawer` / `Sheet` - Side drawer (Radix Dialog variant)
- `Popover` - Popover container
- `Tooltip` - Tooltip (Radix Tooltip)
- `HoverCard` - Hover card
- `Modal` - Modal wrapper
- `AlertDialog` - Alert dialog (Radix AlertDialog)

#### 2. Navigation Components

- `DropdownMenu` - Dropdown menu (Radix DropdownMenu)
- `ContextMenu` - Context menu (Radix ContextMenu)
- `Menubar` - Menu bar (Radix Menubar)
- `NavigationMenu` - Navigation menu (Radix NavigationMenu)
- `Tabs` - Tabs component (Radix Tabs)
- `Accordion` - Accordion (Radix Accordion)
- `Collapsible` - Collapsible content (Radix Collapsible)
- `CommandPalette` - Command palette (cmdk + Radix)

#### 3. Selection Components

- `Select` - Select dropdown (Radix Select)
- `Combobox` - Combobox input
- `Listbox` - Listbox selection
- `ToggleGroup` - Toggle group (Radix ToggleGroup)
- `Switch` - Switch toggle (Radix Switch)
- `Checkbox` - Checkbox (Radix Checkbox)
- `RadioGroup` - Radio group (Radix RadioGroup)

#### 4. Feedback Components

- `Toast` - Toast notification (Radix Toast)
- `Alert` - Alert message (non-toast)
- `Progress` - Progress indicator (Radix Progress)
- `StatusBadge` - Status indicator

#### 5. Interactive Widgets

- `HoverableMenus` - Hover-activated menus
- `PopoverForms` - Forms in popovers
- `InlineEditableText` - Inline text editing
- `SortableList` - Sortable list (Radix + DnD)
- `Slider` - Slider control (Radix Slider)
- `RangeSlider` - Range slider (Radix Slider)

---

### Layer 3: Enterprise Functional Components

**Characteristics:**

- ✅ NO Radix UI (uses React-first headless libraries)
- ✅ Data-driven and business logic-heavy
- ✅ Chart/table-heavy components
- ✅ Client Components (`"use client"`)
- ✅ Complex state management
- ✅ Virtualization and performance optimization

**MCP Validation:**

- React MCP (React patterns, token usage, performance)
- Tailwind MCP (token usage)
- A11y MCP (accessibility - manual implementation required)
- Figma MCP (design alignment - optional)

#### 1. Data Table Suite (TanStack Table v8)

**Components:**

- `DataTable` - Main data table component
- `DataTableHeader` - Table header
- `DataTableToolbar` - Table toolbar
- `DataTablePagination` - Pagination controls
- `DataTableRow` - Table row
- `DataTableCell` - Table cell
- `DataTableFilter` - Filter controls
- `DataTableColumnVisibility` - Column visibility toggle
- `DataTableColumnSorter` - Column sorting
- `DataTableDensitySelector` - Row density selector
- `DataTableRowSelection` - Row selection
- `VirtualizedList` - Virtualized table (if required)

**Requirements:**

- ✅ RSC-safe data provider
- ✅ Client-side interactive table
- ✅ WCAG AA/AAA theme support
- ✅ Safe Mode rendering
- ✅ Tenant styling via tokens
- ✅ Keyboard navigation
- ✅ Screen reader support

#### 2. Data Visualization Suite (Recharts / Visx)

**Components:**

- `LineChart` - Line chart
- `BarChart` - Bar chart
- `PieChart` - Pie chart
- `AreaChart` - Area chart
- `DonutChart` - Donut chart
- `RadarChart` - Radar chart
- `HeatMap` - Heat map
- `TimelineChart` - Timeline visualization
- `KPITrendLine` - KPI trend indicator
- `Sparkline` - Sparkline chart

**MCP Requirements:**

- ✅ Color tokens only (no raw colors)
- ✅ Accessible descriptions (alt text)
- ✅ Large text support
- ✅ WCAG AA/AAA compliance
- ✅ Safe Mode palette support
- ✅ Colorblind-friendly palettes

#### 3. Workflow Components

**Components:**

- `KanbanBoard` - Kanban board (dnd-kit or React Beautiful DnD)
- `Timeline` - Timeline component
- `Stepper` - Multi-step stepper
- `WizardFlow` - Wizard flow component
- `MultiStepForm` - Multi-step form
- `AuditLogTimeline` - Audit log timeline
- `CommentThread` - Comment thread
- `ChatUI` - Chat interface

#### 4. Mapping & Graph Components (React Flow)

**Components:**

- `NetworkGraph` - Network graph visualization
- `EntityRelationshipGraph` - ERD diagram
- `WorkflowDiagram` - Workflow diagram
- `Mindmap` - Mind map
- `TreeDiagram` - Tree diagram
- `OrgChart` - Organizational chart
- `GeolocationMap` - Map component (Mapbox/Leaflet)
- `RoutingMap` - Routing map

#### 5. Editors (TipTap / Lexical)

**Components:**

- `RichTextEditor` - Rich text editor (TipTap)
- `MarkdownEditor` - Markdown editor
- `CodeEditor` - Code editor (Monaco)
- `EmailEditor` - Email composition editor
- `DocumentEditor` - Document editor

**Accessibility Requirements:**

- ✅ Keyboard shortcuts
- ✅ Semantic formatting
- ✅ ARIA toolbar
- ✅ WCAG-compliant toolbar structure

#### 6. Business Application Widgets

**Components:**

- `Calendar` - Calendar component (react-big-calendar or fullcalendar)
- `Scheduler` - Scheduling component
- `DatePicker` - Date picker
- `DateRangePicker` - Date range picker
- `FileUploader` - File upload component
- `FileBrowser` - File browser
- `NotificationCenter` - Notification center
- `SettingsPanel` - Settings panel
- `RolePermissionsEditor` - Role & permissions editor
- `AIAssistantUI` - AI Assistant UI (Lynx Panel)
- `MultiTenantThemeSwitcher` - Multi-tenant theme switcher
- `WCAGThemeSwitch` - WCAG AA/AAA theme switcher

---

### Theming Governance Across Layers

| Layer            | Theme Behavior                                     |
| ---------------- | -------------------------------------------------- |
| **Primitives**   | Fully tokenized, WCAG AA/AAA auto-applied          |
| **Compositions** | WCAG tokens + Radix structural A11y                |
| **Functional**   | Override with WCAG palette unless tenant permitted |

**Safe Mode:** Disables tenant branding in all layers while preserving WCAG compliance.

---

### MCP Validation Matrix

| Layer            | Validated By                      | What It Checks                               |
| ---------------- | --------------------------------- | -------------------------------------------- |
| **Primitives**   | React MCP, Tailwind MCP, A11y MCP | Tokens, WCAG, ARIA, React patterns           |
| **Compositions** | React MCP, Radix MCP, A11y MCP    | Focus, overlay, roving tabindex, Radix usage |
| **Functional**   | React MCP, A11y MCP, Tailwind MCP | Charts, tables, keyboard nav, token usage    |

---

### Component Status Tracking

**Implementation Status:**

- ✅ **Implemented** - Component exists and is exported
- 🚧 **In Progress** - Component exists but needs validation
- 📋 **Planned** - Component is planned but not yet implemented
- ❌ **Not Required** - Component is not needed for current scope

**Current Status:** See [UI Primitives Completion Plan](../04-developer/ui-primitives-completion-plan.md) for detailed implementation status.

---

## Related Documentation

- [Component Constitution](../../packages/ui/constitution/components.yml) - Component rules
- [RSC Constitution](../../packages/ui/constitution/rsc.yml) - RSC boundary rules
- [Accessibility Guidelines](./a11y-guidelines.md) - WCAG compliance
- [Color System](./colors.md) - Token system
- [Tokens](./tokens.md) - Token reference
- [MCP Integration Guide](../07-mcp/MCP_INTEGRATION_GUIDE.md) - MCP usage
- [UI Primitives Completion Plan](../04-developer/ui-primitives-completion-plan.md) - Implementation roadmap

---

**Last Updated:** 2025-01-27  
**Version:** 1.1.0  
**Status:** ✅ **SSOT - Single Source of Truth**  
**Enforcement:** React MCP + Tailwind MCP + Figma MCP + Next.js MCP  
**Lead Framework:** React  
**Component Map Version:** v1.0
