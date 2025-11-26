# Typography Shared Components

> **Layer 1 Typography Primitives** - RSC-Compatible, Token-Based, MCP-Validated  
> **Version:** 1.0.0  
> **Status:** ✅ SSOT Compliant

---

## Overview

Typography components that work in both Server and Client environments. All components follow the AI-BOS typography system with semantic tokens and WCAG 2.1 AA/AAA compliance.

## Architecture

- ✅ **NO `'use client'` directive** - RSC-safe
- ✅ **Typography tokens only** - No raw font sizes
- ✅ **Semantic HTML elements** - Proper heading hierarchy
- ✅ **`forwardRef` + `displayName`** - Required for all components
- ✅ **MCP validation markers** - Constitution compliance

## Components

| Component | File | Description |
|-----------|------|-------------|
| Text | `text.tsx` | Base text component (p, span, div) |
| Heading | `heading.tsx` | Semantic headings (h1-h6) |
| MutedText | `muted-text.tsx` | Secondary/helper text |
| Code | `code.tsx` | Inline and block code |
| Link | `link.tsx` | Token-controlled links |

## Usage

```tsx
// Server Component usage
import { Heading, Text, MutedText, Code, Link } from '@aibos/ui/components/shared/typography'

export default function Page() {
  return (
    <article>
      <Heading level={1}>Page Title</Heading>
      <Text size="lg">
        This is body text with <Code>inline code</Code>.
      </Text>
      <MutedText>Last updated 2 hours ago</MutedText>
      <Link href="/about" variant="primary">Learn more</Link>
    </article>
  )
}

// Different text variants
<Text variant="label">Form Label</Text>
<Text variant="caption">Caption text</Text>
<Text variant="overline">SECTION TITLE</Text>
```

## Typography Scale

Based on Major Third (1.250 ratio):

| Token | Size | Usage |
|-------|------|-------|
| `labelSm` | 11px | Small labels, overlines |
| `bodySm` | 12px | Captions, small text |
| `bodyMd` | 15px | Body text |
| `bodyLg` | 18px | Large body |
| `headingSm` | 20px | H4 headings |
| `headingMd` | 24px | H3 headings |
| `headingLg` | 30px | H2 headings |

## MCP Validation

All components are validated by:
- ✅ **React MCP** - RSC boundary, patterns
- ✅ **Tailwind MCP** - Typography token usage
- ✅ **A11y MCP** - WCAG compliance, contrast

## Guidelines

1. **Use semantic tokens** - Never use raw font sizes
2. **Proper heading hierarchy** - H1 → H2 → H3, no skipping
3. **Color tokens for text** - `colorTokens.text`, `colorTokens.textMuted`
4. **Accessibility** - Sufficient contrast (4.5:1 AA, 7:1 AAA)
5. **Polymorphic `as` prop** - Render as appropriate element

---

**Last Updated:** 2025-01-27  
**MCP Validated:** ✅ React | ✅ Tailwind | ✅ A11y
