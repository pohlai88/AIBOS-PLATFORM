# Primitive Shared Components

> **Layer 1 Primitives** - RSC-Compatible, Token-Based, MCP-Validated  
> **Version:** 1.0.0  
> **Status:** ✅ SSOT Compliant

---

## Overview

Basic UI building blocks that work in both Server and Client environments. All primitives follow the AI-BOS design system with exclusive token usage and WCAG 2.1 AA/AAA compliance.

## Architecture

- ✅ **NO `'use client'` directive** - RSC-safe
- ✅ **NO Radix UI dependencies** - Native HTML elements
- ✅ **Token-based styling only** - Design system compliant
- ✅ **`forwardRef` + `displayName`** - Required for all components
- ✅ **MCP validation markers** - Constitution compliance

## Components

### Form Primitives

| Component | File | Description |
|-----------|------|-------------|
| Input | `input.tsx` | Text input field |
| Textarea | `textarea.tsx` | Multi-line input |
| Select | `select.tsx` | Native HTML select |
| Checkbox | `checkbox.tsx` | Native checkbox |
| Toggle | `toggle.tsx` | Switch/toggle (RSC-safe) |
| Radio | `radio.tsx` | Radio button |
| Label | `label.tsx` | Form label |
| Fieldset | `fieldset.tsx` | Form grouping |
| FormDescription | `form-description.tsx` | Helper text |
| FormError | `form-error.tsx` | Error message |
| FieldGroup | `field-group.tsx` | Form field group |

### Surface Primitives

| Component | File | Description |
|-----------|------|-------------|
| Card | `card.tsx` | Card container |
| Surface | `surface.tsx` | Generic surface/block |
| Divider | `divider.tsx` | Horizontal divider |
| Separator | `separator.tsx` | Visual separator |
| Container | `container.tsx` | Section container |
| Skeleton | `skeleton.tsx` | Loading placeholder |

### Utility Primitives

| Component | File | Description |
|-----------|------|-------------|
| Button | `button.tsx` | All button variants |
| IconButton | `icon-button.tsx` | Icon-only button |
| Badge | `badge.tsx` | Status badge |
| Tag | `tag.tsx` | Tag/chip component |
| Tooltip | `tooltip.tsx` | Non-Radix tooltip trigger |
| Avatar | `avatar.tsx` | User avatar |
| Spinner | `spinner.tsx` | Loading indicator |
| Progress | `progress.tsx` | Native progress bar |

### Layout Primitives

| Component | File | Description |
|-----------|------|-------------|
| Grid | `grid.tsx` | CSS Grid wrapper |
| Flex | `flex.tsx` | Flexbox wrapper |
| Stack | `stack.tsx` | Stack layout (VStack/HStack) |
| Spacer | `spacer.tsx` | Spacing utility |
| ScrollArea | `scroll-area.tsx` | Simple scroll container |
| ResponsiveBox | `responsive-box.tsx` | Responsive container |

## Usage

```tsx
// Server Component usage
import { Button, Card, Input, Grid } from '@aibos/ui/components/shared/primitives'

export default function Page() {
  return (
    <Grid cols={2} gap="lg">
      <Card variant="default">
        <Input label="Name" />
        <Button variant="primary">Submit</Button>
      </Card>
    </Grid>
  )
}

// Client Component usage (with interactivity)
'use client'
import { Button } from '@aibos/ui/components/shared/primitives'

export function InteractiveButton() {
  return (
    <Button onClick={() => console.log('clicked')}>
      Click Me
    </Button>
  )
}
```

## MCP Validation

All components are validated by:
- ✅ **React MCP** - RSC boundary, patterns
- ✅ **Tailwind MCP** - Token usage
- ✅ **A11y MCP** - WCAG compliance

## Guidelines

1. **No client-specific code** - No hooks, no browser APIs
2. **Token-only styling** - Use `colorTokens`, `typographyTokens`, etc.
3. **Semantic HTML** - Use appropriate elements
4. **Accessibility first** - ARIA attributes, keyboard navigation
5. **Event handlers as props** - Optional, works in Client Components

---

**Last Updated:** 2025-01-27  
**MCP Validated:** ✅ React | ✅ Tailwind | ✅ A11y
