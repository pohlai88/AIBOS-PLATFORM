# AI-BOS Design Tokens v3.3

Enterprise-grade design token system for RSC-safe, WCAG AA/AAA compliant UI.

## Files

| File | Purpose |
|------|---------|
| `tokens.ts` | SSOT for all semantic tokens (colors, spacing, typography, etc.) |
| `server.ts` | RSC-safe token bundle (no motion/interactivity) |
| `client.ts` | Client-only tokens (motion, transitions, hover states) |
| `globals.css` | Tailwind v4 `@theme` + CSS variable definitions |
| `index.ts` | Barrel export for all tokens |

## Usage

```ts
// Import all tokens
import { colorTokens, spacingTokens, serverTokens, clientTokens } from "@aibos/ui/design/tokens";

// Import CSS in your app's layout
import "@aibos/ui/design/globals.css";
```

## Token Categories

- **Colors**: `bg`, `fg`, `primary`, `secondary`, `brand`, `success`, `warning`, `danger`, `border`
- **Typography**: `xs`, `sm`, `base`, `lg`, `h1`-`h6`, `displaySm/Md/Lg`
- **Spacing**: `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- **Radius**: `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `full`
- **Shadows**: `xs`, `sm`, `md`, `lg`

## Modes

- **Dark Mode**: `data-mode="dark"` or `.dark` class
- **Safe Mode**: `data-safe-mode="true"` (high contrast, no shadows)
- **AAA Mode**: `data-accessibility="aaa"` (WCAG AAA compliance)
- **Tenant Branding**: `data-tenant="dlbb"` or `data-tenant="enterprise"`

## Architecture

```
tokens.ts (SSOT)
    ↓
server.ts ← RSC Components
client.ts ← Client Components
    ↓
globals.css (CSS Variables)
```

Brand inherits Primary by default (Option C). Tenant branding is opt-in.
