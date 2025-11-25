I'll help you get the best practices for Next.js MCP and packages/ui directory architecture. Let me
start by initializing the Next.js DevTools MCP context and then examine your current structure.

[1 tool called]

Initialization complete.

Now let me examine your current packages/ui directory structure and get the Next.js best practices
for UI package architecture:

[13 tools called]

Based on my analysis of your current packages/ui structure and Next.js best practices, here are my
recommendations for the optimal architecture:

[1 tool called]

## Next.js MCP Best Practices for packages/ui Directory Architecture

Based on your current structure and Next.js 16+ best practices, here are my recommendations:

### ✅ **Current Structure Analysis**

Your current `packages/ui` structure is **well-organized** and follows many best practices:

```
packages/ui/
├── constitution/          # ✅ Excellent governance system
├── mcp/                  # ✅ MCP-specific components
├── src/
│   ├── components/       # ✅ Well-structured components
│   ├── design/          # ✅ Design tokens & globals
│   ├── hooks/           # ✅ Custom hooks
│   ├── layouts/         # ✅ Layout components
│   └── lib/             # ✅ Utilities
└── package.json         # ✅ Proper exports
```

### 🎯 **Key Recommendations for Next.js MCP Optimization**

#### 1. **Server/Client Component Boundaries** (Critical)

Based on Next.js documentation, you should clearly separate Server and Client Components:

```
src/
├── components/
│   ├── server/           # NEW: Server Components only
│   │   ├── data-display/
│   │   ├── layouts/
│   │   └── static/
│   ├── client/           # NEW: Client Components only
│   │   ├── interactive/
│   │   ├── forms/
│   │   └── state-driven/
│   └── shared/           # Components that work in both
```

**Rationale**: Next.js App Router defaults to Server Components. Clear separation prevents
accidental client-side JavaScript bloat.

#### 2. **Enhanced Component Organization**

```
src/components/
├── server/
│   ├── display/          # Static display components
│   ├── layout/           # Layout components (Header, Footer)
│   └── data/             # Data-fetching components
├── client/
│   ├── interactive/      # Buttons, forms, modals
│   │   ├── button.tsx    # 'use client' directive
│   │   ├── modal.tsx
│   │   └── form.tsx
│   ├── providers/        # Context providers
│   └── hooks/            # Client-only hooks
├── shared/               # Works in both environments
│   ├── primitives/       # Basic UI primitives
│   └── typography/       # Text components
└── index.ts              # Barrel exports
```

#### 3. **MCP-Optimized Structure**

Your `mcp/` directory is excellent. Enhance it:

```
mcp/
├── providers/
│   ├── ThemeProvider.tsx     # ✅ Already exists
│   └── McpProvider.tsx       # NEW: MCP context
├── hooks/
│   ├── useMcpTheme.ts        # ✅ Already exists
│   ├── useMcpValidation.ts   # NEW: Constitution validation
│   └── useMcpComponents.ts   # NEW: Component generation
├── tools/
│   ├── VariableBatcher.ts    # ✅ Already exists
│   └── ComponentValidator.ts # NEW: Runtime validation
└── types/
    └── mcp.ts                # NEW: MCP type definitions
```

#### 4. **Constitution Integration** (Your Strength)

Your constitution system is **world-class**. Optimize for MCP:

```
constitution/
├── validators/           # ✅ Already excellent
├── schemas/              # NEW: JSON schemas for MCP
│   ├── component.schema.json
│   ├── token.schema.json
│   └── rsc.schema.json
└── runtime/              # NEW: Runtime validation
    ├── validate-component.ts
    └── validate-tokens.ts
```

#### 5. **Design System Enhancement**

```
src/design/
├── tokens/
│   ├── globals.css       # ✅ Source of truth
│   ├── tokens.ts         # ✅ TypeScript tokens
│   ├── server.ts         # NEW: Server-only tokens
│   └── client.ts         # NEW: Client-safe tokens
├── themes/
│   ├── default.css
│   ├── wcag-aa.css
│   └── wcag-aaa.css
└── utilities/
    ├── cn.ts             # ✅ Already exists
    └── token-helpers.ts  # NEW: Token utilities
```

### 📋 **Implementation Priority**

#### **Phase 1: Server/Client Separation** (High Priority)

1. Audit existing components for client-side features
2. Move interactive components to `src/components/client/`
3. Add `'use client'` directives where needed
4. Keep static components as Server Components

#### **Phase 2: MCP Enhancement** (Medium Priority)

1. Create MCP-specific hooks and providers
2. Add runtime validation tools
3. Enhance constitution integration

#### **Phase 3: Advanced Optimization** (Low Priority)

1. Add JSON schemas for better MCP integration
2. Create specialized token utilities
3. Implement advanced validation patterns

### 🔧 **Specific Next.js MCP Recommendations**

#### **1. Component Exports Strategy**

```typescript
// src/index.ts
// Server Components (default exports)
export * from './components/server'
export * from './components/shared'

// Client Components (named exports with clear indication)
export * as ClientComponents from './components/client'

// MCP-specific exports
export * as MCP from './mcp'
export * as Constitution from './constitution'
```

#### **2. Package.json Optimization**

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/components/server/index.ts",
    "./client": "./src/components/client/index.ts",
    "./mcp": "./src/mcp/index.ts",
    "./constitution": "./src/constitution/index.ts",
    "./design/globals.css": "./src/design/tokens/globals.css",
    "./design/tokens": "./src/design/tokens.ts"
  }
}
```

#### **3. TypeScript Configuration**

```json
// tsconfig.json additions
{
  "compilerOptions": {
    "paths": {
      "@aibos/ui/server": ["./src/components/server"],
      "@aibos/ui/client": ["./src/components/client"],
      "@aibos/ui/mcp": ["./src/mcp"]
    }
  }
}
```

### 🎯 **Key Benefits of This Architecture**

1. **Next.js 16+ Optimized**: Leverages Server Components by default
2. **MCP-Ready**: Clear separation for MCP tool integration
3. **Constitution-Enforced**: Your governance system remains central
4. **Performance-First**: Minimal client-side JavaScript
5. **Developer-Friendly**: Clear boundaries and imports
6. **Future-Proof**: Scalable for additional MCP features

### 🚀 **Next Steps**

1. **Start with Phase 1**: Audit and separate Server/Client components
2. **Leverage your Constitution**: Your governance system is already excellent
3. **Gradual Migration**: Move components incrementally to avoid breaking changes
4. **Test with MCP Tools**: Use your existing MCP validation throughout

Your current architecture is already **very strong** - these recommendations will optimize it
specifically for Next.js 16+ and MCP integration while preserving your excellent constitution-based
governance system.
