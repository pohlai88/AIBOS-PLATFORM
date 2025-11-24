# AIBOS Platform Documentation

> **High-level platform documentation and cross-cutting concerns**

This directory contains platform-level documentation. For detailed UI and design system documentation, see [`packages/ui/ui-docs/`](../../packages/ui/ui-docs/).

---

## 📚 Documentation Structure

### Platform Documentation (Root `docs/`)

- **[Design System Overview](./design-system-guide.md)** - High-level design system overview and links to detailed docs
- **[Next.js Best Practices](./NEXTJS_BEST_PRACTICES.md)** - Comprehensive Next.js 16 best practices guide
- **[Next.js Validation Report](./NEXTJS_VALIDATION_REPORT.md)** - Next.js configuration validation
- **[Documentation Structure](./DOCUMENTATION_STRUCTURE.md)** - Documentation organization guide
- **[Restructuring Summary](./RESTRUCTURING_SUMMARY.md)** - Documentation restructuring summary

### Package-Specific Documentation

Each package maintains its own documentation:

- **UI Package:** [`packages/ui/ui-docs/`](../../packages/ui/ui-docs/) - Complete UI component and design system documentation
- **Utils Package:** [`packages/utils/README.md`](../../packages/utils/README.md) - Utility functions documentation
- **Types Package:** [`packages/types/README.md`](../../packages/types/README.md) - TypeScript types documentation

### Application Documentation

- **Web App:** [`apps/web/README.md`](../../apps/web/README.md) - Next.js application documentation

---

## 🎯 Documentation Principles

Following Next.js monorepo best practices:

1. **Co-location** - Documentation lives with the code it documents
2. **Single Source of Truth** - Each topic has one authoritative location
3. **High-level at Root** - Root docs provide overviews and links to detailed docs
4. **Package Autonomy** - Each package manages its own documentation

---

## 🔍 Quick Navigation

### For Designers

- [UI Design System](../../packages/ui/ui-docs/) - Complete design system documentation
- [Figma Integration](../../packages/ui/ui-docs/04-integration/figma-sync.md) - Design-to-code workflow

### For Developers

- [Getting Started](../../packages/ui/ui-docs/05-guides/getting-started.md) - Quick start guide
- [Component Documentation](../../packages/ui/ui-docs/02-components/) - Component API and usage
- [Integration Guides](../../packages/ui/ui-docs/04-integration/) - Next.js, Figma, and MCP integration

### For Contributors

- [Documentation Structure Guide](./DOCUMENTATION_STRUCTURE.md) - How to organize documentation
- [Governance Rules](../../packages/ui/ui-docs/GOVERNANCE.md) - Document control standards

---

## 📝 Documentation Standards

All documentation follows these standards:

- **Markdown format** - All docs use Markdown
- **Version controlled** - All docs in Git
- **Validated** - UI docs validated against MCP tools (Tailwind, Figma, Next.js)
- **Maintained** - Regular reviews and updates

See [`packages/ui/ui-docs/GOVERNANCE.md`](../../packages/ui/ui-docs/GOVERNANCE.md) for detailed governance rules.

---

**Last Updated:** 2024  
**Maintained By:** AIBOS Platform Team
