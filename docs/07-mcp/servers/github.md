# GitHub MCP Server

> **GitHub MCP server configuration and repository references**

---

## Overview

The GitHub MCP server provides access to GitHub repositories, allowing you to:

- Read repository files and code
- Search for code patterns
- Access repository metadata
- Learn from stunning open-source implementations

---

## Configuration

The GitHub MCP server is configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

**Note:** You'll need to set up a GitHub Personal Access Token with appropriate permissions.

---

## Stunning Repositories for Learning

### Icon Libraries

These repositories are excellent references for icon design and implementation:

1. **Lucide Icons** - `lucide/lucide` ⭐ 15K+
   - Clean, consistent design language
   - 1,000+ beautifully crafted icons
   - Perfect React/TypeScript implementation

2. **Phosphor Icons** - `phosphor-icons/react` ⭐ 9K+
   - 9,000+ icons in 6 weights
   - Beautiful duotone variants
   - Excellent React implementation

3. **Heroicons** - `tailwindlabs/heroicons` ⭐ 20K+
   - Industry standard (used by Tailwind)
   - Two styles: outline and solid
   - Perfect stroke consistency

4. **Radix Icons** - `radix-ui/icons` ⭐ 2K+
   - Part of Radix UI ecosystem
   - Consistent 15px grid system
   - Excellent TypeScript support

5. **Microsoft Fluent UI System Icons** - `microsoft/fluentui-system-icons` ⭐ 1.5K+
   - Microsoft's official design system
   - Professional, enterprise-grade
   - Multiple sizes and variants

### UI Component Libraries

1. **Radix UI** - `radix-ui/primitives` ⭐ 10K+
   - Unstyled, accessible components
   - Excellent React patterns
   - TypeScript-first

2. **shadcn/ui** - `shadcn-ui/ui` ⭐ 60K+
   - Copy-paste components
   - Built on Radix UI
   - Tailwind CSS

3. **Mantine** - `mantinedev/mantine` ⭐ 25K+
   - Full-featured React components
   - Excellent documentation
   - TypeScript support

4. **Chakra UI** - `chakra-ui/chakra-ui` ⭐ 35K+
   - Simple, modular components
   - Accessible by default
   - Theme system

### Design Systems

1. **Material Design** - `mui/material-ui` ⭐ 90K+
   - Google's Material Design
   - Comprehensive component library
   - Excellent documentation

2. **Ant Design** - `ant-design/ant-design` ⭐ 90K+
   - Enterprise-class UI design
   - Comprehensive components
   - Internationalization

3. **Carbon Design System** - `carbon-design-system/carbon` ⭐ 7K+
   - IBM's design system
   - Enterprise-focused
   - Accessibility-first

### React Patterns & Best Practices

1. **React Patterns** - `reactpatterns/reactpatterns` ⭐ 2K+
   - Common React patterns
   - Best practices
   - Code examples

2. **React TypeScript Cheatsheet** - `typescript-cheatsheets/react` ⭐ 45K+
   - TypeScript + React patterns
   - Comprehensive examples
   - Best practices

3. **React Hook Form** - `react-hook-form/react-hook-form` ⭐ 40K+
   - Form validation patterns
   - Performance optimization
   - TypeScript examples

### Next.js Examples

1. **Next.js Examples** - `vercel/next.js/examples` ⭐ 120K+
   - Official Next.js examples
   - Best practices
   - Real-world patterns

2. **Next.js Commerce** - `vercel/commerce` ⭐ 9K+
   - E-commerce implementation
   - Complex patterns
   - TypeScript examples

### Testing & Quality

1. **Testing Library** - `testing-library/react-testing-library` ⭐ 20K+
   - Testing best practices
   - Accessibility testing
   - Component testing patterns

2. **Vitest** - `vitest-dev/vitest` ⭐ 12K+
   - Fast unit testing
   - Vite integration
   - TypeScript support

### State Management

1. **Zustand** - `pmndrs/zustand` ⭐ 40K+
   - Lightweight state management
   - Simple API
   - TypeScript support

2. **Jotai** - `pmndrs/jotai` ⭐ 16K+
   - Atomic state management
   - React-first
   - TypeScript support

### Documentation & Tools

1. **MDX** - `mdx-js/mdx` ⭐ 15K+
   - Markdown + JSX
   - Documentation patterns
   - Component integration

2. **Storybook** - `storybookjs/storybook` ⭐ 85K+
   - Component development
   - Documentation
   - Testing

---

## Using GitHub MCP to Access Repositories

### Example: Reading Icon Implementation

```typescript
// Access Lucide Icons repository
const lucideIcon = await github.getFileContents({
  owner: "lucide",
  repo: "lucide",
  path: "packages/lucide-react/src/lucide-react.tsx",
});
```

### Example: Searching for Patterns

```typescript
// Search for icon base component patterns
const results = await github.searchCode({
  q: "icon base component react typescript",
  language: "typescript",
});
```

### Example: Learning from shadcn/ui

```typescript
// Read button component implementation
const buttonComponent = await github.getFileContents({
  owner: "shadcn-ui",
  repo: "ui",
  path: "components/ui/button.tsx",
});
```

---

## Repository Categories

### 🎨 Design & Icons

- Icon libraries (Lucide, Phosphor, Heroicons)
- Design system implementations
- SVG optimization patterns

### ⚛️ React Components

- Component library implementations
- Hook patterns
- Performance optimization

### 🚀 Next.js

- App Router patterns
- Server components
- API routes

### 🧪 Testing

- Testing patterns
- Test utilities
- E2E testing examples

### 📚 Documentation

- Documentation tools
- MDX patterns
- Storybook examples

---

## Best Practices

1. **Study Implementation Patterns**
   - Read base components
   - Understand prop patterns
   - Learn TypeScript types

2. **Extract Reusable Patterns**
   - Component structure
   - State management
   - Performance optimizations

3. **Reference Documentation**
   - Read README files
   - Study examples
   - Review type definitions

4. **Clone and Experiment**
   - Clone repositories locally
   - Run examples
   - Modify and learn

---

## Quick Reference

### Clone All Stunning Repos

```bash
# Create learning directory
mkdir ~/github-learning
cd ~/github-learning

# Icon Libraries
git clone https://github.com/lucide/lucide.git
git clone https://github.com/phosphor-icons/react.git
git clone https://github.com/tailwindlabs/heroicons.git
git clone https://github.com/radix-ui/icons.git
git clone https://github.com/microsoft/fluentui-system-icons.git

# UI Components
git clone https://github.com/radix-ui/primitives.git
git clone https://github.com/shadcn-ui/ui.git
git clone https://github.com/mantinedev/mantine.git

# Design Systems
git clone https://github.com/mui/material-ui.git
git clone https://github.com/ant-design/ant-design.git
```

---

## Status

**Status:** ✅ Configured  
**Last Updated:** 2025-01-27  
**Next Review:** TBD

---

## Related Documentation

- [MCP Integration Guide](../MCP_INTEGRATION_GUIDE.md)
- [MCP Best Practices](../MCP_BEST_PRACTICES.md)
- [Stunning Icon Repositories](../../../packages/ui/src/components/shared/primitives/icons/STUNNING_ICON_REPOS.md)
