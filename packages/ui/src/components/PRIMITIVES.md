# UI Primitives Reference

This directory contains the **hand-crafted core primitives** that serve as reference examples for all future components (both human-written and AI-generated).

## Core Primitives

### ✅ Button (`button.tsx`)
- **Variants**: `primary`, `secondary`, `ghost`
- **Token**: `componentTokens.buttonPrimary`, `buttonSecondary`, `buttonGhost`
- **Pattern**: Uses componentTokens preset, exposes className for layout only

### ✅ Card (`card.tsx`)
- **Token**: `componentTokens.card`
- **Pattern**: Simple wrapper using card preset

### ✅ Badge (`badge.tsx`)
- **Variants**: `primary`, `muted`
- **Token**: `componentTokens.badgePrimary`, `badgeMuted`
- **Pattern**: Variant-based token selection

### ✅ Input (`input.tsx`)
- **Token**: `componentTokens.input`
- **Pattern**: Form input with focus states, disabled states, placeholder styling

## Design Principles

All primitives follow these rules:

1. **Import from tokens**
   ```ts
   import { componentTokens } from "../design/tokens";
   ```

2. **Use componentTokens as base**
   ```ts
   className={`${componentTokens.buttonPrimary} ${className ?? ""}`}
   ```

3. **Expose className only for layout**
   - ✅ Allowed: `className="w-full"`, `className="mb-4"`
   - ❌ Not allowed: Visual overrides like `className="bg-red-500"`

4. **Use forwardRef**
   ```ts
   export const Component = React.forwardRef<HTMLElement, ComponentProps>(...)
   ```

5. **Set displayName**
   ```ts
   Component.displayName = "Component";
   ```

## Example Pattern

```tsx
// packages/ui/src/components/example.tsx
import * as React from "react";
import { componentTokens } from "../design/tokens";

export interface ExampleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Example = React.forwardRef<HTMLDivElement, ExampleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${componentTokens.card} ${className ?? ""}`}
        {...props}
      />
    );
  },
);

Example.displayName = "Example";
```

## For MCP Generation

When generating new components via MCP, they should:
- Follow the exact same pattern as these primitives
- Use `componentTokens` when available
- Build from atomic tokens (`colorTokens`, `radiusTokens`, etc.) when no preset exists
- Never use raw colors, Tailwind palette, or inline styles
- Always use forwardRef and displayName

## Extending

To add a new primitive:
1. Create the component file following the pattern above
2. Add a `componentTokens` preset if it's a common pattern
3. Export in `index.ts`
4. Update this file
5. Run `pnpm lint:ui-constitution` to verify

