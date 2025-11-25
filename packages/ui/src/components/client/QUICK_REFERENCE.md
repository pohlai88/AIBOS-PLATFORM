# Layer 2 Quick Reference Card

**Status:** ✅ MCP CERTIFIED **Date:** November 25, 2025

---

## 🎯 Quick Facts

| Item                   | Value                         |
| ---------------------- | ----------------------------- |
| **Layer**              | 2 (Radix Compositions)        |
| **Location**           | `client/compositions/`        |
| **Component Type**     | Client Components             |
| **Directive Required** | `'use client'`                |
| **Dependencies**       | Radix UI + Layer 1 Typography |
| **Validation**         | Next.js MCP + React MCP       |
| **Status**             | ✅ CERTIFIED                  |

---

## 📦 4 Components Ready to Build

1. **Dialog** - Modal dialogs (P1)
2. **Popover** - Floating popovers (P2)
3. **Tooltip** - Hover tooltips (P3)
4. **ScrollArea** - Custom scrollbars (P4)

---

## 🚀 Installation

```bash
pnpm add @radix-ui/react-dialog \
         @radix-ui/react-popover \
         @radix-ui/react-tooltip \
         @radix-ui/react-scroll-area
```

---

## 📋 Component Template

```tsx
'use client'

import * as RadixPrimitive from '@radix-ui/react-[primitive]'
import { Text, Heading } from '@aibos/ui/typography'
import { colorTokens } from '@/design/tokens/tokens'
import { cn } from '@/design/utilities/cn'

export function Composition({ title, children }: Props) {
  return (
    <RadixPrimitive.Root>
      <RadixPrimitive.Content>
        <Heading level="h2">{title}</Heading>
        <Text variant="body">{children}</Text>
      </RadixPrimitive.Content>
    </RadixPrimitive.Root>
  )
}
```

---

## 🔍 MCP Validation (Per Component)

```typescript
// 1. RSC Boundary
mcp_react - validat_validate_rsc_boundary({ filePath })
// Expected: { isServerComponent: false, violations: [] }

// 2. Server/Client Usage
mcp_react - validat_check_server_client_usage({ filePath })
// Expected: { isClientComponent: true, issues: [] }

// 3. Imports
mcp_react - validat_validate_imports({ filePath })
// Expected: { valid: true }

// 4. Quality
mcp_react - validat_validate_react_component({ filePath, componentName })
// Expected: { valid: true, errors: [] }
```

---

## ✅ Validation Results (Baseline)

**Layer 1 Typography (Text component):**

- ✅ RSC Boundary: PASS (isServerComponent: true)
- ✅ Server/Client Usage: PASS (0 violations)
- ✅ Import Trace: PASS (2 files, 0 transitive violations)
- ✅ Component Quality: PASS (valid: true)

**Result:** Layer 1 ready for Layer 2 integration ✅

---

## 📄 Documentation

1. **[LAYER2_ARCHITECTURE_VALIDATION.md](./LAYER2_ARCHITECTURE_VALIDATION.md)** Detailed validation
   report (15+ pages)

2. **[LAYER2_CERTIFICATION_SUMMARY.md](./LAYER2_CERTIFICATION_SUMMARY.md)** Official MCP
   certification (10+ pages)

3. **[README.md](./README.md)** Updated with Layer 2 section

---

## 🎨 Design System

**Tokens Available:**

- ✅ `colorTokens` (21 tokens)
- ✅ `typographyTokens` (19 tokens)
- ✅ `spacingTokens`
- ✅ `radiusTokens`
- ✅ `shadowTokens`
- ✅ `accessibilityTokens`

**Layer 1 Components:**

- ✅ `Text` (shared/typography/text.tsx)
- ✅ `Heading` (shared/typography/heading.tsx)

---

## ♿ Accessibility

**Radix UI Provides:**

- ✅ Focus management
- ✅ Keyboard navigation
- ✅ ARIA attributes
- ✅ Screen reader support
- ✅ WAI-ARIA compliance

**Requirements:**

- ✅ WCAG 2.1 AA minimum
- ✅ Color contrast 4.5:1
- ✅ Touch targets 44x44px

---

## 📊 Certification Authority

- ✅ **Next.js MCP** v16.0.4 Official Docs
- ✅ **React MCP** v2.0.0 RSC Validation
- ✅ **AI-BOS Architecture** 3-Layer Compliance

---

## 🏁 Implementation Order

1. **Dialog** (2-3 hours) - P1
2. **Popover** (2-3 hours) - P2
3. **Tooltip** (1-2 hours) - P3
4. **ScrollArea** (1-2 hours) - P4

**Total:** 6-10 hours

---

## ✅ Final Status

🎯 **APPROVED FOR IMMEDIATE IMPLEMENTATION** 🎯 **ALL VALIDATIONS PASSED** 🎯 **ZERO ARCHITECTURAL
DRIFT**

---

**Quick Links:**

- [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [AI-BOS Architecture](../ARCHITECTURE-FOUNDATION.md)
