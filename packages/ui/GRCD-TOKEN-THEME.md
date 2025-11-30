# 🧾 GRCD — Token & Theme Layer — v1.0.0

**Version:** 1.0.0  
**Status:** Active (MCP-Governed Template & Reference)  
**Last Updated:** 2025-01-27  
**Owner:** Design System Team, Frontend Team, MCP Governance Team

> **Purpose of this GRCD**
>
> This GRCD is the **single source of truth** for the Token & Theme layer - the bridge between `globals.css` (CSS variables) and Components. It establishes the **correct architecture** where ThemeProvider controls CSS variables, and components consume tokens through the theme layer (never directly).
>
> **Key Anti-Drift Mechanisms:**
>
> - ThemeProvider architecture (Section 3.1 - CRITICAL)
> - Token consumption rules (Section 3.2 - CRITICAL)
> - Component token usage patterns (Section 3.3 - CRITICAL)
> - No direct token imports (Section 4.1 - CRITICAL)

---

## 1. Purpose & Identity

**Component Name:** `Token & Theme Layer` (ThemeProvider, tokens.ts, client.ts, server.ts)

**Domain:** `Design System Theme Management` (Bridge between CSS Variables and Components)

### 1.1 Purpose

**Purpose Statement:**

> The Token & Theme layer is the **governance bridge** between `globals.css` (CSS variables SSOT) and Components. It provides ThemeProvider to control CSS variables based on tenant/WCAG/safe mode, and establishes the **theme-first architecture** where components consume tokens through the theme layer, never directly importing from `tokens.ts`.

**Philosophical Foundation:**

1. **ThemeProvider Controls CSS Variables:** ThemeProvider applies CSS variables to `:root` via DOM attributes.
2. **Components Consume Theme:** Components use Tailwind classes that reference CSS variables (theme-controlled).
3. **No Direct Imports:** Components MUST NOT import tokens directly from `tokens.ts`.
4. **Theme-First Architecture:** All styling flows through theme layer.

### 1.2 Identity

- **Role:** `Theme Governance Layer` – Manages CSS variables via ThemeProvider, validates token usage, prevents architectural violations.

- **Scope:**
  - ThemeProvider component (applies CSS variables).
  - Token TypeScript mappings (for MCP validation only).
  - Theme hooks (useThemeTokens, useMcpTheme).
  - Token validation utilities.

- **Boundaries:**
  - Does **NOT** define CSS variables (globals.css does).
  - Does **NOT** contain component styles.
  - Does **NOT** allow direct token imports in components.

- **Non-Responsibility:**
  - `MUST NOT` define CSS variables.
  - `MUST NOT` contain component code.
  - `MUST NOT` allow components to bypass theme layer.

### 1.3 Non-Negotiables (Constitutional Principles)

**Constitutional Principles:**

- `MUST` provide ThemeProvider to control CSS variables.
- `MUST NOT` allow components to import tokens directly from `tokens.ts`.
- `MUST` validate all component token usage via MCP.
- `MUST` enforce theme-first architecture.
- `MUST` support tenant customization through theme layer.
- `MUST` support WCAG themes through theme layer.
- `MUST` support safe mode through theme layer.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID   | Requirement                                                    | Priority (MUST/SHOULD/MAY) | Status (✅/⚠️/❌/⚪) | Notes                                 |
| ---- | -------------------------------------------------------------- | -------------------------- | -------------------- | ------------------------------------- |
| F-1  | ThemeProvider MUST apply CSS variables to :root via DOM        | MUST                       | ✅                   | ThemeProvider sets data attributes    |
| F-2  | ThemeProvider MUST support tenant customization                | MUST                       | ✅                   | data-tenant attribute                 |
| F-3  | ThemeProvider MUST support WCAG themes                         | MUST                       | ✅                   | data-theme attribute                  |
| F-4  | ThemeProvider MUST support safe mode                           | MUST                       | ✅                   | data-safe-mode attribute              |
| F-5  | ThemeProvider MUST support dark mode                           | MUST                       | ✅                   | data-mode or .dark class              |
| F-6  | Components MUST NOT import tokens directly from tokens.ts      | MUST                       | ❌                   | **VIOLATION: All components do this** |
| F-7  | Components MUST use Tailwind classes referencing CSS variables | MUST                       | ❌                   | **VIOLATION: Direct token imports**   |
| F-8  | tokens.ts MUST only be used for MCP validation                 | MUST                       | ✅                   | Not for component imports             |
| F-9  | MCP MUST validate component token usage                        | MUST                       | ⚪                   | MCP validation rules needed           |
| F-10 | ThemeProvider MUST wrap application root                       | MUST                       | ⚪                   | Required for theme to work            |

> **Critical Violations:**
>
> - F-6, F-7: All components violate theme-first architecture

---

## 3. Architecture & Design Patterns

### 3.1 ThemeProvider Architecture (CRITICAL)

> **THIS IS THE MOST CRITICAL SECTION** - Establishes how ThemeProvider controls CSS variables.

#### 3.1.1 ThemeProvider Flow

```text
┌─────────────────────────────────────────────────────────┐
│  globals.css (SSOT)                                     │
│  ─────────────────────────────────────────────────────  │
│  :root {                                                │
│    --color-bg-elevated: #ffffff;                        │
│  }                                                      │
│                                                         │
│  :root[data-tenant="dlbb"] {                           │
│    --accent-bg: #22c55e;                               │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ThemeProvider (Theme Manager)                          │
│  ─────────────────────────────────────────────────────  │
│  <McpThemeProvider                                      │
│    tenant="dlbb"                                        │
│    safeMode={false}                                     │
│    contrastMode="aa"                                    │
│  >                                                      │
│    {/* Sets data attributes on <html> */}              │
│    {/* <html data-tenant="dlbb" data-theme="aa"> */}   │
│    <App />                                              │
│  </McpThemeProvider>                                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Browser (CSS Variable Resolution)                      │
│  ─────────────────────────────────────────────────────  │
│  CSS matches :root[data-tenant="dlbb"]                 │
│  Applies --accent-bg: #22c55e;                         │
│  Components using bg-primary get emerald color          │
└─────────────────────────────────────────────────────────┘
```

#### 3.1.2 ThemeProvider Implementation

**Location:** `packages/ui/mcp/providers/ThemeProvider.tsx`

**Responsibilities:**

1. Apply `data-tenant` attribute to `<html>` element
2. Apply `data-theme` attribute for WCAG themes
3. Apply `data-safe-mode` attribute for safe mode
4. Apply `data-mode` or `.dark` class for dark mode
5. Load tenant overrides from MCP theme server (optional)
6. Validate theme configuration

**Example:**

```tsx
"use client";

import { McpThemeProvider } from "@aibos/ui/mcp/providers";

export function App() {
  return (
    <McpThemeProvider
      tenant="dlbb"
      safeMode={false}
      contrastMode="aa"
      darkMode={false}
    >
      {/* App content */}
    </McpThemeProvider>
  );
}
```

#### 3.1.3 Theme Attribute Application

**DOM Manipulation:**

- ThemeProvider sets attributes on `<html>` element
- CSS selectors in `globals.css` match these attributes
- CSS variables are applied based on matching selectors

**Attribute Priority:**

1. `data-safe-mode="true"` (highest priority)
2. `data-theme="wcag-aaa"` (WCAG themes)
3. `data-mode="dark"` or `.dark` class (dark mode)
4. `data-tenant="{tenant}"` (tenant customization)
5. Base `:root` (default)

### 3.2 Token Consumption Rules (CRITICAL)

#### 3.2.1 Allowed Patterns

**1. Tailwind Classes (Recommended):**

```tsx
// ✅ CORRECT - Tailwind classes reference CSS variables
<button className="bg-bg-elevated text-fg px-4 py-2 rounded-lg">
  Click me
</button>
```

**How it works:**

- Tailwind generates: `.bg-bg-elevated { background-color: var(--color-bg-elevated); }`
- ThemeProvider controls `--color-bg-elevated` via CSS selectors
- Components automatically respect theme

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
<div style={{ backgroundColor: "var(--color-bg-elevated)" }}>Content</div>
```

#### 3.2.2 Forbidden Patterns

**1. Direct Token Imports (VIOLATION):**

```tsx
// ❌ WRONG - Bypasses theme layer
import { colorTokens } from '../../../design/tokens/tokens'
<button className={colorTokens.bgElevated}>
```

**Why it's wrong:**

- `tokens.ts` provides static Tailwind class names (`"bg-bg-elevated"`)
- These classes reference CSS variables (`--color-bg-elevated`)
- But components bypass ThemeProvider that controls those CSS variables
- ThemeProvider can't inject tenant overrides, WCAG themes, or safe mode

**2. Hardcoded Values (VIOLATION):**

```tsx
// ❌ WRONG - Bypasses design system
<button className="bg-blue-600 text-white">
```

**3. Inline Styles with Hardcoded Colors (VIOLATION):**

```tsx
// ❌ WRONG - Bypasses theme layer
<button style={{ backgroundColor: '#2563eb' }}>
```

### 3.3 tokens.ts Purpose (CRITICAL)

#### 3.3.1 What tokens.ts Is For

**Purpose:**

- MCP validation (check if tokens exist)
- TypeScript types for token names
- Developer documentation
- IDE autocomplete (for reference only)

**Location:** `packages/ui/src/design/tokens/tokens.ts`

**Example:**

```typescript
// ✅ CORRECT - tokens.ts for MCP validation only
export const colorTokens = {
  bgElevated: "bg-bg-elevated", // Tailwind class name
  text: "text-fg",
} as const;

// MCP uses this to validate component token usage
// Components should NOT import this directly
```

#### 3.3.2 What tokens.ts Is NOT For

**Forbidden:**

- ❌ Component imports (components should use Tailwind classes)
- ❌ Runtime token resolution (ThemeProvider handles this)
- ❌ Token value storage (globals.css is SSOT)

### 3.4 Component Token Usage Patterns

#### 3.4.1 Shared Components (Server & Client Compatible)

```tsx
// ✅ CORRECT - No token imports, use Tailwind classes
export const Button = ({ variant = "default" }) => {
  return (
    <button
      className={cn(
        "bg-bg-elevated", // ✅ References --color-bg-elevated (theme-controlled)
        "text-fg", // ✅ References --color-fg (theme-controlled)
        "px-4 py-2", // ✅ Static spacing (theme-independent)
        "rounded-lg" // ✅ References --radius-lg (theme-controlled)
      )}
    >
      Click me
    </button>
  );
};
```

#### 3.4.2 Client Components (Interactive)

```tsx
"use client";

// ✅ CORRECT - Use Tailwind classes, theme hooks for dynamic logic
import { useThemeTokens } from "@aibos/ui/mcp/providers";

export const ThemeAwareButton = () => {
  const theme = useThemeTokens();

  // Use theme context for dynamic logic
  const isSafeMode = theme.safeMode;

  // Still use Tailwind classes for styling
  return (
    <button className="bg-bg-elevated text-fg">
      {isSafeMode ? "Safe Mode Active" : "Click me"}
    </button>
  );
};
```

#### 3.4.3 Server Components (Static)

```tsx
// ✅ CORRECT - No token imports, use Tailwind classes
export async function UserCard({ userId }: { userId: string }) {
  const user = await getUser(userId);

  return (
    <div className="bg-bg-elevated text-fg rounded-lg p-4">
      <h2 className="text-lg font-semibold">{user.name}</h2>
      <p className="text-fg-muted">{user.email}</p>
    </div>
  );
}
```

---

## 4. Directory & File Layout

### 4.1 Canonical Directory Tree

```text
packages/ui/
├── src/design/tokens/
│   ├── globals.css              # ⭐ SSOT: CSS variables (see GRCD-GLOBALS-CSS.md)
│   ├── tokens.ts                # TypeScript mappings (MCP validation only)
│   ├── server.ts                # Server-safe token utilities
│   └── client.ts                # Client-safe token utilities + hooks
├── mcp/providers/
│   └── ThemeProvider.tsx        # ⭐ Theme manager (applies CSS variables)
├── mcp/hooks/
│   └── useMcpTheme.ts          # Theme hook
└── GRCD-TOKEN-THEME.md          # ⭐ This document (SSOT)
```

### 4.2 File Responsibilities

**globals.css:**

- Defines all CSS variables (see GRCD-GLOBALS-CSS.md)

**tokens.ts:**

- TypeScript token mappings (for MCP validation only)
- NOT for component imports

**ThemeProvider.tsx:**

- Applies CSS variables to `<html>` via DOM attributes
- Manages theme state (tenant, WCAG, safe mode, dark mode)

**useMcpTheme.ts:**

- Hook for accessing theme context
- Fetches tenant overrides from MCP theme server (optional)

---

## 5. Dependencies & Compatibility

### 5.1 Dependencies

**Required:**

- `react` 19+ (for ThemeProvider component)
- `react-dom` 19+ (for DOM manipulation)

**Optional:**

- `@modelcontextprotocol/sdk` (for MCP theme server integration)

### 5.2 Compatibility

**Browser Requirements:**

- CSS Custom Properties support
- DOM manipulation APIs

---

## 6. Master Control Prompt (MCP) Profile

### 6.1 MCP Location

- **File:** `/mcp/ui-token-theme.mcp.json` (to be created)
- **Version:** `1.0.0`
- **Last Updated:** `2025-01-27`

### 6.2 MCP Constraints

```json
{
  "component": "token-theme",
  "version": "1.0.0",
  "intent": "Maintain token and theme layer following GRCD-TOKEN-THEME.md, enforcing theme-first architecture",
  "constraints": [
    "MUST follow GRCD-TOKEN-THEME.md structure",
    "MUST provide ThemeProvider to control CSS variables",
    "MUST NOT allow components to import tokens directly from tokens.ts",
    "MUST enforce theme-first architecture (CSS variables → ThemeProvider → Components)",
    "MUST validate all component token usage via MCP",
    "MUST support tenant customization through theme layer",
    "MUST support WCAG themes through theme layer",
    "MUST support safe mode through theme layer",
    "tokens.ts MUST only be used for MCP validation, not component imports"
  ],
  "input_sources": [
    "GRCD-TOKEN-THEME.md (packages/ui/GRCD-TOKEN-THEME.md)",
    "GRCD-GLOBALS-CSS.md (packages/ui/GRCD-GLOBALS-CSS.md)",
    "ThemeProvider.tsx (packages/ui/mcp/providers/ThemeProvider.tsx)",
    "tokens.ts (packages/ui/src/design/tokens/tokens.ts)"
  ],
  "output_targets": {
    "code": "packages/ui/mcp/providers/",
    "code": "packages/ui/src/design/tokens/"
  }
}
```

### 6.3 MCP Normative Requirements

- `THEME-MCP-1`: ThemeProvider MUST control CSS variables via DOM attributes.
- `THEME-MCP-2`: Components MUST NOT import tokens directly from `tokens.ts`.
- `THEME-MCP-3`: Components MUST use Tailwind classes referencing CSS variables.
- `THEME-MCP-4`: MCP MUST validate component token usage (flag direct imports).
- `THEME-MCP-5`: ThemeProvider MUST wrap application root.

---

## 7. Contracts & Schemas

### 7.1 Theme Architecture Contract

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

### 7.2 ThemeProvider Contract

**Contract:** ThemeProvider MUST apply CSS variables to `<html>` element.

**Schema:**

```typescript
type ThemeProviderProps = {
  tenant?: string; // Applies data-tenant attribute
  safeMode?: boolean; // Applies data-safe-mode attribute
  contrastMode?: "normal" | "aa" | "aaa"; // Applies data-theme attribute
  darkMode?: boolean; // Applies data-mode or .dark class
};
```

---

## 8. Error Handling & Recovery

### 8.1 Error Taxonomy

| Error Class            | When Thrown                                      | Recovery Strategy                     |
| ---------------------- | ------------------------------------------------ | ------------------------------------- |
| `TokenImportError`     | Component imports tokens directly from tokens.ts | Reject, guide to use Tailwind classes |
| `ThemeProviderError`   | ThemeProvider not found in component tree        | Warn, provide setup instructions      |
| `HardcodedValueError`  | Hardcoded color/spacing detected                 | Reject, guide to use CSS variables    |
| `ThemeValidationError` | Theme configuration invalid                      | Reject, validate theme props          |

---

## 9. Observability

### 9.1 Metrics

| Metric Name                    | Type    | Labels                    | Purpose                 | Target |
| ------------------------------ | ------- | ------------------------- | ----------------------- | ------ |
| `theme_token_violations_total` | Counter | violation_type, component | Token usage violations  | 0      |
| `theme_switches_total`         | Counter | theme_type                | Theme switching events  | N/A    |
| `theme_provider_missing_total` | Counter | component                 | ThemeProvider not found | 0      |

---

## 10. Critical Architectural Rules (Summary)

### 10.1 ThemeProvider Rules

1. **ThemeProvider controls CSS variables** - Applies via DOM attributes.
2. **ThemeProvider wraps app** - Must be in application root.
3. **Theme hierarchy** - Safe Mode > WCAG > Dark > Tenant > Base.

### 10.2 Token Consumption Rules

1. **No direct token imports** - Never `import { colorTokens } from 'tokens.ts'` in components.
2. **Use Tailwind classes** - Always `className="bg-bg-elevated"` not `colorTokens.bgElevated`.
3. **Theme hooks for dynamic values** - Use `useThemeTokens()` for theme context.

### 10.3 Validation Rules

1. **MCP validation** - All component token usage validated at build time.
2. **No hardcoded values** - All design values from CSS variables.
3. **Theme compliance** - All components respect theme layer.

---

**Status:** ✅ **GRCD-TOKEN-THEME v1.0.0 ESTABLISHED**  
**Next Steps:** Create MCP seed file, implement validation rules, migrate components
