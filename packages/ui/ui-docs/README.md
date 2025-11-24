# AI-BOS UI Documentation

> **Single Source of Truth (SSOT)** for UI component documentation, design system guidelines, and developer resources.

This directory contains all UI and design-related documentation for the `@aibos/ui` package. All documentation is validated against:

- ✅ Tailwind Tokens (via MCP)
- ✅ Figma Design System (via MCP)
- ✅ Next.js Best Practices

---

## 📚 Documentation Structure

```
ui-docs/
├── README.md                    # This file - overview and navigation
├── GOVERNANCE.md                # Document control and governance rules
├── CHANGELOG.md                 # Version history and breaking changes
│
├── 01-foundation/               # Core design system foundation
│   ├── philosophy.md            # Design principles and rationale
│   ├── tokens.md                # Token system documentation
│   ├── colors.md                # Color system and usage
│   ├── typography.md            # Typography scale and usage
│   ├── spacing.md               # Spacing system (4px grid)
│   └── accessibility.md        # WCAG compliance and safe mode
│
├── 02-components/               # Component documentation
│   ├── README.md                # Component overview and patterns
│   ├── primitives/              # Radix-based primitives
│   │   ├── button.md
│   │   ├── input.md
│   │   ├── card.md
│   │   └── ...
│   ├── compositions/            # Composite components
│   │   ├── dialog.md
│   │   ├── dropdown-menu.md
│   │   └── ...
│   └── layouts/                # Layout components
│       ├── app-shell.md
│       └── ...
│
├── 03-patterns/                 # Design patterns and recipes
│   ├── forms.md                 # Form patterns
│   ├── navigation.md           # Navigation patterns
│   ├── data-display.md         # Tables, lists, cards
│   └── feedback.md             # Toasts, alerts, loading states
│
├── 04-integration/              # Integration guides
│   ├── figma-sync.md           # Figma design-to-code workflow
│   ├── nextjs.md               # Next.js App Router integration
│   ├── tailwind.md             # Tailwind v4 configuration
│   └── mcp.md                  # MCP tool integration
│
├── 05-guides/                  # Developer guides
│   ├── getting-started.md      # Quick start guide
│   ├── contributing.md         # How to contribute components
│   ├── migration.md            # Migration guides
│   └── troubleshooting.md     # Common issues and solutions
│
└── 06-reference/               # Reference documentation
    ├── api/                    # Component API reference
    ├── tokens-reference.md     # Complete token reference
    └── figma-mapping.md        # Figma → Code mapping
```

---

## 🎯 Quick Navigation

### For Designers

- [Figma Sync Guide](./04-integration/figma-sync.md) - Design-to-code workflow
- [Design Tokens](./01-foundation/tokens.md) - Token system overview
- [Color System](./01-foundation/colors.md) - Color usage guidelines

### For Developers

- [Getting Started](./05-guides/getting-started.md) - Quick start
- [Component API Reference](./06-reference/api/) - Component props and usage
- [Next.js Integration](./04-integration/nextjs.md) - App Router setup

### For Contributors

- [Contributing Guide](./05-guides/contributing.md) - How to add components
- [Governance Rules](./GOVERNANCE.md) - Document control and standards
- [Design Patterns](./03-patterns/) - Pattern library

---

## 🔄 Document Lifecycle

1. **Draft** → Create in appropriate directory
2. **Review** → Validate against MCP tools (Tailwind, Figma, Next.js)
3. **Approval** → Design system team review
4. **Published** → Added to CHANGELOG.md
5. **Maintenance** → Regular updates per GOVERNANCE.md

---

## ✅ Validation

All documentation is validated against:

- **Tailwind Tokens MCP** - Token usage accuracy
- **Figma MCP** - Design-code sync validation
- **Next.js Docs** - Framework best practices

See [GOVERNANCE.md](./GOVERNANCE.md) for validation rules.

---

## 📝 Document Status

| Document    | Status         | Last Updated | Validated                    |
| ----------- | -------------- | ------------ | ---------------------------- |
| Foundation  | 🟢 Complete    | 2024         | ✅ Tailwind, Figma          |
| Components  | 🟡 In Progress | 2024         | ✅ Tailwind, Figma, Next.js  |
| Patterns    | 🔴 Not Started | -            | -                            |
| Integration | 🟡 In Progress | 2024         | ✅ Figma, React MCP proposal |
| Guides      | 🟡 In Progress | -            | -                            |
| Reference   | 🔴 Not Started | -            | -                            |

**Legend:**

- 🟢 Complete
- 🟡 In Progress
- 🔴 Not Started

---

**Last Updated:** 2024  
**Maintained By:** AI-BOS Design System Team  
**Version:** 1.1.0

---

## ✅ Foundation Documentation Complete

All foundation documentation is now complete and validated:

- ✅ [Philosophy](./01-foundation/philosophy.md) - Core principles
- ✅ [Tokens](./01-foundation/tokens.md) - Token system
- ✅ [Colors](./01-foundation/colors.md) - Color system
- ✅ [Typography](./01-foundation/typography.md) - Typography scale
- ✅ [Spacing](./01-foundation/spacing.md) - 4px grid system
- ✅ [Accessibility](./01-foundation/accessibility.md) - WCAG compliance

All documents validated against Tailwind MCP and Figma MCP.
