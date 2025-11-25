# AI-BOS UI Components

This folder contains the **design-system compliant UI primitives** for AI-BOS.

All components must follow:

- **Tailwind v4**
- **globals.css** (runtime design tokens via CSS variables)
- **src/design/tokens.ts** (TypeScript token mapping)
- **Radix UI primitives** for behavior and accessibility (when needed)

No app code should import `@radix-ui/react-*` directly.  
App code imports **only from `components/ui`**.

---

## 1. Design Tokens

There are two layers of tokens:

1. **CSS tokens** in `app/globals.css`
   - Colors: `--color-bg`, `--color-primary`, `--color-success`, etc.
   - Radii: `--radius-sm`, `--radius-lg`, etc.
   - Shadows: `--shadow-sm`, `--shadow-md`, etc.
   - Light/dark modes via `:root` and `:root[data-mode="dark"], :root.dark`.

2. **TypeScript tokens** in `src/design/tokens.ts`
   - `colorTokens` – surface + brand utilities (`bg-bg`, `bg-primary`, etc.)
   - `accessibilityTokens` – text-on-surface pairs (`text-primary-foreground`, etc.)
   - `radiusTokens`, `shadowTokens`, `spacingTokens`, `typographyTokens`
   - `componentTokens` – ready presets:
     - `buttonPrimary`, `buttonSecondary`, `buttonGhost`
     - `card`, `badgePrimary`, `badgeMuted`

All visual styling must be expressed via these tokens.

---

## 2. Styling Rules

**✅ Allowed:**

- Import tokens:

  ```ts
  import {
    colorTokens,
    accessibilityTokens,
    radiusTokens,
    shadowTokens,
    spacingTokens,
    typographyTokens,
    componentTokens,
  } from '@/design/tokens'
  ```
