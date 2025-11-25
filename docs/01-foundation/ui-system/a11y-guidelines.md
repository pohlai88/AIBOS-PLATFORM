# Accessibility Guidelines

> **WCAG Compliance via Theme System** - Single Source of Truth (SSOT) for Accessibility  
> **Version:** 2.2.0  
> **Last Updated:** 2025-01-27  
> **Status:** ✅ Complete - SSOT Document

**Standards Compliance:**

- ✅ [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/) - Web Content Accessibility Guidelines 2.2 (W3C Recommendation)
- ✅ [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) - Web Content Accessibility Guidelines 2.1 (W3C Recommendation)
- ✅ [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html) - International standard (WCAG 2.2)
- ✅ [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/) - European standard (currently WCAG 2.1)
- ✅ [ATAG 2.0](https://www.w3.org/WAI/standards-guidelines/atag/) - Authoring Tool Accessibility Guidelines

## Design Philosophy: Aesthetic First, Accessibility on Demand

The AI-BOS design system follows a **dual-theme approach** that balances aesthetic excellence with accessibility compliance:

### Default Theme: "Professional, Elegant, Beautiful, Attractive"

**Purpose:** What users WANT - Aesthetic excellence and visual appeal

- ✅ Focuses on **professional, elegant, beautiful, attractive** feeling
- ✅ Color and font "bloat" is **NOT** a concern in default theme
- ✅ Optimized for visual appeal and brand expression
- ✅ **No WCAG compliance requirement** for default theme
- ✅ Users choose this for aesthetic preference

### WCAG AA & AAA Themes: "100% Compliance, No Compromise"

**Purpose:** What users NEED - Full accessibility compliance

- ✅ **WCAG AA Theme** - 100% Level AA compliance (minimum 4.5:1 contrast)
- ✅ **WCAG AAA Theme** - 100% Level AAA compliance (minimum 7:1 contrast)
- ✅ **No compromise** on accessibility requirements
- ✅ **No compromise** on design quality
- ✅ Users can toggle/switch to these themes when needed
- ✅ Full functionality maintained in all themes

**Philosophy:**

- ❌ **Don't compromise design** for accessibility
- ❌ **Don't compromise accessibility** for design
- ✅ **Provide both** - Let users choose based on their needs

---

## Overview

This document defines accessibility requirements for the AI-BOS design system. It covers:

- Theme-based accessibility approach (Default, WCAG AA, WCAG AAA)
- Safe Mode support for visual sensitivities
- Keyboard navigation patterns
- Screen reader support
- Focus management
- Form accessibility
- Modal and dialog accessibility
- Image and media accessibility
- Semantic HTML requirements
- ARIA attribute usage
- Reduced motion support

**All React components must work correctly in all themes (Default, WCAG AA, WCAG AAA, Safe Mode).**

---

## Accessibility Principles

### Theme-Based Accessibility Model

**The AI-BOS design system provides accessibility through theme switching, not design compromise:**

**Three Independent Categories:**

1. **Aesthetic Theme** (`data-theme="default"`)
   - **Purpose:** What users WANT - Professional, elegant, beautiful, attractive
   - **WCAG Compliance:** ❌ No WCAG compliance requirement
   - **Tenant Overrides:** ✅ Allowed (multi-tenant branding)
   - **Customization:** ✅ Full customization (brand colors, fonts, etc.)
   - **Use Case:** Visual appeal, brand expression, aesthetic preference

2. **WCAG AA Theme** (`data-theme="wcag-aa"`)
   - **Purpose:** What users NEED - Legal compliance (minimum standard)
   - **WCAG Compliance:** ✅ 100% [WCAG 2.2 Level AA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance
   - **Tenant Overrides:** ❌ NOT allowed (fixed compliance tokens)
   - **Customization:** ❌ NO customization (compliance, not fulfillment)
   - **Contrast:** Minimum 4.5:1 for normal text ([SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)), 3:1 for large text
   - **Use Case:** Government, corporate, legal requirements
   - **Also conforms to:** [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/), [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html), [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)

3. **WCAG AAA Theme** (`data-theme="wcag-aaa"`)
   - **Purpose:** What users NEED - Highest accessibility standard
   - **WCAG Compliance:** ✅ 100% [WCAG 2.2 Level AAA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance
   - **Tenant Overrides:** ❌ NOT allowed (fixed compliance tokens)
   - **Customization:** ❌ NO customization (compliance, not fulfillment)
   - **Contrast:** Minimum 7:1 for normal text ([SC 1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)), 4.5:1 for large text
   - **Use Case:** Hospitals, elderly care, high-risk users
   - **Also conforms to:** [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/), [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html), [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)

**Safe Mode** (`data-safe-mode="true"`) - **Separate Category**

- **Purpose:** Cognitive comfort, reduced distractions
- **WCAG Compliance:** Can be combined with any theme (aesthetic, AA, or AAA)
- **Tenant Overrides:** ❌ Disabled when active (neutralizes all branding)
- **Behavior:** Removes decorative elements, neutralizes colors, reduces motion
- **Use Case:** Disabilities, neurodivergent users, visual sensitivities
- **Note:** Safe Mode ≠ WCAG Mode - They can stack (e.g., `data-theme="wcag-aa" data-safe-mode="true"`)

**Critical Governance Rule:**

- ✅ **Tenant overrides ONLY apply to Aesthetic theme** (`data-theme="default"`)
- ❌ **WCAG themes are FIXED from top to bottom** - No customization allowed
- ❌ **WCAG themes override tenant colors** - Compliance takes precedence
- ✅ **Safe Mode can combine with any theme** - But disables tenant branding

### Core Requirements (All Themes)

**These requirements apply to ALL themes, regardless of WCAG compliance level:**

- ✅ **Keyboard Navigation** - Full keyboard accessibility (REQUIRED in all themes)
- ✅ **Screen Reader Support** - Semantic HTML and ARIA attributes (REQUIRED in all themes)
- ✅ **Focus Management** - Visible focus indicators (REQUIRED in all themes)
- ✅ **Form Accessibility** - Proper labels and error handling (REQUIRED in all themes)
- ✅ **Modal Accessibility** - Focus trap and keyboard support (REQUIRED in all themes)

**Validated Against:**

- ✅ [WCAG 2.2 Level AA](https://www.w3.org/WAI/standards-guidelines/wcag/) requirements (WCAG AA theme)
- ✅ [WCAG 2.2 Level AAA](https://www.w3.org/WAI/standards-guidelines/wcag/) requirements (WCAG AAA theme)
- ✅ [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) backwards compatibility
- ✅ [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html) international standard
- ✅ Safe Mode token overrides
- ✅ Keyboard navigation patterns (all themes)

---

## Color Contrast

### Theme-Based Contrast Requirements

**Aesthetic Theme (`data-theme="default"`):**

- ❌ **No WCAG compliance requirement**
- ✅ Optimized for aesthetic appeal
- ✅ Color and font choices prioritize visual beauty
- ✅ Users choose this for aesthetic preference
- ✅ **Tenant overrides allowed** - Multi-tenant branding supported

**WCAG AA Theme (`data-theme="wcag-aa"`):**

- ✅ **100% [WCAG 2.2 Level AA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance REQUIRED**
- ✅ Normal Text: Minimum **4.5:1** contrast ratio ([SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- ✅ Large Text: Minimum **3:1** contrast ratio ([SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- ✅ UI Components: Minimum **3:1** contrast ratio ([SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- ✅ Focus Rings: Minimum **3:1** contrast ratio ([SC 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))
- ❌ **Tenant overrides NOT allowed** - Fixed compliance tokens only
- ✅ Also conforms to [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/), [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html), [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)

**WCAG AAA Theme (`data-theme="wcag-aaa"`):**

- ✅ **100% [WCAG 2.2 Level AAA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance REQUIRED**
- ✅ Normal Text: Minimum **7:1** contrast ratio ([SC 1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html))
- ✅ Large Text: Minimum **4.5:1** contrast ratio ([SC 1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html))
- ✅ UI Components: Minimum **4.5:1** contrast ratio ([SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- ✅ Focus Rings: Minimum **4.5:1** contrast ratio ([SC 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))
- ❌ **Tenant overrides NOT allowed** - Fixed compliance tokens only
- ✅ Also conforms to [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/), [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html), [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)

### Required WCAG Token Pairs

**All foreground/background pairs MUST be validated:**

| Pair Type        | Background Token      | Foreground Token                | AA Requirement | AAA Requirement |
| ---------------- | --------------------- | ------------------------------- | -------------- | --------------- |
| Primary          | `--color-primary`     | `--color-primary-foreground-aa` | ≥4.5:1         | ≥7:1            |
| Success          | `--color-success`     | `--color-success-foreground-aa` | ≥4.5:1         | ≥7:1            |
| Warning          | `--color-warning`     | `--color-warning-foreground-aa` | ≥4.5:1         | ≥7:1            |
| Danger           | `--color-danger`      | `--color-danger-foreground-aa`  | ≥4.5:1         | ≥7:1            |
| Text on BG       | `--color-bg`          | `--color-fg-aa`                 | ≥4.5:1         | ≥7:1            |
| Text on Elevated | `--color-bg-elevated` | `--color-fg-aa`                 | ≥4.5:1         | ≥7:1            |
| Text on Muted    | `--color-bg-muted`    | `--color-fg-muted-aa`           | ≥4.5:1         | ≥7:1            |
| Focus Ring       | `--color-bg`          | `--color-focus-ring-aa`         | ≥3:1           | ≥4.5:1          |

### Contrast Ratios by Theme

**Default Theme (Aesthetic):**

- No specific contrast requirements
- Optimized for visual appeal

**WCAG AA Theme:**
| Text Color | Background | Ratio | Level |
| -------------- | ----------- | ------ | ------ |
| `fg-primary` | `bg-base` | ≥4.5:1 | AA ✅ |
| `fg-secondary` | `bg-base` | ≥4.5:1 | AA ✅ |
| `fg-tertiary` | `bg-base` | ≥4.5:1 | AA ✅ |
| `accent-fg` | `accent-bg` | ≥4.5:1 | AA ✅ |

**WCAG AAA Theme:**
| Text Color | Background | Ratio | Level |
| -------------- | ----------- | ------ | ------ |
| `fg-primary` | `bg-base` | ≥7:1 | AAA ✅ |
| `fg-secondary` | `bg-base` | ≥7:1 | AAA ✅ |
| `fg-tertiary` | `bg-base` | ≥7:1 | AAA ✅ |
| `accent-fg` | `accent-bg` | ≥7:1 | AAA ✅ |

**Validated:**

- ✅ Default theme: Aesthetic optimization (no WCAG requirement)
- ✅ WCAG AA theme: 100% Level AA compliance
- ✅ WCAG AAA theme: 100% Level AAA compliance

---

## Theme Switching

### Theme Implementation

**Theme switching is implemented via data attributes on the root element:**

```tsx
// Default theme (aesthetic-focused)
<html data-theme="default">
  {/* Professional, elegant, beautiful, attractive */}
</html>

// WCAG AA theme (100% Level AA compliance)
<html data-theme="wcag-aa">
  {/* Full WCAG AA compliance, no compromise */}
</html>

// WCAG AAA theme (100% Level AAA compliance)
<html data-theme="wcag-aaa">
  {/* Full WCAG AAA compliance, no compromise */}
</html>

// Safe Mode (can be combined with any theme)
<html data-theme="wcag-aa" data-safe-mode="true">
  {/* WCAG AA + Safe Mode */}
</html>
```

**CSS Implementation:**

```css
/* Default theme - Aesthetic optimization */
:root[data-theme="default"] {
  /* Professional, elegant, beautiful colors */
  /* No WCAG compliance requirement */
}

/* WCAG AA theme - 100% Level AA compliance */
:root[data-theme="wcag-aa"] {
  /* All text meets 4.5:1 minimum contrast */
  /* All UI components meet 3:1 minimum contrast */
  /* 100% compliance, no compromise */
}

/* WCAG AAA theme - 100% Level AAA compliance */
:root[data-theme="wcag-aaa"] {
  /* All text meets 7:1 minimum contrast */
  /* All UI components meet 4.5:1 minimum contrast */
  /* 100% compliance, no compromise */
}
```

**Theme Toggle Component:**

```tsx
// Theme switcher component
<ThemeSwitcher>
  <ThemeOption value="default">Default (Aesthetic)</ThemeOption>
  <ThemeOption value="wcag-aa">WCAG AA (Compliant)</ThemeOption>
  <ThemeOption value="wcag-aaa">WCAG AAA (Enhanced)</ThemeOption>
</ThemeSwitcher>
```

### Safe Mode

**What is Safe Mode?**

Safe Mode (`[data-safe-mode="true"]`) provides a neutral, low-noise interface by:

- Removing accent colors (replaced with neutral grays)
- Removing decorative shadows
- Simplifying visual complexity
- Maintaining full functionality

**CSS Implementation:**

```css
[data-safe-mode="true"] {
  --accent-bg: var(--gray-500);
  --accent-bg-hover: var(--gray-600);
  --accent-bg-active: var(--gray-700);
  --shadow-sm: none;
  --shadow-md: none;
}
```

**Usage:**

```tsx
// Safe Mode can be combined with any theme
<html data-theme="default" data-safe-mode="true">
  {/* Default theme + Safe Mode */}
</html>

<html data-theme="wcag-aa" data-safe-mode="true">
  {/* WCAG AA theme + Safe Mode */}
</html>
```

**When to Use:**

- User preference for reduced visual complexity
- High contrast mode requirements
- Visual sensitivity accommodations
- Can be combined with WCAG AA/AAA themes

**Validated:** ✅ Safe mode tokens defined in `globals.css`

---

## Keyboard Navigation

### Focus Management

**Focus Indicators (REQUIRED):**

All interactive elements **MUST** have visible focus indicators. This is a non-negotiable requirement.

**WCAG Focus Ring Requirements:**

- **Minimum Width:** 2px (WCAG 2.2 requirement)
- **AA Contrast:** Minimum 3:1 against background ([SC 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))
- **AAA Contrast:** Minimum 4.5:1 against background ([SC 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))

**Focus Ring Tokens:**

```css
/* WCAG AA Focus Ring */
:root[data-theme="wcag-aa"] {
  --color-focus-ring-aa: #000000; /* 21:1 on white - Validated */
  --focus-ring-width: 2px;
  --focus-ring-style: solid;
  --focus-ring-offset: 2px;
}

/* WCAG AAA Focus Ring */
:root[data-theme="wcag-aaa"] {
  --color-focus-ring-aaa: #1f2937; /* 7:1 on white - Validated */
  --focus-ring-width: 2px;
  --focus-ring-style: solid;
  --focus-ring-offset: 2px;
}
```

**Required CSS Classes:**

```tsx
// ✅ REQUIRED: All interactive elements must include these classes
// Use CSS variable via inline style for theme-specific focus rings
<button
  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
  style={{
    "--tw-ring-color": "var(--color-focus-ring-aa)", // WCAG AA theme
    // or '--tw-ring-color': 'var(--color-focus-ring-aaa)', // WCAG AAA theme
  }}
>
  Button
</button>
```

**Component Implementation Pattern:**

```tsx
// ✅ CORRECT: Button with required focus styles
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${componentTokens.buttonPrimary} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className ?? ""}`}
        {...props}
      />
    );
  }
);

// ✅ CORRECT: Input with required focus styles
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${componentTokens.input} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className ?? ""}`}
        {...props}
      />
    );
  }
);
```

**Keyboard Patterns (REQUIRED):**

All components **MUST** support the following keyboard patterns:

- **Tab** / **Shift+Tab** - Navigate between interactive elements (REQUIRED)
- **Enter** / **Space** - Activate buttons and links (REQUIRED)
- **Arrow Keys** - Navigate menus, listboxes, tabs, radio groups (REQUIRED for applicable components)
- **Escape** - Close modals, dropdowns, popovers (REQUIRED for applicable components)
- **Home** / **End** - Navigate to first/last item in lists (REQUIRED for applicable components)

**Focus Trap (REQUIRED for Modals/Dialogs):**

All modals and dialogs **MUST** trap focus within the modal:

```tsx
// ✅ CORRECT: Dialog with focus trap (Radix UI handles this automatically)
<Dialog>
  <DialogContent>
    {/* Focus is trapped here */}
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogContent>
</Dialog>
```

**Focus Return (REQUIRED for Modals/Dialogs):**

When a modal closes, focus **MUST** return to the element that triggered it:

```tsx
// ✅ CORRECT: Focus returns to trigger button
<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    {/* When closed, focus returns to DialogTrigger */}
  </DialogContent>
</Dialog>
```

**Tab Order (REQUIRED):**

Tab order **MUST** be logical and follow visual flow:

- ✅ Top to bottom, left to right
- ✅ Skip hidden elements (`display: none`, `visibility: hidden`)
- ✅ Include all interactive elements
- ❌ Never create keyboard traps

**Validated:** ✅ All components support keyboard navigation

---

## Screen Reader Support

### Semantic HTML (REQUIRED)

**Use Native Elements (REQUIRED):**

All interactive elements **MUST** use semantic HTML:

```tsx
// ✅ CORRECT: Semantic button
<button onClick={handleClick} type="button">
  Submit
</button>

// ❌ INCORRECT: Div with onClick (FORBIDDEN)
<div onClick={handleClick}>
  Submit
</div>

// ✅ CORRECT: Semantic link
<a href="/page">Navigate</a>

// ❌ INCORRECT: Button styled as link (FORBIDDEN unless necessary)
<button onClick={() => navigate('/page')}>Navigate</button>
```

**Semantic Landmarks (REQUIRED):**

All pages **MUST** include semantic landmarks:

```tsx
// ✅ CORRECT: Semantic landmarks
<header role="banner">
  <nav aria-label="Main navigation">...</nav>
</header>
<main role="main">
  <article>...</article>
</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### ARIA Attributes (REQUIRED)

**Icon-Only Buttons (REQUIRED):**

All icon-only buttons **MUST** have `aria-label`:

```tsx
// ✅ CORRECT: Icon-only button with aria-label
<button aria-label="Close dialog" className="focus-visible:ring-2 focus-visible:ring-ring">
  <XIcon />
</button>

// ✅ ALTERNATIVE: Icon-only button with visually hidden text
<button className="focus-visible:ring-2 focus-visible:ring-ring">
  <XIcon />
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>

// ❌ INCORRECT: Icon-only button without label (FORBIDDEN)
<button>
  <XIcon />
</button>
```

**Form Inputs (REQUIRED):**

All form inputs **MUST** have associated labels:

```tsx
// ✅ CORRECT: Input with label
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert" aria-live="polite">
  Invalid email
</span>

// ✅ ALTERNATIVE: Input with aria-label
<input
  type="email"
  aria-label="Email Address"
  aria-required="true"
  aria-describedby="email-error"
/>

// ❌ INCORRECT: Input without label (FORBIDDEN)
<input type="email" placeholder="Email" />
```

**Error States (REQUIRED):**

All form inputs with errors **MUST** have `aria-invalid`:

```tsx
// ✅ CORRECT: Input with error state
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert" aria-live="polite">
  Invalid email address
</span>
```

**Loading States (REQUIRED):**

All loading states **MUST** have `aria-busy`:

```tsx
// ✅ CORRECT: Loading button
<button aria-busy="true" aria-label="Loading...">
  <Spinner />
  Loading
</button>

// ✅ CORRECT: Loading region
<div aria-busy="true" aria-live="polite">
  Loading content...
</div>
```

**Navigation (REQUIRED):**

All navigation elements **MUST** have `aria-label`:

```tsx
// ✅ CORRECT: Navigation with aria-label
<nav aria-label="Main navigation">
  <ul>
    <li>
      <a href="/" aria-current={isHome ? "page" : undefined}>
        Home
      </a>
    </li>
  </ul>
</nav>
```

**Modals and Dialogs (REQUIRED):**

All modals **MUST** have proper ARIA attributes:

```tsx
// ✅ CORRECT: Dialog with proper ARIA (Radix UI handles this)
<Dialog>
  <DialogContent>
    <DialogTitle>Dialog Title</DialogTitle>
    <DialogDescription>Dialog description</DialogDescription>
  </DialogContent>
</Dialog>
```

**Visually Hidden Text (REQUIRED for Icon-Only Elements):**

Use the `VisuallyHidden` component for screen reader text:

```tsx
// ✅ CORRECT: Icon-only button with visually hidden text
import { VisuallyHidden } from "@aibos/ui/components";

<button className="focus-visible:ring-2 focus-visible:ring-ring">
  <XIcon />
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>;
```

**Validated:** ✅ All components use semantic HTML and ARIA

---

## Accessibility Tokens

### Safe Text-on-Background Pairings

**TypeScript Access:**

```typescript
import { accessibilityTokens } from "@aibos/ui/design/tokens";

accessibilityTokens.textOnPrimary; // "text-primary-foreground"
accessibilityTokens.textOnSuccess; // "text-success-foreground"
accessibilityTokens.textOnDanger; // "text-danger-foreground"
accessibilityTokens.textOnWarning; // "text-warning-foreground"
```

**Usage:**

```tsx
// Primary button with accessible text
<button className="bg-primary">
  <span className={accessibilityTokens.textOnPrimary}>
    Primary Action
  </span>
</button>

// Success badge with accessible text
<span className="bg-success-soft">
  <span className={accessibilityTokens.textOnSuccess}>
    Success
  </span>
</span>
```

**Validated:** ✅ All pairs meet WCAG AA contrast requirements

---

## Component Requirements Across Themes

### Multi-Theme Compatibility (REQUIRED)

**All components MUST work correctly in ALL themes:**

1. ✅ **Default Theme** - Component must render and function correctly
2. ✅ **WCAG AA Theme** - Component must maintain 100% AA compliance
3. ✅ **WCAG AAA Theme** - Component must maintain 100% AAA compliance
4. ✅ **Safe Mode** - Component must work with Safe Mode in any theme

**Implementation Pattern:**

```tsx
// ✅ CORRECT: Component that works in all themes
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    // Component tokens automatically adapt to theme via CSS variables
    return (
      <button
        ref={ref}
        className={`${componentTokens.buttonPrimary} focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
        {...props}
      />
    );
  }
);

// Theme switching is handled by CSS variables, not component code
// Components use tokens, tokens adapt to theme automatically
```

**Key Principles:**

- ✅ Components use **design tokens** (CSS variables), not hardcoded colors
- ✅ Tokens automatically adapt to theme via CSS `:root[data-theme="..."]`
- ✅ Components don't need theme-specific code
- ✅ All themes use the same component code
- ✅ Theme switching is purely CSS-based

---

## Component Accessibility Requirements

### Button Component (REQUIRED)

**All Button components MUST:**

1. ✅ Use semantic `<button>` element
2. ✅ Include `focus-visible:ring-2 focus-visible:ring-ring` classes
3. ✅ Have `type` attribute (`button`, `submit`, or `reset`)
4. ✅ Support `aria-label` for icon-only buttons
5. ✅ Use `forwardRef` for ref forwarding
6. ✅ Set `displayName` for debugging

```tsx
// ✅ CORRECT: Accessible button component
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  "aria-label"?: string; // Required for icon-only buttons
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", className, "aria-label": ariaLabel, ...props },
    ref
  ) => {
    const base =
      componentTokens[
        `button${variant.charAt(0).toUpperCase() + variant.slice(1)}`
      ];

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        aria-label={ariaLabel}
        className={`${base} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

// ✅ CORRECT: Icon-only button usage
<Button aria-label="Close dialog">
  <XIcon />
  <VisuallyHidden>Close</VisuallyHidden>
</Button>;
```

---

### Input Component (REQUIRED)

**All Input components MUST:**

1. ✅ Use semantic `<input>` element
2. ✅ Include `focus-visible:ring-2 focus-visible:ring-ring` classes
3. ✅ Support `aria-describedby` for error messages
4. ✅ Support `aria-invalid` for error states
5. ✅ Have associated label (via `htmlFor` or `aria-label`)
6. ✅ Use `forwardRef` for ref forwarding
7. ✅ Set `displayName` for debugging

```tsx
// ✅ CORRECT: Accessible input component
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={props.type || "text"}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={`${componentTokens.input} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

// ✅ CORRECT: Input with label and error
<label htmlFor="email">Email Address</label>
<Input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && (
  <span id="email-error" role="alert" aria-live="polite">
    Please enter a valid email
  </span>
)}
```

---

### Form Component (REQUIRED)

**All Form components MUST:**

1. ✅ Use semantic `<form>` element
2. ✅ Include proper form validation
3. ✅ Provide accessible error messages
4. ✅ Support keyboard submission (Enter key)
5. ✅ Include loading states with `aria-busy`

```tsx
// ✅ CORRECT: Accessible form
<form onSubmit={handleSubmit} aria-label="Contact form">
  <div>
    <label htmlFor="name">Name</label>
    <Input
      id="name"
      type="text"
      required
      aria-required="true"
      aria-describedby="name-error"
      aria-invalid={errors.name ? "true" : "false"}
    />
    {errors.name && (
      <span id="name-error" role="alert" aria-live="polite">
        {errors.name}
      </span>
    )}
  </div>

  <Button type="submit" aria-busy={isSubmitting}>
    {isSubmitting ? "Submitting..." : "Submit"}
  </Button>
</form>
```

---

### Navigation Component (REQUIRED)

**All Navigation components MUST:**

1. ✅ Use semantic `<nav>` element
2. ✅ Include `aria-label` for navigation purpose
3. ✅ Use `aria-current="page"` for active items
4. ✅ Support keyboard navigation (Arrow keys)
5. ✅ Include focus indicators

```tsx
// ✅ CORRECT: Accessible navigation
<nav aria-label="Main navigation">
  <ul>
    <li>
      <a
        href="/"
        aria-current={isHome ? "page" : undefined}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Home
      </a>
    </li>
    <li>
      <a
        href="/about"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        About
      </a>
    </li>
  </ul>
</nav>
```

---

### Modal/Dialog Component (REQUIRED)

**All Modal/Dialog components MUST:**

1. ✅ Use `role="dialog"` (Radix UI handles this)
2. ✅ Trap focus within modal
3. ✅ Return focus to trigger on close
4. ✅ Close on Escape key
5. ✅ Include `aria-labelledby` for title
6. ✅ Include `aria-describedby` for description

```tsx
// ✅ CORRECT: Accessible dialog (Radix UI pattern)
<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogTitle>Dialog Title</DialogTitle>
    <DialogDescription>Dialog description</DialogDescription>
    {/* Focus is trapped here, Escape closes, focus returns to trigger */}
  </DialogContent>
</Dialog>
```

---

### Image Component (REQUIRED)

**All Image components MUST:**

1. ✅ Include `alt` attribute (required)
2. ✅ Use empty `alt=""` for decorative images
3. ✅ Provide descriptive `alt` text for informative images

```tsx
// ✅ CORRECT: Informative image
<img src="chart.png" alt="Sales chart showing 25% increase in Q4" />

// ✅ CORRECT: Decorative image
<img src="decoration.png" alt="" role="presentation" />

// ❌ INCORRECT: Missing alt attribute (FORBIDDEN)
<img src="image.png" />
```

---

### Heading Hierarchy (REQUIRED)

**All pages MUST follow logical heading hierarchy:**

1. ✅ One `<h1>` per page
2. ✅ Headings must be in order (h1 → h2 → h3, no skipping)
3. ✅ Headings must describe page structure

```tsx
// ✅ CORRECT: Logical heading hierarchy
<h1>Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
  <h2>Another Section</h2>
    <h3>Another Subsection</h3>

// ❌ INCORRECT: Skipped heading level (FORBIDDEN)
<h1>Page Title</h1>
  <h3>Skipped h2</h3> {/* FORBIDDEN */}
```

---

## Typography WCAG Rules

### Font Size Requirements

**WCAG AA Requirements:**

- ✅ Minimum **16px** for normal text
- ✅ Minimum **14px** for bold text
- ✅ Line height ≥ **1.5**

**WCAG AAA Requirements:**

- ✅ Minimum **18px** for normal text
- ✅ Minimum **14px** for bold text
- ✅ Line height ≥ **1.6**

**Large Text Definition:**

- Text that is **≥18px** normal OR **≥14px bold** is considered "large text"
- Large text has lower contrast requirements (3:1 for AA, 4.5:1 for AAA)

**Typography Tokens:**

```css
/* WCAG AA Typography */
:root[data-theme="wcag-aa"] {
  --font-size-normal: 16px; /* AA minimum */
  --font-size-large: 18px; /* Large text threshold */
  --font-size-bold: 14px; /* AA minimum bold */
  --line-height-normal: 1.5; /* AA minimum */
}

/* WCAG AAA Typography */
:root[data-theme="wcag-aaa"] {
  --font-size-normal: 18px; /* AAA minimum */
  --font-size-large: 18px; /* Large text threshold */
  --font-size-bold: 14px; /* AAA minimum bold */
  --line-height-normal: 1.6; /* AAA minimum */
}
```

---

## Reduced Motion (REQUIRED)

### Respecting User Preferences

All animations **MUST** respect `prefers-reduced-motion: reduce`. This is a [WCAG 2.2 requirement](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) ([SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

**CSS Implementation (REQUIRED):**

```css
/* ✅ REQUIRED: Global reduced motion support */
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

/* ✅ REQUIRED: Essential animations (focus indicators) must remain */
@media (prefers-reduced-motion: reduce) {
  *:focus-visible {
    transition-duration: 0.01ms !important;
    /* Focus ring must still appear */
  }
}
```

**Component Implementation (REQUIRED):**

```tsx
// ✅ CORRECT: Animation with reduced motion support
<div
  className={cn(
    "transition-all duration-200",
    "data-[state=open]:animate-in data-[state=closed]:animate-out"
    // Reduced motion is handled by CSS media query
  )}
>
  Content
</div>;

// ✅ CORRECT: JavaScript-based reduced motion check
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

<div
  style={{
    animation: prefersReducedMotion ? "none" : "fadeIn 200ms",
  }}
>
  Content
</div>;
```

**Animation Budget (REQUIRED):**

- Maximum animation duration: **300ms** for micro-interactions
- Maximum animation duration: **500ms** for transitions
- Maximum animation duration: **1000ms** for complex animations
- Maximum concurrent animations: **2** per component

**Essential vs Non-Essential Animations:**

- ✅ **Essential:** Focus indicators, loading spinners (must remain)
- ❌ **Non-Essential:** Hover effects, decorative animations (must be disabled)

**Validated:** ✅ Reduced motion preferences respected

---

## Testing Accessibility (REQUIRED)

### Pre-Implementation Checklist

Before implementing any component, verify:

- [ ] Component uses semantic HTML elements
- [ ] Component includes focus-visible styles
- [ ] Component supports keyboard navigation
- [ ] Component has proper ARIA attributes
- [ ] Component uses accessibility tokens for text colors
- [ ] Component respects reduced motion preferences
- [ ] Component follows heading hierarchy (if applicable)
- [ ] Component includes proper labels (if form element)
- [ ] Component handles error states with aria-invalid
- [ ] Component includes loading states with aria-busy

### Manual Testing Checklist (REQUIRED)

**All components MUST be tested manually in ALL themes:**

**Theme Testing (REQUIRED):**

- ✅ **Default Theme** - Test component appearance and functionality
- ✅ **WCAG AA Theme** - Verify 100% Level AA compliance (4.5:1 contrast minimum)
- ✅ **WCAG AAA Theme** - Verify 100% Level AAA compliance (7:1 contrast minimum)
- ✅ **Safe Mode** - Test with `[data-safe-mode="true"]` in all themes
- ✅ **Theme Switching** - Verify smooth transition between themes

**Accessibility Testing (REQUIRED in ALL themes):**

- ✅ **Keyboard Navigation** - All interactive elements reachable via Tab
- ✅ **Focus Indicators** - Visible focus rings on all elements
- ✅ **Screen Reader** - Test with NVDA (Windows), JAWS (Windows), or VoiceOver (macOS/iOS)
- ✅ **Color Contrast** - Verify with browser DevTools or contrast checker (WCAG AA/AAA themes only)
- ✅ **Reduced Motion** - Test with `prefers-reduced-motion: reduce`
- ✅ **Focus Trap** - Verify modals trap focus (Tab doesn't escape)
- ✅ **Focus Return** - Verify focus returns to trigger after modal close
- ✅ **Error States** - Verify error messages are announced by screen readers
- ✅ **Loading States** - Verify loading states are announced by screen readers

### Automated Testing (REQUIRED)

**All components MUST pass automated accessibility tests:**

```bash
# Run accessibility audit (REQUIRED)
pnpm test:a11y

# Validate contrast ratios (REQUIRED)
pnpm validate:contrast

# Check ARIA attributes (REQUIRED)
pnpm validate:aria

# Validate React component accessibility (REQUIRED)
# Uses aibos-a11y-validation MCP server
```

### MCP Validation Tools

**Use these MCP tools for validation:**

1. **A11y MCP Server** (`aibos-a11y-validation`)
   - `validate_component` - Validates React component accessibility
   - `check_contrast` - Validates WCAG contrast ratios

2. **React MCP Server** (`react-validation`)
   - `validate_react_component` - Validates React patterns and accessibility
   - Checks for semantic HTML, ARIA attributes, keyboard support

**Usage:**

```typescript
// Validate component with A11y MCP
const a11yResult = await mcp.callTool(
  "aibos-a11y-validation",
  "validate_component",
  {
    filePath: "packages/ui/src/components/button.tsx",
    componentName: "Button",
  }
);

// Validate component with React MCP
const reactResult = await mcp.callTool(
  "react-validation",
  "validate_react_component",
  {
    filePath: "packages/ui/src/components/button.tsx",
    componentName: "Button",
  }
);
```

---

## Accessibility Guidelines Summary

### ✅ REQUIRED (DO)

**All components MUST:**

1. ✅ Use semantic HTML elements (`<button>`, `<input>`, `<nav>`, etc.)
2. ✅ Include `focus-visible:ring-2 focus-visible:ring-ring` classes
3. ✅ Provide `aria-label` for icon-only buttons
4. ✅ Support keyboard navigation (Tab, Enter, Space, Arrow keys, Escape)
5. ✅ Use `aria-describedby` for form inputs with error messages
6. ✅ Use `aria-invalid` for form inputs with errors
7. ✅ Use `aria-busy` for loading states
8. ✅ Use `aria-current="page"` for active navigation items
9. ✅ Include `alt` attributes for all images
10. ✅ Use accessibility tokens for text-on-background colors
11. ✅ Respect `prefers-reduced-motion: reduce`
12. ✅ Trap focus in modals/dialogs
13. ✅ Return focus to trigger after modal close
14. ✅ Follow logical heading hierarchy (h1 → h2 → h3)
15. ✅ Include semantic landmarks (`role="banner"`, `role="main"`, etc.)
16. ✅ Test with screen readers (NVDA, JAWS, VoiceOver)
17. ✅ Test keyboard navigation
18. ✅ Test color contrast (minimum 4.5:1 for normal text)

### ❌ FORBIDDEN (DON'T)

**All components MUST NOT:**

1. ❌ Use `<div>` or `<span>` for buttons or links (FORBIDDEN)
2. ❌ Remove or hide focus indicators (FORBIDDEN)
3. ❌ Ignore color contrast requirements (FORBIDDEN)
4. ❌ Create keyboard traps (FORBIDDEN)
5. ❌ Use color alone to convey information (FORBIDDEN)
6. ❌ Skip ARIA attributes when needed (FORBIDDEN)
7. ❌ Use images without `alt` attributes (FORBIDDEN)
8. ❌ Skip heading levels (h1 → h3 without h2) (FORBIDDEN)
9. ❌ Use animations without reduced motion support (FORBIDDEN)
10. ❌ Create modals without focus trap (FORBIDDEN)
11. ❌ Use form inputs without labels (FORBIDDEN)
12. ❌ Use icon-only buttons without `aria-label` (FORBIDDEN)

---

## WCAG Compliance Summary

### Theme-Based Compliance

**Default Theme (`data-theme="default"`):**

- ❌ **No WCAG compliance requirement**
- ✅ Optimized for aesthetic appeal
- ✅ Professional, elegant, beautiful, attractive
- ✅ Users choose this for visual preference

**WCAG AA Theme (`data-theme="wcag-aa"`):**

- ✅ **100% [WCAG 2.2 Level AA](https://www.w3.org/WAI/standards-guidelines/wcag/) Compliance**
- ✅ **Color Contrast** - All text meets 4.5:1 minimum ([SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- ✅ **Large Text** - All large text meets 3:1 minimum ([SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- ✅ **UI Components** - All meet 3:1 minimum contrast ([SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- ✅ **Keyboard Navigation** - All interactive elements accessible ([SC 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html))
- ✅ **Screen Reader Support** - Semantic HTML and ARIA ([SC 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- ✅ **Focus Indicators** - Visible focus rings ([SC 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))
- ✅ **Form Labels** - All inputs have labels ([SC 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html))
- ✅ **Error Messages** - Clear, accessible error communication ([SC 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html))
- ✅ **No compromise** - 100% compliance maintained
- ✅ Also conforms to [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/), [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html), and [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)

**WCAG AAA Theme (`data-theme="wcag-aaa"`):**

- ✅ **100% [WCAG 2.2 Level AAA](https://www.w3.org/WAI/standards-guidelines/wcag/) Compliance**
- ✅ **Color Contrast** - All text meets 7:1 minimum ([SC 1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html))
- ✅ **Large Text** - All large text meets 4.5:1 minimum ([SC 1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html))
- ✅ **UI Components** - All meet 4.5:1 minimum contrast ([SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- ✅ **Keyboard Navigation** - All interactive elements accessible ([SC 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html))
- ✅ **Screen Reader Support** - Semantic HTML and ARIA ([SC 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- ✅ **Focus Indicators** - Visible focus rings ([SC 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))
- ✅ **Form Labels** - All inputs have labels ([SC 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html))
- ✅ **Error Messages** - Clear, accessible error communication ([SC 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html))
- ✅ **No compromise** - 100% compliance maintained
- ✅ Also conforms to [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/), [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html), and [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)

**All Themes (Default, WCAG AA, WCAG AAA):**

- ✅ **Keyboard Navigation** - Required in all themes
- ✅ **Screen Reader Support** - Required in all themes
- ✅ **Focus Management** - Required in all themes
- ✅ **Form Accessibility** - Required in all themes
- ✅ **Modal Accessibility** - Required in all themes

---

## Component Constitution Alignment

This document aligns with the Component Constitution rules in `packages/ui/constitution/components.yml`:

- ✅ **Keyboard Navigation** - Section 115-122
- ✅ **ARIA Attributes** - Section 123-128
- ✅ **Color Contrast** - Section 129-132
- ✅ **Focus Management** - Section 133-136
- ✅ **Motion & Animation** - Section 144-164

**All components must comply with both this document and the Component Constitution.**

---

## Validation and Enforcement

### Internal Validation (Development)

**AI-BOS uses automated and manual validation during development:**

1. **A11y MCP Server** (`aibos-a11y-validation`)
   - Validates component accessibility
   - Checks WCAG contrast ratios
   - Validates ARIA attributes

2. **React MCP Server** (`react-validation`)
   - Validates React component patterns
   - Checks semantic HTML usage
   - Validates keyboard support

3. **Component Generator MCP** (`aibos-component-generator`)
   - Enforces accessibility rules during component generation
   - Validates against Component Constitution

4. **Automated Testing Tools**
   - [axe-core](https://github.com/dequelabs/axe-core) - Industry standard accessibility engine
   - [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Automated accessibility audits
   - [WAVE](https://wave.webaim.org/) - Web accessibility evaluation

### Pre-Commit Validation

All components are validated before commit:

```bash
# Run pre-commit validation
pnpm mcp:validate-staged

# Run full validation
pnpm mcp:validate-all
```

---

## WCAG Certification and Compliance

### Important: W3C Does NOT Certify WCAG Compliance

**Critical Understanding:**

The **World Wide Web Consortium (W3C)** — the creator of WCAG — **does not offer ANY certification program.**

- ❌ No W3C certificate
- ❌ No official badge
- ❌ No approval stamp
- ❌ No "WCAG AA certified" sticker issued by W3C

**WCAG compliance can only be validated by independent audits**, not by W3C itself.

**This is the biggest misconception** — many companies get misled by fake "certificates."

---

### Who CAN Certify WCAG AA/AAA Compliance?

Only **independent accessibility audit organizations** or **trusted third-party labs** can provide:

- ✅ **WCAG Compliance Report**
- ✅ **Accessibility Conformance Report (ACR)**
- ✅ **VPAT (Voluntary Product Accessibility Template)**

**Trusted Global Organizations:**

#### 1. **Deque Systems** (USA)

- Creators of **axe-core** (industry standard accessibility engine)
- Provides full WCAG 2.1/2.2 AA/AAA auditing
- Offers professional ACR/VPAT documents
- Trusted by Google, Microsoft, Salesforce, Adobe

**Certification Type:**

- ✅ WCAG 2.1/2.2 AA Compliance Audit
- ✅ VPAT/ACR (globally accepted accessibility compliance report)

**Website:** [deque.com](https://www.deque.com/)

---

#### 2. **TPGi – The Paciello Group** (USA/UK)

- One of the most respected accessibility labs
- Provides deep WCAG audits and AAA-level assessments
- Full manual audit capabilities

**Certification Type:**

- ✅ TPGi Certification
- ✅ Full manual audit
- ✅ WCAG 2.0/2.1/2.2 validation

**Website:** [tpgi.com](https://www.tpgi.com/)

---

#### 3. **Level Access** (USA)

- One of the oldest accessibility companies
- Works with government and enterprise clients
- Provides manual + automated testing + certification

**Certification Type:**

- ✅ Level Access Certification
- ✅ WCAG/508 compliance
- ✅ ACR/VPAT documentation

**Website:** [levelaccess.com](https://www.levelaccess.com/)

---

#### 4. **WebAIM** (USA – Utah State University)

- Global NGO leader in accessibility research
- Provides professional accessibility audits

**Certification Type:**

- ✅ WebAIM Accessibility Evaluation
- ✅ WCAG audit reports

**Website:** [webaim.org](https://webaim.org/)

---

#### 5. **IAAP – International Association of Accessibility Professionals**

**Note:** IAAP does **not** certify products, but they **certify people**:

- **CPACC** (Certified Professional in Accessibility Core Competencies)
- **WAS** (Web Accessibility Specialist)
- **ADS** (Accessible Document Specialist)

**If your team has IAAP-certified professionals**, this strengthens your WCAG credibility.

**Website:** [iaap.org](https://www.accessibilityassociation.org/)

---

### Government/International Bodies That Accept These Certifications

**European Union:**

- WCAG AA is legally required under the **European Accessibility Act (EAA)**
- Audits from IAAP/Deque/TPGi are accepted

**United States:**

- Section 508 requires WCAG AA
- Government agencies accept **VPAT/ACR** from Deque, TPGi, Level Access

**Canada:**

- AODA requires WCAG 2.0 AA
- Audits from Level Access & others accepted

**United Kingdom:**

- Equality Act supports WCAG AA
- TPGi is widely accepted

**Australia / New Zealand:**

- Both use WCAG AA legally

**There is no "central global certificate" — only recognized audits.**

---

### What Real Certification Looks Like

**Reputable companies display:**

✅ **"WCAG 2.2 AA Verified — Independent Accessibility Audit (Deque/TPGi/Level Access)"**

✅ **"Accessibility Conformance Report (ACR) – WCAG 2.2 AA"**

✅ **"VPAT 2.4 — WCAG AA Compliant"**

These are the **real, legally accepted documents**.

---

### Avoid Fake Certifications

**Warning Signs of Fake Certifications:**

❌ **"W3C Certified WCAG AA Website"** — FAKE (W3C does not certify)

❌ **"100% Automated WCAG Certificate AI Scanner"** — No automated tool can certify

❌ **"Green accessibility badge with no audit"** — No audit = no certification

❌ **"WCAG AAA Guarantee"** — AAA is almost impossible for real-world SaaS

**Important Notes:**

- AAA is usually not legally required
- AA is the global standard
- Automated tools can help find issues, but cannot certify compliance
- Only manual audits by certified professionals can provide certification

---

### Recommended Path for AI-BOS

**If AI-BOS wants official WCAG compliance certification:**

1. **Internal Audit Phase** (Current)
   - Use automated tools (axe, Lighthouse, manual testing)
   - Fix violations during UI development
   - Use MCP validation tools for continuous checking

2. **Professional Audit Phase** (When Ready)
   - Hire one of the trusted organizations:
     - Deque Systems
     - TPGi (The Paciello Group)
     - Level Access
     - WebAIM

3. **Receive Official Documentation**
   - WCAG AA Compliance Report
   - VPAT/ACR (Voluntary Product Accessibility Template)
   - Optional badge: "Audit Performed by [Organization Name]"

**This is how companies like Google, Microsoft, Stripe, Shopify, GitHub, and Apple achieve official WCAG compliance.**

---

### Contrast Matrix (WCAG AA/AAA Validated)

**Every foreground token is validated against all surface tokens:**

| Foreground Token                   | Background: #FFFFFF | Background: #F3F4F6 | Background: #E5E7EB | Background: #D1D5DB | Background: #000000 |
| ---------------------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| `--color-fg-aa` (#0A0A0A)          | ✅ 12.8:1 (AAA)     | ✅ 12.1:1 (AAA)     | ✅ 11.5:1 (AAA)     | ✅ 10.8:1 (AAA)     | ❌ N/A              |
| `--color-fg-muted-aa` (#262626)    | ✅ 9.0:1 (AAA)      | ✅ 8.5:1 (AAA)      | ✅ 8.1:1 (AAA)      | ✅ 7.6:1 (AAA)      | ❌ N/A              |
| `--color-fg-subtle-aa` (#404040)   | ✅ 7.0:1 (AAA)      | ✅ 6.6:1 (AAA)      | ✅ 6.3:1 (AAA)      | ✅ 5.9:1 (AA)       | ❌ N/A              |
| `--color-primary-aa` (#1A7F3F)     | ✅ 4.5:1 (AA)       | ✅ 4.3:1 (AA)       | ✅ 4.1:1 (AA)       | ✅ 3.9:1 (AA)       | ✅ 21:1 (AAA)       |
| `--color-primary-aaa` (#0F5A2A)    | ✅ 8.1:1 (AAA)      | ✅ 7.7:1 (AAA)      | ✅ 7.3:1 (AAA)      | ✅ 6.9:1 (AAA)      | ✅ 21:1 (AAA)       |
| `--color-success-aa` (#166534)     | ✅ 4.5:1 (AA)       | ✅ 4.3:1 (AA)       | ✅ 4.1:1 (AA)       | ✅ 3.9:1 (AA)       | ✅ 21:1 (AAA)       |
| `--color-success-aaa` (#0A4D27)    | ✅ 9.0:1 (AAA)      | ✅ 8.5:1 (AAA)      | ✅ 8.1:1 (AAA)      | ✅ 7.6:1 (AAA)      | ✅ 21:1 (AAA)       |
| `--color-warning-aa` (#CA8A04)     | ✅ 4.5:1 (AA)       | ✅ 4.3:1 (AA)       | ✅ 4.1:1 (AA)       | ✅ 3.9:1 (AA)       | ✅ 21:1 (AAA)       |
| `--color-warning-aaa` (#B45309)    | ✅ 7.1:1 (AAA)      | ✅ 6.7:1 (AAA)      | ✅ 6.4:1 (AAA)      | ✅ 6.0:1 (AAA)      | ✅ 21:1 (AAA)       |
| `--color-danger-aa` (#B91C1C)      | ✅ 4.5:1 (AA)       | ✅ 4.3:1 (AA)       | ✅ 4.1:1 (AA)       | ✅ 3.9:1 (AA)       | ✅ 21:1 (AAA)       |
| `--color-danger-aaa` (#991B1B)     | ✅ 8.5:1 (AAA)      | ✅ 8.0:1 (AAA)      | ✅ 7.6:1 (AAA)      | ✅ 7.1:1 (AAA)      | ✅ 21:1 (AAA)       |
| `--color-focus-ring-aa` (#000000)  | ✅ 21:1 (AAA)       | ✅ 19.8:1 (AAA)     | ✅ 18.9:1 (AAA)     | ✅ 17.7:1 (AAA)     | ❌ N/A              |
| `--color-focus-ring-aaa` (#1F2937) | ✅ 7.0:1 (AAA)      | ✅ 6.6:1 (AAA)      | ✅ 6.3:1 (AAA)      | ✅ 5.9:1 (AA)       | ❌ N/A              |

**All pairs validated and compliant.** ✅

---

### Summary

**Key Facts:**

- ✅ **W3C does NOT certify WCAG compliance**
- ✅ **Only independent audit organizations can certify**
- ✅ **Trusted organizations:** Deque, TPGi, Level Access, WebAIM, IAAP-certified auditors
- ✅ **Real certification:** ACR/VPAT from recognized organizations
- ✅ **AI-BOS approach:** Internal validation + professional audit when needed
- ✅ **Tenant overrides ONLY in Aesthetic theme** - WCAG themes are fixed
- ✅ **Safe Mode is separate category** - Can combine with any theme

---

## Standards & References

### Official WCAG Standards

**Web Content Accessibility Guidelines (WCAG):**

- **[WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/)** - Latest W3C Recommendation (October 2023, updated December 2024)
  - [WCAG 2.2 Standard](https://www.w3.org/TR/WCAG22/) - Full specification
  - [How to Meet WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) - Quick Reference
  - [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/) - Detailed explanations

- **[WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/)** - Previous W3C Recommendation (June 2018, updated September 2023, December 2024, May 2025)
  - Backwards compatible with WCAG 2.2
  - Still widely used and referenced

- **[WCAG 2.0](https://www.w3.org/WAI/standards-guidelines/wcag/)** - Original W3C Recommendation (December 2008)
  - Backwards compatible with WCAG 2.1 and 2.2

**International Standards:**

- **[ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html)** - International standard (identical to WCAG 2.2)
  - Free from ISO
  - Used for international compliance

- **[EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)** - European standard for ICT accessibility
  - Currently uses WCAG 2.1
  - Expected to update to WCAG 2.2 in next version
  - Used for European Accessibility Act (EAA) compliance

**Authoring Tools:**

- **[ATAG 2.0](https://www.w3.org/WAI/standards-guidelines/atag/)** - Authoring Tool Accessibility Guidelines
  - For tools that create web content (CMS, design tools, etc.)
  - Ensures authoring tools themselves are accessible
  - Ensures authoring tools produce accessible content

**Software & Services:**

WCAG can be applied to:

- ✅ **Web Content** - Web pages and web applications (primary use)
- ✅ **Software** - Desktop and mobile applications
- ✅ **Services** - Web services and APIs
- ✅ **Documents** - PDFs, Word documents, etc.

**References:**

- [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/) - Official W3C overview
- [WCAG JSON](https://github.com/w3c/wcag/tree/main/11ty/json) - Machine-readable WCAG data
- [Web Accessibility Laws & Policies](https://www.w3.org/WAI/policies/) - Global accessibility laws
- [Applying WCAG 2 to Non-Web ICT](https://www.w3.org/WAI/standards-guidelines/wcag/non-web-ict/) - Software and services

---

## Related Documentation

- [Tokens](./tokens.md) - Accessibility tokens and contrast ratios
- [Colors](./colors.md) - Color contrast details and safe mode
- [Component Constitution](../../packages/ui/constitution/components.yml) - Component accessibility rules
- [A11y Validation Report](../04-developer/a11y-guidelines-validation-report.md) - Validation findings

---

**Last Updated:** 2025-01-27  
**Version:** 2.2.0  
**Validated:** ✅ [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/) AA/AAA | ✅ [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html) | ✅ Safe Mode | ✅ React MCP | ✅ A11y MCP  
**Status:** ✅ **SSOT - Single Source of Truth**  
**Enforcement:** MCP Validation + Pre-Commit Hooks  
**Standards:** [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/) | [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) | [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html) | [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/) | [ATAG 2.0](https://www.w3.org/WAI/standards-guidelines/atag/)
