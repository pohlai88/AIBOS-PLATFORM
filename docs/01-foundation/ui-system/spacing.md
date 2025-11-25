# Spacing System

> **4px Base Grid System** - Token-First, WCAG-Compliant, MCP-Validated  
> **Version:** 2.0.0  
> **Last Updated:** 2025-01-27  
> **Status:** ✅ SSOT - Single Source of Truth

---

## Overview

The AI-BOS spacing system provides a **unified, token-driven 4px baseline** that ensures:

- ✅ Visual consistency across all components
- ✅ Predictable layouts and responsive scaling
- ✅ WCAG AA/AAA accessibility compliance
- ✅ MCP-governed enforcement
- ✅ Multi-tenant theming support
- ✅ Safe Mode accessibility enforcement

**Core Principle:** Spacing is an **immutable design law** for all components. All spacing **MUST** be token-based (no raw px values).

**Validated Against:**

- ✅ Tailwind MCP (token validation)
- ✅ Figma MCP (design-to-code sync)
- ✅ React MCP (no raw px enforcement)
- ✅ A11y MCP (WCAG compliance)

---

## 4px Baseline Grid (Core Rule)

**All spacing MUST be a multiple of 4px.**

### Why 4px Baseline?

| Metric                    | Reason                               |
| ------------------------- | ------------------------------------ |
| 🔍 **Precision**          | Snaps cleanly at all DPIs (1x/2x/3x) |
| 📱 **Mobile-friendly**    | Enables compact, dense layouts       |
| 🧩 **Industry standard**  | Used by Material, Apple, Atlassian   |
| 🔧 **Developer-friendly** | Easy mental math (4, 8, 12, 16…)     |

**Alternatives Considered:**

- ❌ **8px** - Too large for compact UIs, loses flexibility
- ❌ **2px** - Too granular, harder to maintain consistency
- ✅ **4px** - Optimal balance between flexibility and consistency

**Validated:** ✅ All spacing values are multiples of 4px (enforced by MCP)

---

## Spacing Scale

### Standard Spacing Values

```
0px   (0)     - Reset, no spacing
4px   (1)     - xs - Tight padding, minimal gaps
8px   (2)     - sm - Small gaps, compact layouts ← Most common
12px  (3)     - md- - Compact layouts, form rows
16px  (4)     - md - Default gaps, standard padding ← Default
20px  (5)     - md+ - Medium spacing
24px  (6)     - lg - Section spacing, card padding
32px  (8)     - xl - Large sections, modal padding
40px  (10)    - 2xl - Extra large spacing
48px  (12)    - 3xl - Page sections, hero spacing
64px  (16)    - 4xl - Hero sections, major breaks
```

### Tailwind v4 Mapping

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
}
```

### TypeScript Access

```typescript
import { spacingTokens } from "@aibos/ui/design/tokens";

spacingTokens.xs; // "px-2 py-1"  (8px horizontal, 4px vertical)
spacingTokens.sm; // "px-3 py-1.5"  (12px horizontal, 6px vertical)
spacingTokens.md; // "px-4 py-2"  (16px horizontal, 8px vertical)
spacingTokens.lg; // "px-5 py-2.5"  (20px horizontal, 10px vertical)
```

**Usage:**

```tsx
// ✅ CORRECT: Use spacing tokens
<button className={spacingTokens.md}>
  Click me
</button>

// ❌ INCORRECT: Raw px values (FORBIDDEN)
<button className="px-[13px] py-[7px]">
  Click me
</button>
```

**Validated:** ✅ All spacing values are multiples of 4px (enforced by React MCP)

---

## Semantic Spacing Tokens (REQUIRED)

**Semantic spacing tokens map spacing to meaning, not just size.**

These tokens provide:

- ✅ Better MCP validation
- ✅ Figma → Code mapping
- ✅ Tenant theming support
- ✅ Accessibility enforcement
- ✅ Component-specific spacing rules

### Component-Level Semantic Tokens

```css
:root {
  /* Button spacing */
  --space-button-y: var(--space-2); /* 8px vertical */
  --space-button-x: var(--space-4); /* 16px horizontal */

  /* Input spacing */
  --space-input-y: var(--space-3); /* 12px vertical (WCAG minimum) */
  --space-input-x: var(--space-4); /* 16px horizontal */

  /* Card spacing */
  --space-card-padding: var(--space-6); /* 24px */
  --space-card-gap: var(--space-4); /* 16px */

  /* Section spacing */
  --space-section-gap: var(--space-8); /* 32px */
  --space-section-padding: var(--space-6); /* 24px */

  /* Grid spacing */
  --space-grid-gap: var(--space-6); /* 24px */

  /* Table spacing */
  --space-table-row-padding: var(--space-4); /* 16px */
  --space-table-cell-padding: var(--space-3); /* 12px */

  /* List spacing */
  --space-list-item-spacing: var(--space-4); /* 16px */
}
```

### TypeScript Semantic Tokens

```typescript
export const semanticSpacingTokens = {
  // Button spacing
  buttonY: "py-[var(--space-button-y)]",
  buttonX: "px-[var(--space-button-x)]",

  // Input spacing
  inputY: "py-[var(--space-input-y)]",
  inputX: "px-[var(--space-input-x)]",

  // Card spacing
  cardPadding: "p-[var(--space-card-padding)]",
  cardGap: "gap-[var(--space-card-gap)]",

  // Section spacing
  sectionGap: "gap-[var(--space-section-gap)]",
  sectionPadding: "p-[var(--space-section-padding)]",

  // Grid spacing
  gridGap: "gap-[var(--space-grid-gap)]",

  // Table spacing
  tableRowPadding: "py-[var(--space-table-row-padding)]",
  tableCellPadding: "px-[var(--space-table-cell-padding)]",

  // List spacing
  listItemSpacing: "space-y-[var(--space-list-item-spacing)]",
} as const;
```

**Usage:**

```tsx
// ✅ CORRECT: Use semantic tokens
<button className={`${semanticSpacingTokens.buttonX} ${semanticSpacingTokens.buttonY}`}>
  Button
</button>

<div className={semanticSpacingTokens.cardPadding}>
  Card content
</div>
```

**Validated:** ✅ Semantic tokens exist in `globals.css` (via Tailwind MCP)

---

## Accessibility Spacing Rules (WCAG AA/AAA)

### Minimum Touch Target Size

**WCAG Requirement:** Interactive elements must have a minimum touch target of **44px × 44px** ([SC 2.5.5 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size.html))

**Implementation:**

```css
/* Minimum touch target spacing */
:root[data-theme="wcag-aa"],
:root[data-theme="wcag-aaa"] {
  --space-touch-target: var(--space-11); /* 44px (11 * 4px) */
  --space-button-min-height: var(--space-11); /* 44px minimum */
  --space-icon-button-min: var(--space-11); /* 44px × 44px */
}
```

**Component Implementation:**

```tsx
// ✅ CORRECT: WCAG-compliant button
<button
  className="min-h-[44px] min-w-[44px]"
  style={{
    minHeight: "var(--space-touch-target)",
    minWidth: "var(--space-touch-target)",
  }}
>
  <Icon />
</button>
```

### Minimum Input Padding

**WCAG Requirement:** Input fields must have minimum **12px vertical padding** for readability.

**Implementation:**

```css
:root[data-theme="wcag-aa"],
:root[data-theme="wcag-aaa"] {
  --space-input-y-min: var(--space-3); /* 12px minimum */
}
```

### Minimum Line Spacing

**WCAG Requirements:**

- **AA:** Line height ≥ 1.5× font size
- **AAA:** Line height ≥ 1.6× font size
- **Paragraph spacing:** 2× line height

**Implementation:**

```css
:root[data-theme="wcag-aa"] {
  --line-height-normal: 1.5;
  --space-paragraph: calc(1em * 1.5 * 2); /* 2× line height */
}

:root[data-theme="wcag-aaa"] {
  --line-height-normal: 1.6;
  --space-paragraph: calc(1em * 1.6 * 2); /* 2× line height */
}
```

### Safe Mode Spacing Enforcement

**Safe Mode forces WCAG AAA minimums, regardless of tenant overrides:**

```css
[data-safe-mode="true"] {
  /* Enforce WCAG AAA minimums */
  --space-button-y: var(--space-3); /* 12px minimum */
  --space-button-x: var(--space-4); /* 16px minimum */
  --space-input-y: var(--space-3); /* 12px minimum */
  --space-touch-target: var(--space-11); /* 44px minimum */
}
```

**Validated:** ✅ WCAG spacing requirements enforced (via A11y MCP)

---

## Density Modes (Global Requirement)

**Every component MUST support density modes for different use cases:**

| Density              | Purpose           | Spacing Example | Use Case                   |
| -------------------- | ----------------- | --------------- | -------------------------- |
| **Compact**          | Enterprise tables | 4px + 8px       | Data tables, dashboards    |
| **Normal (default)** | Standard UI       | 12px + 16px     | Standard components        |
| **Spacious**         | Forms, onboarding | 20px + 24px     | Forms, onboarding, content |

### Density Token Implementation

```css
:root {
  /* Normal density (default) */
  --space-button-y: var(--space-2); /* 8px */
  --space-button-x: var(--space-4); /* 16px */
  --space-card-padding: var(--space-6); /* 24px */
}

[data-density="compact"] {
  /* Compact density */
  --space-button-y: var(--space-1); /* 4px */
  --space-button-x: var(--space-2); /* 8px */
  --space-card-padding: var(--space-4); /* 16px */
}

[data-density="spacious"] {
  /* Spacious density */
  --space-button-y: var(--space-5); /* 20px */
  --space-button-x: var(--space-6); /* 24px */
  --space-card-padding: var(--space-8); /* 32px */
}
```

**Usage:**

```tsx
// Component automatically adapts to density
<div data-density="compact">
  <DataTable /> {/* Uses compact spacing */}
</div>

<div data-density="spacious">
  <Form /> {/* Uses spacious spacing */}
</div>
```

**Validated:** ✅ Density modes supported (via React MCP)

---

## Spacing Patterns

### Buttons

```tsx
// ✅ CORRECT: Use spacing tokens
<button className={spacingTokens.xs}>  {/* px-2 py-1 (8px × 4px) */}
  Small
</button>

<button className={spacingTokens.sm}>  {/* px-3 py-1.5 (12px × 6px) */}
  Default
</button>

<button className={spacingTokens.md}>  {/* px-4 py-2 (16px × 8px) */}
  Medium
</button>

<button className={spacingTokens.lg}>  {/* px-5 py-2.5 (20px × 10px) */}
  Large
</button>
```

### Cards

```tsx
// ✅ CORRECT: Use semantic tokens
<div className={semanticSpacingTokens.cardPadding}>
  {/* Card content */}
</div>

// Or use standard tokens
<div className="p-4">  {/* 16px - Compact */}
  Compact card
</div>

<div className="p-6">  {/* 24px - Default */}
  Default card
</div>

<div className="p-8">  {/* 32px - Spacious */}
  Spacious card
</div>
```

### Form Layouts

```tsx
// ✅ CORRECT: Use semantic spacing
<form className="space-y-8">
  {" "}
  {/* --space-section-gap (32px) */}
  <div className="space-y-4">
    {" "}
    {/* --space-4 (16px) */}
    <label>Label</label>
    <input className={semanticSpacingTokens.inputY} />
  </div>
  <div className="flex gap-3">
    {" "}
    {/* --space-3 (12px) */}
    <button>Cancel</button>
    <button>Submit</button>
  </div>
</form>
```

---

## Grid & Layout Spacing

### Dashboard Grids

```tsx
// ✅ CORRECT: Use semantic grid gap
<div className={`grid grid-cols-3 ${semanticSpacingTokens.gridGap}`}>
  <Card />
  <Card />
  <Card />
</div>

// Or use standard tokens
<div className="grid grid-cols-3 gap-6">  {/* 24px gap */}
  <Card />
</div>
```

### Navigation Spacing

```tsx
// ✅ CORRECT: Use semantic spacing
<nav className={`flex items-center ${semanticSpacingTokens.listItemSpacing}`}>
  <Link>Home</Link>
  <Link>About</Link>
  <Link>Contact</Link>
</nav>
```

---

## Vertical Rhythm (Typography Spacing)

**Vertical rhythm ensures consistent spacing between text elements:**

### Typography Spacing Rules

```css
:root {
  /* Vertical rhythm - based on line height */
  --space-heading-after: calc(1em * 1.5); /* 1.5× line height after headings */
  --space-paragraph-after: calc(
    1em * 1.5 * 2
  ); /* 2× line height after paragraphs */
  --space-list-item: var(--space-4); /* 16px between list items */
}
```

**Usage:**

```tsx
// ✅ CORRECT: Vertical rhythm
<article className="space-y-6">
  {" "}
  {/* Paragraph spacing */}
  <h1 className="mb-4">Heading</h1> {/* Heading spacing */}
  <p>Paragraph content</p>
  <p>Next paragraph</p>
</article>
```

**WCAG Requirements:**

- **AA:** Line height ≥ 1.5× font size
- **AAA:** Line height ≥ 1.6× font size
- **Paragraph spacing:** 2× line height minimum

---

## Responsive Spacing Rules

### Scaling Model

**Responsive spacing scales by breakpoint:**

- **Mobile (base):** Baseline spacing (1×)
- **Tablet (md):** +1 step (e.g., 16px → 24px)
- **Desktop (lg):** +2 steps (e.g., 16px → 32px)

**Example:**

```tsx
// ✅ CORRECT: Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</div>

<div className="gap-4 md:gap-6 lg:gap-8">
  {/* Responsive gap */}
</div>

<div className="space-y-4 md:space-y-6 lg:space-y-8">
  {/* Responsive vertical spacing */}
</div>
```

**Breakpoints:**

- **Mobile:** Base spacing (4px, 8px, 16px)
- **Tablet (md):** +1 step (6px, 12px, 24px)
- **Desktop (lg):** +2 steps (8px, 16px, 32px)

---

## Enterprise Component Spacing

### Data Tables (TanStack Table)

**Table spacing requirements:**

```tsx
// ✅ CORRECT: Table spacing
<table className="w-full">
  <thead>
    <tr className={semanticSpacingTokens.tableRowPadding}>
      <th className={semanticSpacingTokens.tableCellPadding}>Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className={semanticSpacingTokens.tableRowPadding}>
      <td className={semanticSpacingTokens.tableCellPadding}>Cell</td>
    </tr>
  </tbody>
</table>
```

**Density modes for tables:**

- **Compact:** `--space-table-row-padding: var(--space-2)` (8px)
- **Normal:** `--space-table-row-padding: var(--space-4)` (16px)
- **Spacious:** `--space-table-row-padding: var(--space-6)` (24px)

### Charts (Recharts/Visx)

**Chart spacing requirements:**

```tsx
// ✅ CORRECT: Chart spacing
<div className="p-6 space-y-4">
  <h3>Chart Title</h3>
  <LineChart data={data} />
  <p className="text-sm">Chart description</p>
</div>
```

### Forms

**Form spacing requirements:**

```tsx
// ✅ CORRECT: Form spacing
<form className="space-y-6">
  <div className="space-y-4">
    <label>Field Label</label>
    <input className={semanticSpacingTokens.inputY} />
    <FormError>Error message</FormError>
  </div>
</form>
```

---

## MCP Validation Rules

### React MCP Validates

**React MCP will block commits if:**

- ❌ Spacing uses raw `px` values (e.g., `px-[13px]`)
- ❌ Spacing is not a multiple of 4px
- ❌ Spacing tokens are not used where required
- ❌ Component doesn't support density modes (if applicable)

**Example Validation:**

```typescript
// ❌ FAILS: Raw px value
<button className="px-[13px] py-[7px]">Button</button>

// ❌ FAILS: Not multiple of 4px
<button className="px-[15px] py-[9px]">Button</button>

// ✅ PASSES: Uses tokens
<button className={spacingTokens.md}>Button</button>
```

### Tailwind MCP Validates

**Tailwind MCP validates:**

- ✅ Token exists in `globals.css`
- ✅ Token value is valid (multiple of 4px)
- ✅ Semantic tokens are used correctly

### A11y MCP Validates

**A11y MCP validates:**

- ✅ Touch targets meet 44px minimum (WCAG AA/AAA)
- ✅ Input padding meets 12px minimum (WCAG AA/AAA)
- ✅ Line spacing meets 1.5× minimum (WCAG AA)
- ✅ Line spacing meets 1.6× minimum (WCAG AAA)
- ✅ Safe Mode enforces WCAG AAA minimums

### Figma MCP Validates

**Figma MCP validates:**

- ✅ Spacing tokens map correctly to Figma variables
- ✅ No rogue spacing values in design
- ✅ Responsive mapping aligns with code

---

## RSC Compatibility

**Spacing utilities are RSC-safe:**

- ✅ **Allowed in Server Components** - Spacing utilities compile to static CSS classes
- ✅ **No browser APIs** - Spacing doesn't depend on browser APIs
- ✅ **No hydration issues** - Spacing is CSS-only

**Example:**

```tsx
// ✅ CORRECT: Spacing in Server Component
export default async function Page() {
  const data = await fetchData();
  return (
    <div className="p-6 space-y-4">
      <h1>Server Component</h1>
      <p>{data.content}</p>
    </div>
  );
}
```

**Note:** Spacing utilities work in both Server and Client Components.

---

## Figma Alignment (Required)

### Figma Variable Mapping

**Spacing tokens must map to Figma variables:**

```
Figma Variable          → CSS Variable          → TypeScript Token
─────────────────────────────────────────────────────────────────
space/1                 → --space-1             → spacingTokens.xs
space/2                 → --space-2             → spacingTokens.sm
space/4                 → --space-4             → spacingTokens.md
space/6                 → --space-6             → spacingTokens.lg
space/button-y          → --space-button-y      → semanticSpacingTokens.buttonY
space/card-padding      → --space-card-padding  → semanticSpacingTokens.cardPadding
```

### Figma MCP Sync Workflow

```typescript
// 1. Extract spacing from Figma
const figmaSpacing = await mcp_Figma_get_variable_defs({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "SPACING_NODE",
});

// 2. Map to CSS variables
const cssSpacing = mapFigmaToCSS(figmaSpacing, {
  "space/1": "--space-1",
  "space/2": "--space-2",
  "space/button-y": "--space-button-y",
  // ... etc
});

// 3. Update globals.css
await updateGlobalsCSS(cssSpacing);

// 4. Validate with Tailwind MCP
const validation = await mcp_Tailwind_validate_token_exists({
  tokenName: "--space-1",
});
```

**Validated:** ✅ Figma MCP integration available

---

## Spacing Guidelines

### When to Use Each Size

**4px (space-1):**

- Tight padding in compact components
- Minimal gaps in dense layouts
- Icon spacing in toolbars
- Compact density mode

**8px (space-2):**

- Small gaps between related elements
- Icon groups
- Form field spacing (compact)
- Button vertical padding (compact)

**12px (space-3):**

- Compact layouts
- Form rows
- Input vertical padding (WCAG minimum)
- Table cell padding

**16px (space-4):**

- Default padding in components
- Standard gaps between elements
- Form field spacing (default)
- List item spacing

**24px (space-6):**

- Card padding (default)
- Section spacing
- Form section spacing
- Grid gaps

**32px (space-8):**

- Modal padding
- Large section spacing
- Page section breaks
- Spacious density mode

**48px (space-12):**

- Hero sections
- Major page breaks
- Large modal padding

**64px (space-16):**

- Hero sections
- Major visual breaks
- Landing page spacing

---

## Best Practices

### ✅ DO

**Token Usage:**

- ✅ Use spacing tokens (never raw px values)
- ✅ Use semantic tokens when available
- ✅ Use multiples of 4px
- ✅ Maintain consistent spacing patterns
- ✅ Consider responsive spacing needs
- ✅ Support density modes (compact, normal, spacious)
- ✅ Enforce WCAG minimums in AA/AAA themes

**Component Spacing:**

- ✅ Use semantic tokens for component-specific spacing
- ✅ Support density modes for enterprise components
- ✅ Ensure touch targets meet 44px minimum
- ✅ Ensure input padding meets 12px minimum

**Responsive:**

- ✅ Use responsive spacing utilities
- ✅ Scale spacing by breakpoint (+1 step tablet, +2 steps desktop)
- ✅ Test spacing on all screen sizes

### ❌ DON'T

**Token Usage:**

- ❌ Use arbitrary spacing values (5px, 7px, 13px)
- ❌ Use raw px values (`px-[13px]`)
- ❌ Mix different spacing scales
- ❌ Ignore 4px baseline rule
- ❌ Skip semantic tokens when available

**Component Spacing:**

- ❌ Use spacing for layout (use flex/grid instead)
- ❌ Ignore WCAG minimum spacing requirements
- ❌ Ignore responsive spacing needs
- ❌ Skip density mode support (for applicable components)

**Accessibility:**

- ❌ Reduce spacing below WCAG minimums
- ❌ Ignore touch target size requirements
- ❌ Ignore input padding requirements
- ❌ Allow tenant overrides to break WCAG compliance

---

## Spacing Tokens Reference

### Component Spacing Tokens

```typescript
import { spacingTokens } from "@aibos/ui/design/tokens";

spacingTokens.xs; // "px-2 py-1"  - Extra small (8px × 4px)
spacingTokens.sm; // "px-3 py-1.5"  - Small (12px × 6px)
spacingTokens.md; // "px-4 py-2"  - Medium (16px × 8px) - Default
spacingTokens.lg; // "px-5 py-2.5"  - Large (20px × 10px)
```

### Semantic Spacing Tokens

```typescript
import { semanticSpacingTokens } from "@aibos/ui/design/tokens";

semanticSpacingTokens.buttonY; // Button vertical padding
semanticSpacingTokens.buttonX; // Button horizontal padding
semanticSpacingTokens.inputY; // Input vertical padding
semanticSpacingTokens.inputX; // Input horizontal padding
semanticSpacingTokens.cardPadding; // Card padding
semanticSpacingTokens.cardGap; // Card internal gap
semanticSpacingTokens.sectionGap; // Section spacing
semanticSpacingTokens.gridGap; // Grid gap
semanticSpacingTokens.tableRowPadding; // Table row padding
semanticSpacingTokens.tableCellPadding; // Table cell padding
semanticSpacingTokens.listItemSpacing; // List item spacing
```

### Direct CSS Variables

```tsx
// ✅ CORRECT: Using CSS variables directly
<div style={{ padding: "var(--space-4)" }}>
  Content
</div>

<button style={{
  paddingTop: "var(--space-button-y)",
  paddingLeft: "var(--space-button-x)",
}}>
  Button
</button>
```

---

## Related Documentation

- [Tokens](./tokens.md) - Complete token system
- [Typography](./typography.md) - Text spacing and vertical rhythm
- [Components Philosophy](./components-philosophy.md) - Component spacing patterns
- [Accessibility Guidelines](./a11y-guidelines.md) - WCAG spacing requirements
- [Color System](./colors.md) - Token system alignment

---

## Standards & References

### WCAG Requirements

- **[SC 2.5.5 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size.html)** - 44px minimum touch target
- **[SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)** - Text spacing requirements
- **[SC 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)** - Line height and paragraph spacing

### Industry Standards

- **Material Design** - 4px baseline grid
- **Apple HIG** - 4px baseline grid
- **Atlassian Design System** - 4px baseline grid

---

**Last Updated:** 2025-01-27  
**Version:** 2.0.0  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ React MCP | ✅ A11y MCP  
**Status:** ✅ **SSOT - Single Source of Truth**  
**Enforcement:** MCP Validation + Pre-Commit Hooks  
**Standards:** [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/) | 4px Baseline Grid
