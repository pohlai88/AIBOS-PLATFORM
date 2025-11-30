# 🧾 GRCD — globals.css (CSS Variables SSOT) — v1.0.0

**Version:** 1.0.0  
**Status:** Active (MCP-Governed Template & Reference)  
**Last Updated:** 2025-01-27  
**Owner:** Design System Team, Frontend Team

> **Purpose of this GRCD**
>
> This GRCD is the **single source of truth** for `globals.css` - the foundational CSS variables layer. It establishes the **correct architecture** where `globals.css` is the SSOT for all design tokens, preventing duplication, drift, and architectural violations.
>
> **Key Anti-Drift Mechanisms:**
>
> - CSS variable naming conventions (Section 3.1 - CRITICAL)
> - Token definition rules (Section 3.2 - CRITICAL)
> - Theme override patterns (Section 3.3 - CRITICAL)
> - No duplication policy (Section 4.1 - CRITICAL)

---

## 1. Purpose & Identity

**Component Name:** `globals.css` (CSS Variables Source of Truth)

**Domain:** `Design System Foundation` (CSS Variables Layer)

### 1.1 Purpose

**Purpose Statement:**

> `globals.css` is the **absolute source of truth** for all design tokens in the AI-BOS UI package. It defines all CSS custom properties (CSS variables) that form the foundation of the design system. No other file may define these tokens. All theme customization, tenant overrides, and WCAG compliance flow through CSS variable overrides in this file.

**Philosophical Foundation:**

1. **CSS Variables are SSOT:** All design tokens MUST be defined as CSS custom properties in `globals.css`.
2. **No Duplication:** Token values MUST NOT be duplicated in TypeScript files, JSON files, or other CSS files.
3. **Theme Flow:** Tenant customization, WCAG themes, and safe mode flow through CSS variable overrides.
4. **Tailwind Integration:** Tailwind v4 automatically maps CSS variables to utility classes.

### 1.2 Identity

- **Role:** `CSS Variables Source of Truth` – The single file that defines all design tokens as CSS custom properties.

- **Scope:**
  - All color tokens (surfaces, text, brand, status).
  - All spacing tokens (radii, shadows, layout).
  - All typography tokens (fonts).
  - Theme overrides (tenant, WCAG, safe mode).

- **Boundaries:**
  - Does **NOT** contain component-specific styles.
  - Does **NOT** contain utility classes (Tailwind handles this).
  - Does **NOT** contain hardcoded values (only CSS variables).
  - Does **NOT** duplicate token definitions elsewhere.

- **Non-Responsibility:**
  - `MUST NOT` define component styles.
  - `MUST NOT` define utility classes.
  - `MUST NOT` contain business logic.
  - `MUST NOT` be duplicated in other files.

### 1.3 Non-Negotiables (Constitutional Principles)

**Constitutional Principles:**

- `MUST` define all design tokens as CSS custom properties.
- `MUST NOT` duplicate token definitions in other files.
- `MUST` use semantic naming (`--color-*`, `--radius-*`, `--shadow-*`).
- `MUST` support theme overrides via CSS selectors (`:root[data-tenant]`, `:root[data-safe-mode]`).
- `MUST` maintain WCAG AA/AAA compliance in theme overrides.
- `MUST NOT` contain hardcoded component styles.
- `MUST NOT` be modified without GRCD review.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID   | Requirement                                                     | Priority (MUST/SHOULD/MAY) | Status (✅/⚠️/❌/⚪) | Notes                           |
| ---- | --------------------------------------------------------------- | -------------------------- | -------------------- | ------------------------------- |
| F-1  | globals.css MUST define all color tokens as CSS variables       | MUST                       | ✅                   | All colors defined              |
| F-2  | globals.css MUST define all spacing tokens as CSS variables     | MUST                       | ✅                   | Radii, shadows defined          |
| F-3  | globals.css MUST define all typography tokens as CSS variables  | MUST                       | ✅                   | Fonts defined                   |
| F-4  | globals.css MUST support tenant customization via CSS selectors | MUST                       | ✅                   | `:root[data-tenant]`            |
| F-5  | globals.css MUST support WCAG themes via CSS selectors          | MUST                       | ✅                   | WCAG AA/AAA themes              |
| F-6  | globals.css MUST support safe mode via CSS selectors            | MUST                       | ✅                   | `:root[data-safe-mode]`         |
| F-7  | globals.css MUST support dark mode via CSS selectors            | MUST                       | ✅                   | `.dark` or `[data-mode='dark']` |
| F-8  | globals.css MUST NOT contain component-specific styles          | MUST                       | ✅                   | Only CSS variables              |
| F-9  | globals.css MUST NOT duplicate token definitions                | MUST                       | ✅                   | Single source of truth          |
| F-10 | globals.css SHOULD be imported in app root                      | SHOULD                     | ✅                   | apps/web/app/globals.css        |

### 2.2 Non-Functional Requirements

| ID   | Requirement           | Target                                      | Measurement Source      | Status |
| ---- | --------------------- | ------------------------------------------- | ----------------------- | ------ |
| NF-1 | File size             | <50KB uncompressed                          | File size check         | ✅     |
| NF-2 | CSS variable count    | <200 CSS variables                          | CSS variable extraction | ✅     |
| NF-3 | Load time             | <10ms parse time                            | Performance profiling   | ⚪     |
| NF-4 | Browser compatibility | All modern browsers (CSS custom properties) | Browser testing         | ✅     |

---

## 3. Architecture & Design Patterns

### 3.1 CSS Variable Naming Conventions (CRITICAL)

> **THIS IS THE MOST CRITICAL SECTION** - Establishes naming patterns to prevent drift.

#### 3.1.1 Color Token Naming

**Pattern:** `--color-{category}-{variant}`

```css
/* ✅ CORRECT - Semantic naming */
:root {
  /* Surfaces */
  --color-bg: #f9fafb;
  --color-bg-muted: #f3f4f6;
  --color-bg-elevated: #ffffff;

  /* Text */
  --color-fg: #111827;
  --color-fg-muted: #6b7280;
  --color-fg-subtle: #9ca3af;

  /* Brand */
  --color-primary: var(--accent-bg);
  --color-primary-soft: var(--accent-subtle);
  --color-primary-foreground: var(--accent-foreground);

  /* Status */
  --color-success: #16a34a;
  --color-success-soft: rgba(22, 163, 74, 0.1);
  --color-success-foreground: #f9fafb;

  /* Borders */
  --color-border: #e5e7eb;
  --color-border-subtle: #f3f4f6;
}
```

**Rules:**

- `--color-{category}` for base colors (bg, fg, primary, success, etc.)
- `--color-{category}-{variant}` for variants (muted, elevated, soft, etc.)
- `--color-{category}-foreground` for text-on-color pairs
- `--accent-*` for tenant-customizable brand colors
- `--color-*` for component-consumable tokens

#### 3.1.2 Spacing Token Naming

**Pattern:** `--{category}-{size}`

```css
/* ✅ CORRECT - Semantic naming */
:root {
  /* Radii */
  --radius-xs: 0.25rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 6px 16px 0 rgb(15 23 42 / 0.08);
  --shadow-lg: 0 14px 32px 0 rgb(15 23 42 / 0.16);

  /* Layout */
  --sidebar-width: 16rem;
  --topbar-height: 3.5rem;
}
```

**Rules:**

- `--radius-{size}` for border radius
- `--shadow-{size}` for box shadows
- `--{component}-{dimension}` for layout tokens (sidebar-width, topbar-height)

#### 3.1.3 Typography Token Naming

**Pattern:** `--font-{category}`

```css
/* ✅ CORRECT - Semantic naming */
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}
```

**Rules:**

- `--font-{category}` for font families
- No font-size tokens (use Tailwind typography scale)
- No font-weight tokens (use Tailwind font-weight scale)

### 3.2 Token Definition Rules (CRITICAL)

#### 3.2.1 Base Tokens (Light Mode)

**Location:** `:root { }`

**Rules:**

- Define all base tokens in `:root`
- Use semantic color values (not arbitrary)
- Ensure WCAG AA compliance for base colors
- Use `rem` units for spacing (radii, layout)
- Use `rgba()` for transparency

**Example:**

```css
:root {
  /* ✅ CORRECT - Base tokens */
  --color-bg: #f9fafb; /* gray-50 */
  --color-fg: #111827; /* gray-900 */
  --radius-md: 0.5rem;
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
```

#### 3.2.2 Dark Mode Tokens

**Location:** `.dark, :root[data-mode='dark'] { }`

**Rules:**

- Override base tokens for dark mode
- Maintain WCAG AA compliance
- Use `color-scheme: dark;` for browser defaults
- Adjust colors for dark backgrounds

**Example:**

```css
.dark,
:root[data-mode="dark"] {
  color-scheme: dark;

  /* ✅ CORRECT - Dark mode overrides */
  --color-bg: #020617; /* slate-950-like */
  --color-fg: #e5e7eb; /* gray-200 */
  --color-border: #1f2937; /* gray-800 */
}
```

#### 3.2.3 Tenant Customization

**Location:** `:root[data-tenant='{tenant}'] { }`

**Rules:**

- Only override `--accent-*` tokens (brand colors)
- Bridge to `--color-primary` via `var(--accent-bg)`
- Never override WCAG compliance colors
- Never override safe mode colors

**Example:**

```css
/* ✅ CORRECT - Tenant customization */
:root[data-tenant="dlbb"] {
  --accent-bg: #22c55e; /* emerald-500 - DLBB brand */
  --accent-bg-hover: #16a34a; /* emerald-600 */
  --accent-bg-active: #15803d; /* emerald-700 */
  --accent-subtle: rgba(34, 197, 94, 0.12);
  --accent-foreground: #f0fdf4; /* emerald-50 */

  /* Bridge to component tokens */
  --color-primary: var(--accent-bg);
  --color-primary-soft: var(--accent-subtle);
  --color-primary-foreground: var(--accent-foreground);
  --color-ring: var(--accent-bg);
}
```

#### 3.2.4 WCAG Themes

**Location:** `:root[data-theme='wcag-aa']`, `:root[data-theme='wcag-aaa']`

**Rules:**

- WCAG themes are **immutable** (cannot be overridden by tenants)
- Must maintain contrast ratios (AA: 4.5:1, AAA: 7:1)
- Override status colors for compliance
- Never override in tenant selectors

**Example:**

```css
/* ✅ CORRECT - WCAG AAA theme (immutable) */
:root[data-theme="wcag-aaa"] {
  --color-success: #14532d; /* green-900 - WCAG AAA compliant */
  --color-warning: #92400e; /* amber-800 - WCAG AAA compliant */
  --color-danger: #7f1d1d; /* red-900 - WCAG AAA compliant */
}
```

#### 3.2.5 Safe Mode

**Location:** `:root[data-safe-mode='true']`, `:root.safe-mode { }`

**Rules:**

- Safe mode is **immutable** (cannot be overridden)
- Neutralize strong accents
- Flatten shadows
- Maintain WCAG AAA compliance

**Example:**

```css
/* ✅ CORRECT - Safe mode (immutable) */
:root[data-safe-mode="true"],
:root.safe-mode {
  /* Neutralize accents */
  --color-primary: var(--color-fg);
  --color-primary-soft: var(--color-border-subtle);
  --color-primary-foreground: var(--color-bg);

  /* Flatten shadows */
  --shadow-xs: none;
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
}
```

### 3.3 Theme Override Hierarchy (CRITICAL)

**Priority Order (Highest to Lowest):**

1. **Safe Mode** (`:root[data-safe-mode='true']`) - Highest priority, immutable
2. **WCAG Themes** (`:root[data-theme='wcag-aaa']`) - Immutable
3. **Dark Mode** (`.dark`, `:root[data-mode='dark']`) - User preference
4. **Tenant Customization** (`:root[data-tenant='{tenant}']`) - Brand customization
5. **Base Tokens** (`:root`) - Default values

**CSS Specificity Rules:**

- More specific selectors override less specific
- Later rules override earlier rules (if same specificity)
- `!important` MUST NOT be used

**Example:**

```css
/* Base (lowest priority) */
:root {
  --color-primary: #2563eb; /* blue-600 */
}

/* Tenant override (higher priority) */
:root[data-tenant="dlbb"] {
  --color-primary: #22c55e; /* emerald-500 */
}

/* Dark mode (higher priority) */
.dark {
  --color-primary: #60a5fa; /* blue-400 */
}

/* Safe mode (highest priority, immutable) */
:root[data-safe-mode="true"] {
  --color-primary: var(--color-fg); /* Neutralized */
}
```

---

## 4. Directory & File Layout

### 4.1 File Location

**Canonical Path:** `packages/ui/src/design/tokens/globals.css`

**Rules:**

- `MUST` be located at this exact path
- `MUST NOT` be duplicated or moved
- `MUST` be imported in app root: `apps/web/app/globals.css`

### 4.2 File Structure

**Required Sections (in order):**

1. **Header Comments** - MCP architecture notes, consumption pattern
2. **Tailwind Import** - `@import 'tailwindcss';`
3. **Base Theme Tokens** - `:root { }` with all base tokens
4. **Dark Mode** - `.dark, :root[data-mode='dark'] { }`
5. **Tenant Overrides** - `:root[data-tenant='{tenant}'] { }`
6. **Safe Mode** - `:root[data-safe-mode='true'] { }`
7. **Base Document Styling** - `body { }` with token usage
8. **Global Accessibility Rules** - Focus, reduced motion, etc.
9. **MCP Guardian Rules** - Validation indicators, compliance helpers

### 4.3 File Naming & Organization

**Rules:**

- File name: `globals.css` (exact, no variations)
- No other CSS files may define design tokens
- Theme files (`themes/*.css`) may import but not redefine tokens

---

## 5. Dependencies & Compatibility

### 5.1 Dependencies

**Required:**

- `tailwindcss` v4+ (for CSS variable mapping)

**No JavaScript Dependencies:**

- `globals.css` is pure CSS
- No React, TypeScript, or Node.js dependencies

### 5.2 Browser Compatibility

**Minimum Requirements:**

- CSS Custom Properties (CSS Variables) support
- Modern browsers (Chrome 49+, Firefox 31+, Safari 9.1+, Edge 16+)

---

## 6. Master Control Prompt (MCP) Profile

### 6.1 MCP Location

- **File:** `/mcp/ui-globals-css.mcp.json` (to be created)
- **Version:** `1.0.0`
- **Last Updated:** `2025-01-27`

### 6.2 MCP Constraints

```json
{
  "component": "globals.css",
  "version": "1.0.0",
  "intent": "Maintain globals.css as SSOT for all CSS variables, following GRCD-GLOBALS-CSS.md specifications",
  "constraints": [
    "MUST follow GRCD-GLOBALS-CSS.md structure",
    "MUST define all tokens as CSS custom properties",
    "MUST NOT duplicate token definitions",
    "MUST use semantic naming conventions (--color-*, --radius-*, --shadow-*)",
    "MUST support theme overrides via CSS selectors",
    "MUST maintain WCAG AA/AAA compliance",
    "MUST NOT contain component-specific styles",
    "MUST NOT use !important",
    "MUST follow theme override hierarchy (Safe Mode > WCAG > Dark > Tenant > Base)"
  ],
  "input_sources": [
    "GRCD-GLOBALS-CSS.md (packages/ui/GRCD-GLOBALS-CSS.md)",
    "globals.css (packages/ui/src/design/tokens/globals.css)",
    "Design system specifications"
  ],
  "output_targets": {
    "code": "packages/ui/src/design/tokens/globals.css"
  }
}
```

### 6.3 MCP Normative Requirements

- `CSS-MCP-1`: All CSS variable definitions MUST be in `globals.css` only.
- `CSS-MCP-2`: CSS variable naming MUST follow semantic conventions.
- `CSS-MCP-3`: Theme overrides MUST follow hierarchy (Safe Mode > WCAG > Dark > Tenant > Base).
- `CSS-MCP-4`: WCAG and Safe Mode themes MUST be immutable.
- `CSS-MCP-5`: Tenant customization MUST only override `--accent-*` tokens.

---

## 7. Contracts & Schemas

### 7.1 CSS Variable Schema

**Contract:** All design tokens MUST be defined as CSS custom properties in `globals.css`.

**Schema:**

```typescript
type CSSVariable = {
  name: string; // e.g., "--color-bg-elevated"
  value: string; // e.g., "#ffffff" or "var(--accent-bg)"
  category: "color" | "radius" | "shadow" | "font" | "layout";
  themeable: boolean; // Can be overridden by tenant
  wcagCompliant: boolean; // Meets WCAG AA/AAA
  safeModeCompatible: boolean; // Works in safe mode
};
```

### 7.2 Validation Rules

**MCP Validation:**

- All CSS variables must be defined in `globals.css`
- No duplicate variable names
- All variables follow naming conventions
- Theme hierarchy is respected
- WCAG compliance is maintained

---

## 8. Error Handling & Recovery

### 8.1 Error Taxonomy

| Error Class            | When Thrown                                   | Recovery Strategy                         |
| ---------------------- | --------------------------------------------- | ----------------------------------------- |
| `DuplicateTokenError`  | CSS variable defined multiple times           | Remove duplicates, keep single definition |
| `NamingViolationError` | CSS variable doesn't follow naming convention | Rename to follow convention               |
| `ThemeHierarchyError`  | Theme override violates hierarchy             | Reorder selectors, fix specificity        |
| `WCAGViolationError`   | Color doesn't meet WCAG contrast              | Adjust color values                       |

---

## 9. Observability

### 9.1 Metrics

| Metric Name                     | Type    | Labels        | Purpose                       | Target |
| ------------------------------- | ------- | ------------- | ----------------------------- | ------ |
| `css_variables_total`           | Gauge   | category      | Total CSS variables defined   | <200   |
| `css_duplicate_variables_total` | Counter | variable_name | Duplicate variable detections | 0      |
| `css_naming_violations_total`   | Counter | variable_name | Naming convention violations  | 0      |

---

## 10. Critical Architectural Rules (Summary)

### 10.1 CSS Variable Rules

1. **`globals.css` is SSOT** - All CSS variables defined here only.
2. **Semantic naming** - Use `--color-*`, `--radius-*`, `--shadow-*` patterns.
3. **No duplication** - Never define tokens in other files.
4. **Theme hierarchy** - Safe Mode > WCAG > Dark > Tenant > Base.

### 10.2 Theme Override Rules

1. **Tenant customization** - Only override `--accent-*` tokens.
2. **WCAG themes** - Immutable, maintain contrast ratios.
3. **Safe mode** - Immutable, neutralize accents.
4. **Dark mode** - User preference, adjust for dark backgrounds.

### 10.3 Validation Rules

1. **MCP validation** - All CSS variables validated at build time.
2. **No duplicates** - Each variable defined once.
3. **Naming compliance** - All variables follow conventions.
4. **Theme compliance** - Hierarchy respected.

---

**Status:** ✅ **GRCD-GLOBALS-CSS v1.0.0 ESTABLISHED**  
**Next Steps:** Create MCP seed file, implement validation rules
