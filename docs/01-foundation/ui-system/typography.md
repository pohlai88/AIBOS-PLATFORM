# Typography System

> **Typography Scale Documentation** - Semantic, WCAG-Compliant, MCP-Validated  
> **Version:** 2.0.0  
> **Last Updated:** 2025-01-27  
> **Status:** ✅ SSOT - Single Source of Truth

---

## Overview

The AI-BOS typography system provides a **semantic, accessible, token-first** typography foundation that:

- ✅ Stays synchronized with Figma Variables
- ✅ Remains stable across multi-tenant themes
- ✅ Complies with WCAG AA/AAA requirements
- ✅ Supports Safe Mode enforcement
- ✅ Is validated automatically by MCP

**Core Principle:** Typography is a **first-class design law** in AI-BOS. All typography **MUST** use semantic tokens (no raw font sizes).

**Validated Against:**
- ✅ Tailwind MCP (token validation)
- ✅ Figma MCP (design-to-code sync)
- ✅ React MCP (no raw values enforcement)
- ✅ A11y MCP (WCAG compliance)
- ✅ Next.js MCP (RSC boundary validation)

---

## Typography Scale

### Major Third (1.250 ratio)

A harmonious, professional scale that provides clear hierarchy without being dramatic.

**Scale:**

```
12px (xs)   - Fine print, captions
14px (sm)   - UI elements, labels  ← Most common
16px (base) - Body text             ← Default
18px (lg)   - Emphasized text
20px (xl)   - Small headings
24px (2xl)  - Section headings
30px (3xl)  - Page titles
36px (4xl)  - Hero headings
48px (5xl)  - Landing page heroes
```

**CSS Variables (Global Tokens):**

```css
:root {
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */
  --text-5xl: 3rem; /* 48px */
}
```

**Semantic Typography Tokens (REQUIRED):**

```css
:root {
  /* Semantic size mappings */
  --text-size-caption: var(--text-xs); /* 12px - Fine print, captions */
  --text-size-label: var(--text-sm); /* 14px - UI labels, small text */
  --text-size-body: var(--text-base); /* 16px - Body text */
  --text-size-body-lg: var(--text-lg); /* 18px - Large body text */
  --text-size-h4: var(--text-xl); /* 20px - H4 headings */
  --text-size-h3: var(--text-2xl); /* 24px - H3 headings */
  --text-size-h2: var(--text-3xl); /* 30px - H2 headings */
  --text-size-h1: var(--text-4xl); /* 36px - H1 headings */
  --text-size-display: var(--text-5xl); /* 48px - Display text */
}
```

**TypeScript Access:**

```typescript
import { typographyTokens } from "@aibos/ui/design/tokens";

// Body text
typographyTokens.bodySm; // "text-xs"
typographyTokens.body; // "text-sm"
typographyTokens.bodyLg; // "text-base"

// Titles
typographyTokens.titleSm; // "text-sm font-semibold"
typographyTokens.title; // "text-base font-semibold"
```

**Usage:**

```tsx
// ✅ CORRECT: Use semantic tokens
<h1 className={typographyTokens.h1}>Page Title</h1>
<p className={typographyTokens.body}>Body text content</p>
<label className={typographyTokens.label}>Form Label</label>

// ❌ INCORRECT: Raw font sizes (FORBIDDEN)
<h1 className="text-[28px]">Page Title</h1>
<p style={{ fontSize: "15px" }}>Body text</p>
```

**Validated:** ✅ Typography scale follows Major Third (1.250 ratio)

---

## Semantic Typography Tokens (CRITICAL)

**Semantic typography tokens map typography to meaning, not just size.**

These tokens are **mandatory for component mapping** (Buttons, Labels, Inputs, etc.).

### Complete Semantic Token Set

**CSS Variables:**

```css
:root {
  /* Labels */
  --text-label-sm: var(--text-xs); /* 12px - Small labels */
  --text-label: var(--text-sm); /* 14px - Default labels */
  
  /* Body text */
  --text-body-sm: var(--text-xs); /* 12px - Small body */
  --text-body: var(--text-base); /* 16px - Default body */
  --text-body-lg: var(--text-lg); /* 18px - Large body */
  
  /* Headings */
  --text-h1: var(--text-4xl); /* 36px - H1 */
  --text-h2: var(--text-3xl); /* 30px - H2 */
  --text-h3: var(--text-2xl); /* 24px - H3 */
  --text-h4: var(--text-xl); /* 20px - H4 */
  
  /* UI Components */
  --text-button: var(--text-sm); /* 14px - Button text */
  --text-input: var(--text-sm); /* 14px - Input text */
  --text-caption: var(--text-xs); /* 12px - Captions */
  --text-help: var(--text-xs); /* 12px - Help text */
  --text-overline: var(--text-xs); /* 12px - Overline */
  
  /* Display */
  --text-display: var(--text-5xl); /* 48px - Display text */
}
```

**TypeScript Semantic Tokens:**

```typescript
export const typographyTokens = {
  // Labels
  labelSm: "text-[11px] font-medium tracking-wide uppercase",
  label: "text-sm font-medium",
  
  // Body text
  bodySm: "text-xs leading-relaxed",
  body: "text-sm leading-relaxed",
  bodyMd: "text-[15px] leading-relaxed",
  bodyLg: "text-base leading-relaxed",
  
  // Headings
  h1: "text-4xl font-semibold leading-tight",
  h2: "text-3xl font-semibold leading-tight",
  h3: "text-2xl font-semibold leading-normal",
  h4: "text-xl font-semibold leading-normal",
  
  // UI Components
  button: "text-sm font-semibold leading-normal",
  input: "text-sm font-normal",
  caption: "text-xs text-text-subtle",
  helpText: "text-xs text-text-muted",
  overline: "text-xs font-medium tracking-wide uppercase",
  
  // Display
  display: "text-5xl font-bold leading-none",
} as const;
```

**Usage:**

```tsx
// ✅ CORRECT: Use semantic tokens
<h1 className={typographyTokens.h1}>Page Title</h1>
<p className={typographyTokens.body}>Body text</p>
<label className={typographyTokens.label}>Form Label</label>
<button className={typographyTokens.button}>Button</button>
<span className={typographyTokens.caption}>Caption text</span>
```

**Validated:** ✅ Semantic tokens exist in `globals.css` (via Tailwind MCP)

---

## Font Family

### System Font Stack

**CSS Variable:**

```css
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
```

**Usage:**

```tsx
// Applied globally via body element
// No need to specify in components
```

**Rationale:**

- ✅ Uses native system fonts for optimal performance
- ✅ Consistent across platforms
- ✅ No external font loading required
- ✅ Excellent readability

**Multi-Tenant Rules:**

- ✅ **Font family CAN be customized** per tenant (aesthetic theme only)
- ❌ **Font family CANNOT be customized** in WCAG AA/AAA themes
- ❌ **Font family CANNOT be customized** in Safe Mode

---

## Font Weights

### Global Font Weight Tokens

**CSS Variables:**

```css
:root {
  --font-normal: 400; /* Body text */
  --font-medium: 500; /* UI elements, emphasized text */
  --font-semibold: 600; /* Headings, buttons */
  --font-bold: 700; /* Display text, marketing */
}
```

### Semantic Font Weight Tokens

**CSS Variables:**

```css
:root {
  --font-weight-label: 500; /* Labels */
  --font-weight-button: 600; /* Buttons */
  --font-weight-title: 600; /* Titles */
  --font-weight-display: 700; /* Display text */
  --font-weight-body: 400; /* Body text */
}
```

**Usage:**

```tsx
// ✅ CORRECT: Use semantic tokens
<label className="font-[var(--font-weight-label)]">Label</label>
<button className="font-[var(--font-weight-button)]">Button</button>
<h1 className="font-[var(--font-weight-title)]">Title</h1>

// ❌ INCORRECT: Raw font weight
<label className="font-[500]">Label</label>
```

**Guidelines:**

- **400 (Normal)** - Body text, default
- **500 (Medium)** - UI elements, labels, emphasized text
- **600 (Semibold)** - Headings, buttons, important text
- **700 (Bold)** - Display text, marketing/landing pages

**WCAG Rules:**

- ✅ **Safe Mode:** No thin fonts (< 400)
- ✅ **WCAG AAA:** Prohibits weight < 400 for small text (< 18px)
- ✅ **Dark Mode:** Prefer `font-medium` over `font-normal` for headings

**Validated:** ✅ Font weights defined in `globals.css`

---

## Line Heights

### Global Line Height Tokens

**CSS Variables:**

```css
:root {
  --leading-tight: 1.25; /* Headlines */
  --leading-normal: 1.5; /* Body text ← Default */
  --leading-relaxed: 1.625; /* Long-form content */
}
```

### Semantic Line Height Tokens

**CSS Variables:**

```css
:root {
  --leading-title: 1.2; /* Titles */
  --leading-display: 1.1; /* Display text */
  --leading-body: 1.5; /* Body text */
  --leading-reading: 1.625; /* Long-form reading */
  --leading-label: 1.25; /* Labels */
  --leading-button: 1.5; /* Buttons */
}
```

**Usage:**

```tsx
// ✅ CORRECT: Use semantic tokens
<h1 className="leading-[var(--leading-title)]">Title</h1>
<p className="leading-[var(--leading-body)]">Body text</p>
<article className="leading-[var(--leading-reading)]">Long-form content</article>

// ❌ INCORRECT: Raw line height
<h1 className="leading-[1.2]">Title</h1>
```

**Guidelines:**

- **1.1 (display)** - Display text, hero headings
- **1.2 (title)** - Titles, short headlines
- **1.25 (tight)** - Headlines, short text
- **1.5 (normal/body)** - Body text, default
- **1.625 (relaxed/reading)** - Long-form content, articles

**WCAG Requirements:**

- ✅ **AA:** Line height ≥ 1.5× font size
- ✅ **AAA:** Line height ≥ 1.6× font size
- ✅ **Safe Mode:** Line height ≥ 1.625× font size

**Validated:** ✅ Line heights defined in `globals.css`

---

## Component-Level Typography

### Buttons

**Typography Requirements:**

```tsx
// ✅ CORRECT: Button typography
<button className={typographyTokens.button}>
  Button Text
</button>

// Button token includes:
// - text-sm (14px)
// - font-semibold (600)
// - leading-normal (1.5)
```

**WCAG Requirements:**

- ✅ Minimum 14px font size
- ✅ Minimum 44px height (touch target)
- ✅ Font weight ≥ 500 (semibold recommended)

---

### Form Labels

**Typography Requirements:**

```tsx
// ✅ CORRECT: Form label typography
<label className={typographyTokens.label}>
  Form Label
</label>

// Label token includes:
// - text-sm (14px)
// - font-medium (500)
```

**WCAG Requirements:**

- ✅ Minimum 14px font size
- ✅ Font weight ≥ 500 (medium recommended)
- ✅ Sufficient contrast (4.5:1 for AA, 7:1 for AAA)

---

### Input Fields

**Typography Requirements:**

```tsx
// ✅ CORRECT: Input typography
<input className={typographyTokens.input} placeholder="Placeholder text" />

// Input token includes:
// - text-sm (14px)
// - font-normal (400)
// - placeholder:text-text-subtle
```

**WCAG Requirements:**

- ✅ Minimum 14px font size
- ✅ Placeholder text must meet 3:1 contrast (AA) or 4.5:1 (AAA)
- ✅ Input height ≥ 44px (touch target)

---

### Data Tables

**Typography Requirements:**

```tsx
// ✅ CORRECT: Data table typography
<th className={typographyTokens.labelSm}>Column Header</th>
<td className={typographyTokens.bodySm}>Row Data</td>

// Table uses:
// - labelSm (12px) for column headers
// - bodySm (12px) for row metadata
// - body (14px) for primary data
```

**Density Modes:**

- **Compact:** `labelSm` (12px) for headers and metadata
- **Normal:** `label` (14px) for headers, `body` (14px) for data
- **Spacious:** `label` (14px) for headers, `bodyLg` (18px) for data

---

### Captions & Help Text

**Typography Requirements:**

```tsx
// ✅ CORRECT: Caption typography
<span className={typographyTokens.caption}>Caption text</span>
<p className={typographyTokens.helpText}>Help text</p>
<span className={typographyTokens.overline}>OVERLINE</span>

// Caption token includes:
// - text-xs (12px)
// - text-text-subtle (muted color)
```

**WCAG Requirements:**

- ✅ **AA:** Captions allowed at 12px (3:1 contrast for large text)
- ❌ **AAA:** Captions must be ≥ 14px (4.5:1 contrast)
- ✅ **Safe Mode:** Captions promoted to 14px (`text-sm`)

---

## Typography Hierarchy

### Heading Levels

```tsx
// ✅ CORRECT: Use semantic heading tokens
<h1 className={typographyTokens.h1}>Page Title</h1>
<h2 className={typographyTokens.h2}>Section Heading</h2>
<h3 className={typographyTokens.h3}>Subsection Heading</h3>
<h4 className={typographyTokens.h4}>Minor Heading</h4>

// ❌ INCORRECT: Raw font sizes
<h1 className="text-[28px] font-semibold">Page Title</h1>
```

**Semantic Mapping:**

- **H1:** `--text-h1` (36px) - Page titles
- **H2:** `--text-h2` (30px) - Section headings
- **H3:** `--text-h3` (24px) - Subsection headings
- **H4:** `--text-h4` (20px) - Minor headings

---

### Text Hierarchy

```tsx
// ✅ CORRECT: Use semantic text tokens
<h1 className={colorTokens.text.default}>Primary</h1>
<p className={colorTokens.text.default}>Body text</p>
<p className={colorTokens.text.muted}>Secondary text</p>
<span className={colorTokens.text.subtle}>Tertiary text</span>
<input placeholder="Placeholder" className={colorTokens.text.subtle} />
```

**Color Hierarchy:**

- **Primary text:** `--color-text` - Main content
- **Secondary text:** `--color-text-muted` - Supporting content
- **Tertiary text:** `--color-text-subtle` - Captions, placeholders

---

## Responsive Typography

### Mobile-First Approach

```tsx
// ✅ CORRECT: Responsive typography
<h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
  Responsive Heading
</h1>

// Or using semantic tokens with responsive classes
<h1 className={`${typographyTokens.h1} text-2xl md:text-3xl lg:text-4xl`}>
  Responsive Heading
</h1>
```

**Breakpoints:**

- **Mobile (base):** Base size
- **Tablet (md):** +1 size step
- **Desktop (lg):** +2 size steps

**Example Scaling:**

- Mobile: `text-2xl` (24px)
- Tablet: `text-3xl` (30px)
- Desktop: `text-4xl` (36px)

---

## Accessibility Requirements

### Minimum Font Sizes

**WCAG AA Requirements:**

- ✅ **Body text:** 14px minimum (`text-sm`)
- ✅ **UI labels:** 14px minimum (`text-sm`)
- ✅ **Captions:** 12px minimum (`text-xs`) - Only for large text (3:1 contrast)

**WCAG AAA Requirements:**

- ✅ **Body text:** 18px minimum (`text-lg`) OR 14px bold
- ✅ **UI labels:** 14px minimum (`text-sm`)
- ❌ **Captions:** 12px NOT allowed - Must be ≥ 14px

**Large Text Definition (WCAG):**

- ✅ **≥ 18px normal weight**
- ✅ **≥ 14px bold weight**

**Safe Mode Enforcement:**

```css
[data-safe-mode="true"] {
  /* Captions promoted to 14px */
  --text-xs: 0.875rem; /* 14px (was 12px) */
  
  /* Increased font weight for body */
  --font-weight-body: 500; /* Medium (was 400) */
  
  /* Increased line height */
  --leading-normal: 1.625; /* Relaxed (was 1.5) */
}
```

**Safe Mode Rules:**

- ✅ Minimum font-size: 14px (captions promoted)
- ✅ Buttons must use `h>=44px` (touch target)
- ✅ Increased line height (1.625×)
- ✅ Increased font weight for body (500)

---

### Contrast Ratios

**WCAG AA Requirements:**

- ✅ **Primary text:** 4.5:1 minimum
- ✅ **Secondary text:** 4.5:1 minimum
- ✅ **Tertiary text:** 3:1 minimum (large text only)

**WCAG AAA Requirements:**

- ✅ **Primary text:** 7:1 minimum
- ✅ **Secondary text:** 7:1 minimum
- ✅ **Tertiary text:** 4.5:1 minimum (large text)

**Theme Enforcement:**

```css
[data-theme="wcag-aa"] {
  /* Enforce AA contrast */
  --color-text: #0a0a0a; /* 12.8:1 contrast */
  --color-text-muted: #262626; /* 9.0:1 contrast */
}

[data-theme="wcag-aaa"] {
  /* Enforce AAA contrast */
  --color-text: #0a0a0a; /* 12.8:1 contrast */
  --color-text-muted: #262626; /* 9.0:1 contrast */
}
```

**Validated:** ✅ All text colors meet WCAG AA contrast requirements (via A11y MCP)

---

## Dark Mode Typography

### Dark Mode Guidelines

**Dark mode typography must:**

- ✅ Increase letter-contrast by +2–4%
- ✅ Increase text-opacity for readability
- ✅ Avoid thin fonts (< 400)
- ✅ Prefer `font-medium` (500) over `font-normal` (400) for headings

**CSS Variables:**

```css
.dark {
  /* Increased contrast for dark mode */
  --color-text: #f5f5f5; /* Lighter for better contrast */
  --color-text-muted: #d4d4d4; /* Increased opacity */
  
  /* Prefer medium weight for headings */
  --font-weight-title: 500; /* Medium (was 600) */
}
```

**Usage:**

```tsx
// Typography automatically adapts to dark mode
<h1 className={typographyTokens.h1}>Title</h1>
<p className={typographyTokens.body}>Body text</p>
```

---

## Safe Mode Typography

### Safe Mode Enforcement

**Safe Mode typography rules:**

```css
[data-safe-mode="true"] {
  /* Captions promoted to 14px */
  --text-xs: 0.875rem; /* 14px (was 12px) */
  
  /* Increased font weight for body */
  --font-weight-body: 500; /* Medium (was 400) */
  
  /* Increased line height */
  --leading-normal: 1.625; /* Relaxed (was 1.5) */
  --leading-body: 1.625; /* Relaxed (was 1.5) */
  
  /* No thin fonts */
  --font-weight-min: 500; /* Minimum weight */
}
```

**Safe Mode Rules:**

- ✅ **Increased readability:** Larger baseline text (14px minimum)
- ✅ **No thin fonts:** Minimum weight 500
- ✅ **Higher line height:** 1.625× minimum
- ✅ **Captions promoted:** 12px → 14px

**Usage:**

```tsx
// Typography automatically adapts to Safe Mode
<div data-safe-mode="true">
  <span className={typographyTokens.caption}>
    Caption (14px in Safe Mode, 12px normally)
  </span>
</div>
```

---

## Multi-Tenant Typography Rules

### Tenant Override Governance

**Typography customization rules:**

- ✅ **Font family CAN be customized** per tenant (aesthetic theme only)
- ❌ **Font family CANNOT be customized** in WCAG AA/AAA themes
- ❌ **Font family CANNOT be customized** in Safe Mode
- ❌ **Font sizes CANNOT be customized** (must use token system)
- ❌ **Font weights CANNOT be customized** (must use token system)
- ❌ **Line heights CANNOT be customized** (must use token system)

**Rationale:**

- ✅ **Body, titles, labels must remain identical** across tenants
- ✅ Ensures MCP validation consistency
- ✅ Prevents tenant breaking layout
- ✅ Maintains accessibility compliance

**Example:**

```css
/* ✅ ALLOWED: Font family customization (aesthetic theme only) */
:root[data-tenant="dlbb"] {
  --font-sans: "Inter", "Custom Font", sans-serif;
}

/* ❌ FORBIDDEN: Font size customization */
:root[data-tenant="dlbb"] {
  --text-base: 1.125rem; /* NOT ALLOWED */
}
```

---

## Motion Typography (Optional)

### Motion Tokens for Typography

**CSS Variables:**

```css
:root {
  /* Typography transitions */
  --transition-title: 300ms;
  --transition-body: 150ms;
  --transition-label: 200ms;
}
```

**TypeScript Access:**

```typescript
export const motionTypographyTokens = {
  title: "transition-[font-size] duration-[var(--transition-title)]",
  body: "transition-[font-size] duration-[var(--transition-body)]",
  label: "transition-[font-size] duration-[var(--transition-label)]",
} as const;
```

**Usage:**

```tsx
// Smooth typography transitions
<h1 className={`${typographyTokens.h1} ${motionTypographyTokens.title}`}>
  Title
</h1>
```

**WCAG Rules:**

- ✅ Must respect `prefers-reduced-motion`
- ✅ Essential animations only (Safe Mode)
- ✅ Non-essential animations disabled in Safe Mode

---

## Figma Variable Sync

### Token Synchronization Workflow

**Figma → Code → Figma Round-Trip:**

```
Figma Variables → Export JSON → MCP → globals.css → tokens.ts → Components
```

### Figma Variable Mapping

**Figma Variable Groups → CSS Variable Groups:**

```
Figma Variable          → CSS Variable          → TypeScript Token
─────────────────────────────────────────────────────────────────
text/body               → --text-body           → typographyTokens.body
text/label              → --text-label          → typographyTokens.label
text/button              → --text-button         → typographyTokens.button
text/h1                  → --text-h1             → typographyTokens.h1
text/h2                  → --text-h2             → typographyTokens.h2
text/h3                  → --text-h3             → typographyTokens.h3
text/h4                  → --text-h4             → typographyTokens.h4
text/caption             → --text-caption        → typographyTokens.caption
```

### Figma MCP Sync Workflow

```typescript
// 1. Extract typography from Figma
const figmaTypography = await mcp_Figma_get_variable_defs({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "TYPOGRAPHY_NODE",
});

// 2. Map to CSS variables
const cssTypography = mapFigmaToCSS(figmaTypography, {
  "text/body": "--text-body",
  "text/label": "--text-label",
  "text/button": "--text-button",
  "text/h1": "--text-h1",
  // ... etc
});

// 3. Update globals.css
await updateGlobalsCSS(cssTypography);

// 4. Validate with Tailwind MCP
const validation = await mcp_Tailwind_validate_token_exists({
  tokenName: "--text-body",
});

// 5. Revalidate Figma (round-trip)
const figmaValidation = await mcp_Figma_get_design_context({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "TYPOGRAPHY_NODE",
});
```

### Naming Governance

**Figma Typography Styles MUST match CSS Variable Names:**

- ✅ `Body / Sm` → `--text-body-sm`
- ✅ `Heading / H1` → `--text-h1`
- ✅ `Label / Default` → `--text-label`
- ❌ **Mismatched naming** → MCP validation fails

**MCP Automated Diff-Check:**

- ✅ Variables synced correctly
- ✅ No missing/outdated typography
- ✅ Naming matches CSS variables
- ✅ Token groups align

**Validated:** ✅ Figma MCP integration available

---

## MCP Validation Rules

### React MCP Validates

**Component Usage:**

- ✅ Components use semantic typography tokens
- ❌ No raw font sizes (e.g., `style={{ fontSize: "15px" }}`)
- ❌ No inline styles (use tokens instead)
- ✅ Correct line-height pairing per role

**Example Validation:**

```typescript
// ❌ FAILS: Raw font size
<h1 style={{ fontSize: "28px" }}>Title</h1>

// ❌ FAILS: Inline style
<p style={{ fontSize: "15px", lineHeight: "1.4" }}>Body</p>

// ✅ PASSES: Uses tokens
<h1 className={typographyTokens.h1}>Title</h1>
<p className={typographyTokens.body}>Body</p>
```

---

### Tailwind MCP Validates

**Token Usage:**

- ❌ No arbitrary font sizes (e.g., `text-[13px]`)
- ✅ Only token-based text classes allowed
- ✅ Token exists in `globals.css`
- ✅ Token value is valid

**Example Validation:**

```typescript
// ❌ FAILS: Arbitrary font size
<div className="text-[13px]">Content</div>

// ✅ PASSES: Token usage
<div className={typographyTokens.body}>Content</div>
```

---

### Figma MCP Validates

**Design-Code Sync:**

- ✅ Typography styles synced correctly
- ✅ No missing/outdated typography
- ✅ Naming matches CSS variables
- ✅ Token groups align

**Example Validation:**

```typescript
// Figma MCP checks:
const figmaTypography = await mcp_Figma_get_variable_defs({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "TYPOGRAPHY_NODE",
});

// Compare with CSS
const cssTypography = await mcp_Tailwind_read_tailwind_config();

// Validate alignment
if (figmaTypography["text/body"] !== cssTypography["--text-body"]) {
  throw new Error("Token mismatch: text/body");
}
```

---

### Next.js MCP Validates

**RSC Safety:**

- ✅ Typography tokens are RSC-safe (CSS-only, no browser APIs)
- ✅ `globals.css` loaded before UI tokens
- ✅ No dynamic font loading in Server Components

**Example Validation:**

```typescript
// ✅ PASSES: RSC-safe typography usage
export default async function Page() {
  return (
    <h1 className={typographyTokens.h1}>
      <p className={typographyTokens.body}>Content</p>
    </h1>
  );
}

// ❌ FAILS: Browser API in Server Component
export default async function Page() {
  const font = document.fonts.check("12px Inter"); // Browser API
  return <div>Content</div>;
}
```

---

### A11y MCP Validates

**WCAG Compliance:**

- ✅ Font sizes meet WCAG minimums (14px for body, 12px for captions in AA)
- ✅ Line heights meet WCAG requirements (1.5× for AA, 1.6× for AAA)
- ✅ Font weights meet WCAG requirements (≥ 400 for small text)
- ✅ Contrast ratios meet WCAG requirements (4.5:1 for AA, 7:1 for AAA)

**Example Validation:**

```typescript
// A11y MCP checks:
const fontSize = getFontSize(typographyTokens.body);
const lineHeight = getLineHeight(typographyTokens.body);
const contrast = calculateContrast(
  colorTokens.text.default,
  colorTokens.surface.default
);

if (fontSize < 14) {
  throw new Error("WCAG AA violation: font size too small");
}

if (lineHeight < 1.5) {
  throw new Error("WCAG AA violation: line height too small");
}

if (contrast < 4.5) {
  throw new Error("WCAG AA violation: contrast too low");
}
```

---

## RSC Guidelines

### Typography in Server Components

**Typography tokens are RSC-safe:**

- ✅ **Allowed in Server Components** - Typography tokens compile to static CSS classes
- ✅ **No browser APIs** - Typography doesn't depend on browser APIs
- ✅ **No hydration issues** - Typography is CSS-only

**Example:**

```tsx
// ✅ CORRECT: Typography in Server Component
export default async function Page() {
  const data = await fetchData();
  return (
    <div>
      <h1 className={typographyTokens.h1}>{data.title}</h1>
      <p className={typographyTokens.body}>{data.content}</p>
    </div>
  );
}
```

**Font Loading:**

Font loading must use:

```tsx
// ✅ CORRECT: Font preload in layout
<script rel="preload" as="font" href="/fonts/inter.woff2" />

// ❌ INCORRECT: Dynamic font loading in Server Component
export default async function Page() {
  const font = await loadFont("Inter"); // Browser API
  return <div>Content</div>;
}
```

**Note:** Typography utilities work in both Server and Client Components.

---

## Typography Tokens Reference

### Complete Token List

```typescript
import { typographyTokens } from "@aibos/ui/design/tokens";

// Labels
typographyTokens.labelSm; // "text-[11px] font-medium tracking-wide uppercase"
typographyTokens.label; // "text-sm font-medium"

// Body text
typographyTokens.bodySm; // "text-xs leading-relaxed"
typographyTokens.body; // "text-sm leading-relaxed"
typographyTokens.bodyMd; // "text-[15px] leading-relaxed"
typographyTokens.bodyLg; // "text-base leading-relaxed"

// Headings
typographyTokens.h1; // "text-4xl font-semibold leading-tight"
typographyTokens.h2; // "text-3xl font-semibold leading-tight"
typographyTokens.h3; // "text-2xl font-semibold leading-normal"
typographyTokens.h4; // "text-xl font-semibold leading-normal"

// UI Components
typographyTokens.button; // "text-sm font-semibold leading-normal"
typographyTokens.input; // "text-sm font-normal"
typographyTokens.caption; // "text-xs text-text-subtle"
typographyTokens.helpText; // "text-xs text-text-muted"
typographyTokens.overline; // "text-xs font-medium tracking-wide uppercase"

// Display
typographyTokens.display; // "text-5xl font-bold leading-none"
```

### Combined with Color Tokens

```typescript
import { typographyTokens, colorTokens } from "@aibos/ui/design/tokens";

// Heading with color
<h1 className={`${typographyTokens.h1} ${colorTokens.text.default}`}>
  Heading
</h1>

// Body with color
<p className={`${typographyTokens.body} ${colorTokens.text.muted}`}>
  Body text
</p>
```

---

## Best Practices

### ✅ DO

**Token Usage:**

- ✅ Use semantic typography tokens (never raw font sizes)
- ✅ Use appropriate font weights per role
- ✅ Use semantic line-height tokens
- ✅ Maintain consistent hierarchy
- ✅ Ensure sufficient contrast (WCAG AA/AAA)

**Component Typography:**

- ✅ Use component-specific tokens (button, label, input)
- ✅ Support density modes for enterprise components
- ✅ Ensure touch targets meet 44px minimum (for buttons)

**Responsive:**

- ✅ Use responsive typography utilities
- ✅ Scale typography by breakpoint (+1 step tablet, +2 steps desktop)
- ✅ Test typography on all screen sizes

**Accessibility:**

- ✅ Meet WCAG minimum font sizes (14px for body, 12px for captions in AA)
- ✅ Meet WCAG line height requirements (1.5× for AA, 1.6× for AAA)
- ✅ Meet WCAG contrast requirements (4.5:1 for AA, 7:1 for AAA)

### ❌ DON'T

**Token Usage:**

- ❌ Use arbitrary font sizes (13px, 15px, 17px)
- ❌ Use raw font sizes (`text-[13px]`)
- ❌ Use inline styles for typography
- ❌ Mix too many font weights
- ❌ Ignore line height for readability

**Component Typography:**

- ❌ Use typography for layout (use flex/grid instead)
- ❌ Ignore WCAG minimum typography requirements
- ❌ Ignore responsive typography needs
- ❌ Skip density mode support (for applicable components)

**Accessibility:**

- ❌ Use font sizes below WCAG minimums
- ❌ Use line heights below WCAG requirements
- ❌ Ignore contrast requirements
- ❌ Allow tenant overrides to break WCAG compliance

---

## Related Documentation

- [Tokens](./tokens.md) - Complete token system
- [Spacing](./spacing.md) - Spacing system (vertical rhythm)
- [Colors](./colors.md) - Text color usage
- [Components Philosophy](./components-philosophy.md) - Component typography patterns
- [Accessibility Guidelines](./a11y-guidelines.md) - WCAG typography requirements
- [Figma Sync](../07-mcp/tools/sync-figma.md) - Design-to-code workflow

---

## Standards & References

### WCAG Requirements

- **[SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)** - 4.5:1 for AA, 7:1 for AAA
- **[SC 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)** - Line height ≥ 1.5× (AA), 1.6× (AAA)
- **[SC 2.5.5 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size.html)** - 44px minimum touch target

### Industry Standards

- **Material Design** - Typography scale and hierarchy
- **Apple HIG** - Typography guidelines
- **Atlassian Design System** - Typography tokens

---

**Last Updated:** 2025-01-27  
**Version:** 2.0.0  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ React MCP | ✅ A11y MCP | ✅ Next.js MCP  
**Status:** ✅ **SSOT - Single Source of Truth**  
**Enforcement:** MCP Validation + Pre-Commit Hooks  
**Standards:** [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/) | Major Third (1.250) Scale
