# 🧾 GRCD — Frontend (UI/UX Development Platform) — Template v4 (MCP‑Governed Edition)

**Version:** 4.0.0  
**Status:** Active (MCP‑Governed Template & Reference)  
**Last Updated:** 2025-01-27  
**Owner:** Frontend Team, UI/UX Team, Design System Team, MCP Governance Team

> **Purpose of this GRCD**
>
> This GRCD (Governance, Risk, Compliance & Design) document is the **single source of truth** for all frontend development in the AI-BOS Nexus platform. It establishes the **complete frontend architecture**, **MCP governance**, **ERP context**, and **anti-drift mechanisms** to ensure consistent, production-ready UI/UX development.
>
> **Key Anti‑Drift Mechanisms:**
>
> - Theme-first architecture enforcement (Section 3.1 - CRITICAL)
> - MCP tool integration and validation (Section 3.2 - CRITICAL)
> - Component generation and validation pipeline (Section 3.3 - CRITICAL)
> - Directory structure enforcement (Section 4)
> - Dependency compatibility matrix (Section 5)
> - Master Control Prompt (MCP) governance (Section 6)
> - ERP context and requirements (Section 7)
> - Contracts & schemas as SSOT (Section 8)

---

## 1. Purpose & Identity

**Component Name:** `frontend` (UI/UX Development Platform)

**Domain:** `Frontend UI/UX` (Complete Frontend Development Stack with MCP Governance)

### 1.1 Purpose

**Purpose Statement:**

> The Frontend platform is the **user experience brain** of AI-BOS Nexus, serving as the constitutional authority that ensures all UI components, design tokens, themes, and user interactions operate within defined boundaries. It enforces design system contracts, accessibility compliance (WCAG 2.2 AA/AAA), multi-tenant customization, and ERP-specific requirements through the Model Context Protocol (MCP), ensuring zero drift from design intent, organizational standards, and user experience goals. The Frontend platform is **theme-first** with CSS variables as the source of truth, **MCP-governed** with real-time validation, and **ERP-aware** with business context integration.

**Philosophical Foundation:**

The Frontend platform embodies the principle that **user experience should be governed, not ad-hoc**. By establishing a theme-first architecture with MCP governance and ERP context, we create a system where:

1. **CSS Variables are SSOT:** `globals.css` defines all design tokens as CSS custom properties.
2. **Theme Layer Controls Tokens:** `ThemeProvider` manages CSS variables based on tenant/WCAG/safe mode.
3. **Components Consume Theme:** Components use Tailwind classes that reference CSS variables (never direct token imports).
4. **MCP Validates Everything:** Real-time validation prevents drift and ensures compliance.
5. **ERP Context is Integrated:** Business requirements inform UI/UX decisions.
6. **Drift is Constrained:** Contract validation prevents deviations from specifications.
7. **Audit is Automatic:** Every component and design decision generates immutable audit trails.
8. **Evolution is Controlled:** Versioning and migration paths ensure safe evolution.

**ERP Context Integration:**

The Frontend platform is designed to support enterprise ERP requirements:

- **AI-Powered Predictive Analytics:** Dashboard components with real-time insights
- **Workflow Automation:** Visual workflow builders and automation UI
- **Mobile-First Experience:** Responsive, offline-capable, touch-optimized components
- **Contextual AI Assistant:** Conversational UI components and AI copilot interfaces
- **Universal Integration Hub:** Integration management UI and connector interfaces
- **Real-Time Business Intelligence:** Custom dashboard builders and data visualization
- **Multi-Tenant Architecture:** Tenant-aware theming and customization
- **Accessibility Compliance:** WCAG AA/AAA themes for enterprise compliance
- **Performance Optimization:** Fast, responsive UI for large datasets
- **Security & Compliance:** Secure UI patterns and audit trail visualization

### 1.2 Identity

- **Role:** `UI/UX Authority & MCP Governance Enforcer` – The Frontend platform serves as the central design system, theme manager, component library, and governance enforcer for all frontend development, with MCP as the universal protocol for design token validation, component generation, and ERP context integration.

- **Scope:**
  - All design tokens (colors, spacing, typography, shadows, radii).
  - All UI components (primitives, compositions, functional components, layouts).
  - Theme management (tenant customization, WCAG compliance, safe mode).
  - RSC boundary enforcement (Server/Client/Shared components).
  - MCP validation and governance (component generation, validation pipeline, theme management).
  - Accessibility compliance (WCAG 2.2 AA/AAA).
  - ERP-specific UI components (dashboards, workflows, data tables, charts, forms).
  - Mobile-first responsive design.
  - Performance optimization (bundle size, render performance, code splitting).

- **Boundaries:**
  - Does **NOT** execute business logic (BFF handles business logic).
  - Does **NOT** manage application state (state management libraries handle this).
  - Does **NOT** handle data fetching (Server Components and BFF handle this).
  - Does **NOT** bypass theme layer for styling.
  - Does **NOT** allow direct token imports in components.
  - Does **NOT** bypass MCP validation.

- **Non‑Responsibility:**
  - `MUST NOT` store application state (use state management libraries).
  - `MUST NOT` execute business logic (communicate via BFF).
  - `MUST NOT` fetch data directly (use Server Components or BFF).
  - `MUST NOT` import tokens directly in components.
  - `MUST NOT` bypass ThemeProvider for styling.
  - `MUST NOT` bypass MCP validation pipeline.

### 1.3 Non‑Negotiables (Constitutional Principles)

> These principles are **non-negotiable** and form the constitutional foundation of the Frontend platform. They are testable and enforceable through automated checks.

**Constitutional Principles:**

- `MUST NOT` import tokens directly from `tokens.ts` in components.
- `MUST NOT` bypass ThemeProvider for styling.
- `MUST NOT` use hardcoded colors, spacing, or design values.
- `MUST NOT` violate RSC boundaries (Server/Client/Shared).
- `MUST` use CSS variables via Tailwind classes (theme-controlled).
- `MUST` ensure ThemeProvider wraps application root.
- `MUST` validate all component token usage via MCP.
- `MUST` enforce WCAG 2.2 AA/AAA compliance.
- `MUST` support tenant customization through theme layer.
- `MUST` support safe mode through theme layer.
- `MUST` use MCP tools for component generation and validation.
- `MUST` integrate ERP context into UI/UX decisions.

**MCP Governance Principles:**

- `MUST` validate all component token usage against theme layer.
- `MUST` enforce theme-first architecture (CSS variables → ThemeProvider → Components).
- `MUST` audit all token violations (direct imports, hardcoded values).
- `MUST` require MCP validation for all new components.
- `MUST` use MCP tools for component generation (`useMcpComponents`).
- `MUST` use MCP validation pipeline (`useMcpValidation`, `ValidationPipeline`).
- `MUST` use MCP theme management (`useMcpTheme`, `McpThemeProvider`).
- `MUST` support MCP resource discovery and tool invocation.

**ERP Context Principles:**

- `MUST` design for enterprise-scale data (large tables, complex forms).
- `MUST` support multi-tenant customization and branding.
- `MUST` ensure accessibility compliance for enterprise customers.
- `MUST` optimize for performance (fast load times, smooth interactions).
- `MUST` support mobile-first responsive design.
- `MUST` integrate AI/ML features (predictive analytics, AI assistant).
- `MUST` support workflow automation UI patterns.
- `MUST` provide real-time data visualization components.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID   | Requirement                                                                 | Priority (MUST/SHOULD/MAY) | Status (✅/⚠️/❌/⚪) | Notes                                     |
| ---- | --------------------------------------------------------------------------- | -------------------------- | -------------------- | ----------------------------------------- |
| F-1  | Frontend MUST provide CSS variables in globals.css as SSOT                  | MUST                       | ✅                   | globals.css defines all tokens            |
| F-2  | Frontend MUST provide ThemeProvider for theme management                    | MUST                       | ✅                   | McpThemeProvider wraps app                |
| F-3  | Components MUST use Tailwind classes referencing CSS variables              | MUST                       | ✅                   | **COMPLETE: All 37 components migrated**  |
| F-4  | Components MUST NOT import tokens directly from tokens.ts                   | MUST                       | ✅                   | **COMPLETE: No direct imports remaining** |
| F-5  | ThemeProvider MUST control CSS variables based on tenant/WCAG/safe          | MUST                       | ✅                   | ThemeProvider applies CSS variables       |
| F-6  | Frontend MUST support tenant customization via theme layer                  | MUST                       | ✅                   | **COMPLETE: Theme-first architecture**    |
| F-7  | Frontend MUST support WCAG AA/AAA themes via theme layer                    | MUST                       | ✅                   | **COMPLETE: WCAG themes functional**      |
| F-8  | Frontend MUST support safe mode via theme layer                             | MUST                       | ✅                   | **COMPLETE: Safe mode functional**        |
| F-9  | Frontend MUST validate component token usage via MCP                        | MUST                       | ✅                   | MCP validation tools implemented          |
| F-10 | Frontend MUST enforce RSC boundaries (Server/Client/Shared)                 | MUST                       | ✅                   | Clear component separation                |
| F-11 | Frontend MUST use MCP tools for component generation                        | MUST                       | ✅                   | `useMcpComponents` hook available         |
| F-12 | Frontend MUST use MCP validation pipeline for all components                | MUST                       | ✅                   | `useMcpValidation`, `ValidationPipeline`  |
| F-13 | Frontend MUST use MCP theme management hooks                                | MUST                       | ✅                   | `useMcpTheme` hook available              |
| F-14 | Frontend MUST support ERP-specific UI components                            | MUST                       | ⚪                   | Dashboards, workflows, data tables        |
| F-15 | Frontend MUST support mobile-first responsive design                        | MUST                       | ✅                   | Responsive utilities and breakpoints      |
| F-16 | Frontend MUST support AI-powered features (predictive analytics, assistant) | MUST                       | ⚪                   | AI copilot UI, analytics dashboards       |
| F-17 | Frontend MUST support workflow automation UI                                | MUST                       | ⚪                   | Visual workflow builder, automation UI    |
| F-18 | Frontend MUST support real-time data visualization                          | MUST                       | ⚪                   | Charts, graphs, real-time dashboards      |
| F-19 | Frontend SHOULD provide TypeScript token types                              | SHOULD                     | ✅                   | tokens.ts provides types                  |
| F-20 | Frontend SHOULD provide theme hooks for dynamic values                      | SHOULD                     | ✅                   | useThemeTokens, useMcpTheme               |
| F-21 | Frontend MAY provide token utilities for MCP validation                     | MAY                        | ✅                   | token-helpers.ts                          |
| F-22 | Frontend MAY support Figma integration for design-to-code workflow          | MAY                        | ✅                   | Figma MCP integration available           |

> **Migration Status:**
>
> - ✅ **All 37 components migrated (100%)**
> - ✅ **Shared Primitives:** 31/31 migrated
> - ✅ **Typography Components:** 2/2 migrated
> - ✅ **Client Compositions:** 4/4 migrated
> - ✅ **Theme-first architecture:** Fully functional
> - ✅ **MCP tools:** 100% operational
> - ⚪ **ERP-specific components:** Pending implementation
> - ⚪ **AI-powered features:** Pending implementation

### 2.2 Non‑Functional Requirements

| ID    | Requirement                | Target                                     | Measurement Source                 | Status |
| ----- | -------------------------- | ------------------------------------------ | ---------------------------------- | ------ |
| NF-1  | Bundle size                | <500KB gzipped for core components         | Bundle analyzer                    | ⚪     |
| NF-2  | Theme switching latency    | <50ms for theme change                     | ThemeProvider performance metrics  | ✅     |
| NF-3  | Component render time      | <16ms per component (60fps)                | React DevTools Profiler            | ⚪     |
| NF-4  | Accessibility score        | WCAG 2.2 AA/AAA compliant                  | axe-core, Lighthouse               | ✅     |
| NF-5  | Type safety                | 100% TypeScript strict mode                | TypeScript compiler                | ✅     |
| NF-6  | Token validation           | 100% components pass MCP validation        | MCP validation pipeline            | ✅     |
| NF-7  | Theme coverage             | 100% components respect theme layer        | MCP validation (no direct imports) | ✅     |
| NF-8  | RSC boundary compliance    | 100% components respect RSC boundaries     | RSC validator                      | ✅     |
| NF-9  | MCP validation latency     | <100ms per component validation            | MCP validation metrics             | ✅     |
| NF-10 | Component generation time  | <5s for simple components                  | MCP generation metrics             | ✅     |
| NF-11 | Mobile performance         | <3s initial load, <1s interaction response | Lighthouse mobile audit            | ⚪     |
| NF-12 | ERP data table performance | <100ms render for 1000 rows                | Performance profiling              | ⚪     |

### 2.3 Compliance Requirements

| ID  | Requirement                                                               | Standard(s)                | Evidence (what proves it)                | Status |
| --- | ------------------------------------------------------------------------- | -------------------------- | ---------------------------------------- | ------ |
| C-1 | Frontend MUST enforce WCAG 2.2 AA/AAA compliance                          | WCAG 2.2, Section 508, ADA | Accessibility audit reports, axe-core    | ✅     |
| C-2 | Frontend MUST support multi-tenant isolation                              | SOC2, GDPR, ISO 27001      | Tenant isolation tests, theme validation | ✅     |
| C-3 | Frontend MUST support data classification (PII, PHI, financial)           | GDPR, HIPAA, ISO 42001     | Component data handling validation       | ⚪     |
| C-4 | Frontend MUST support backward compatibility with SemVer enforcement      | API Governance             | Version validation tests                 | ✅     |
| C-5 | Frontend MUST support audit trail queryability                            | SOC2, ISO 27001            | Audit API endpoint, component metadata   | ⚪     |
| C-6 | Frontend MUST align with legal-first priority (law > industry > internal) | EU AI Act, ISO 42001       | Policy pack validation                   | ⚪     |
| C-7 | Frontend MUST enforce MCP manifest compliance                             | ISO 42001, AI Governance   | MCP manifest validation logs             | ✅     |
| C-8 | Frontend MUST support human-in-the-loop for critical AI decisions         | EU AI Act, ISO 42001       | Human approval UI patterns               | ⚪     |

---

## 3. Architecture & Design Patterns

### 3.1 Theme-First Architecture (CRITICAL)

> **THIS IS THE MOST CRITICAL SECTION** - Establishes correct theme-first architecture.

**Architecture Flow:**

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: globals.css (CSS Variables SSOT)              │
│  ─────────────────────────────────────────────────────  │
│  Defines: All design tokens as CSS custom properties    │
│  Governance: CSS variable naming, theme overrides       │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: ThemeProvider (Theme Management Layer)         │
│  ─────────────────────────────────────────────────────  │
│  Controls: CSS variables via DOM attributes             │
│  Governance: Theme-first architecture, no direct imports│
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: Components (Component Consumer Layer)         │
│  ─────────────────────────────────────────────────────  │
│  Consumes: Design tokens via Tailwind classes           │
│  Governance: No direct token imports, RSC boundaries   │
└─────────────────────────────────────────────────────────┘
```

**Correct Pattern (Tailwind Classes):**

```tsx
// ✅ CORRECT - Component uses Tailwind classes
export const Button = ({ variant = "default" }) => {
  return (
    <button
      className={cn(
        "bg-bg-elevated", // ✅ References --color-bg-elevated (theme-controlled)
        "text-fg", // ✅ References --color-fg (theme-controlled)
        "px-4 py-2", // ✅ Static spacing (theme-independent)
        "rounded-lg", // ✅ References --radius-lg (theme-controlled)
        "shadow-sm" // ✅ References --shadow-sm (theme-controlled)
      )}
    >
      Click me
    </button>
  );
};
```

**Incorrect Pattern (Direct Token Import):**

```tsx
// ❌ WRONG - Direct token import bypasses theme layer
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
} from "../../../design/tokens/tokens";

export const Button = ({ variant = "default" }) => {
  return (
    <button
      className={cn(
        colorTokens.bgElevated, // ❌ Bypasses ThemeProvider
        colorTokens.text,
        spacingTokens.md,
        radiusTokens.lg
      )}
    >
      Click me
    </button>
  );
};
```

**Theme Hierarchy:**

1. **Safe Mode** (highest priority) - Disables tenant branding, enforces WCAG
2. **WCAG AAA** - Maximum accessibility compliance
3. **WCAG AA** - Standard accessibility compliance
4. **Dark Mode** - Dark theme variant
5. **Tenant Customization** - Tenant-specific branding (Aesthetic theme only)
6. **Base Theme** (lowest priority) - Default theme

### 3.2 MCP Governance Architecture

**MCP Tools Integration:**

```text
┌─────────────────────────────────────────────────────────┐
│                 MCP GOVERNANCE LAYER                   │
├─────────────────────────────────────────────────────────┤
│  Component Generation  │  Validation Pipeline        │
│  Theme Management       │  Token Validation            │
│  RSC Boundary Validation│  Accessibility Validation    │
│  Constitution Enforcement│  ERP Context Integration   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND CORE LAYER                   │
├─────────────────────────────────────────────────────────┤
│  Components  │  ThemeProvider  │  Design Tokens  │ MCP │
└─────────────────────────────────────────────────────────┘
```

**MCP Tools Available:**

1. **Component Generation:**
   - `useMcpComponents` - AI-powered component generation
   - Supports 12 component types (primitive, semantic, composition, etc.)
   - Figma integration for design-to-code workflow
   - Automatic test, story, and documentation generation

2. **Validation Pipeline:**
   - `useMcpValidation` - Real-time component validation
   - `ValidationPipeline` - Multi-stage validation orchestration
   - `ComponentValidator` - Component code validation
   - Validates: RSC boundaries, token usage, accessibility, security, performance

3. **Theme Management:**
   - `useMcpTheme` - Theme token access and switching
   - `McpThemeProvider` - Theme context provision
   - Supports: tenant customization, WCAG themes, safe mode, dark mode

4. **Token Management:**
   - `tokenHelpers` - Token validation and utilities
   - Token existence checking, value retrieval, naming validation

**MCP Validation Flow:**

```
Component Code
    ↓
MCP Validation Pipeline
    ├── Token Validation (no direct imports)
    ├── RSC Boundary Validation (Server/Client/Shared)
    ├── Accessibility Validation (WCAG AA/AAA)
    ├── Motion Validation (reduced motion support)
    ├── Security Validation (unsafe patterns)
    ├── Performance Validation (code size, complexity)
    └── Constitution Validation (rule enforcement)
    ↓
Validation Report
    ├── isValid: boolean
    ├── violations: Array
    ├── warnings: string[]
    ├── suggestions: Array
    ├── score: 0-100
    └── governance: isAllowed, blockRender, etc.
```

### 3.3 Component Architecture

**Component Categories:**

1. **Primitives** (React-first, token-first, Radix-free)
   - Basic building blocks (Button, Input, Card, Badge)
   - Server Component compatible (unless interactive)
   - Simple props interface
   - Token-based styling only

2. **Compositions** (Radix-based, interactive)
   - Accessibility-critical interactive components
   - Built on Radix UI primitives (Dialog, Tooltip, Select)
   - Client Components (`"use client"`)
   - Complex keyboard navigation and focus management

3. **Functional Components** (Data-driven, non-Radix)
   - Data tables (TanStack Table)
   - Data visualizations (Recharts/Visx)
   - Workflow components (Kanban, Timeline)
   - Graphs and networks (React Flow)
   - Editors (TipTap/Lexical)

**RSC Boundary Enforcement:**

- **Server Components** (default): No `"use client"`, async allowed, no hooks
- **Client Components**: Require `"use client"`, hooks allowed, browser APIs allowed
- **Shared Components**: Environment agnostic, no `"use client"`, no hooks, event handlers as props

### 3.4 ERP Context Integration

**ERP-Specific UI Patterns:**

1. **Data Tables:**
   - Large dataset handling (virtualization)
   - Sorting, filtering, pagination
   - Row selection and bulk actions
   - Export functionality
   - Real-time updates

2. **Dashboards:**
   - Customizable widget layouts
   - Real-time data visualization
   - KPI cards and metrics
   - Predictive analytics displays
   - Drill-down navigation

3. **Forms:**
   - Complex multi-step forms
   - Field validation and error handling
   - Conditional field display
   - File upload and attachment
   - Auto-save functionality

4. **Workflows:**
   - Visual workflow builder
   - Approval chains
   - Task assignment and tracking
   - Status indicators
   - Timeline visualization

5. **AI Features:**
   - Conversational AI assistant UI
   - Predictive analytics displays
   - Natural language query interface
   - Contextual help and suggestions
   - Automated insights and recommendations

---

## 4. Directory & File Layout (Anti‑Drift for Vibe Coding)

> **CRITICAL SECTION FOR AI AGENTS**
>
> This section is critical for LLM agents. It tells them **where to write** and **how to keep structure consistent**. Without this, AI agents will create files in the wrong locations, breaking the architecture.

### 4.1 Canonical Directory Tree

```text
/AIBOS-PLATFORM/                         # Repository root
  ├── packages/
  │   └── ui/                            # Frontend UI package
  │       ├── src/
  │       │   ├── components/            # Component library
  │       │   │   ├── shared/           # Environment-agnostic components
  │       │   │   │   ├── primitives/   # Basic building blocks
  │       │   │   │   └── typography/   # Text components
  │       │   │   ├── client/           # Client Components only
  │       │   │   │   ├── compositions/ # Radix-based components
  │       │   │   │   └── functional/   # Data-driven components
  │       │   │   └── server/           # Server Components only
  │       │   ├── design/               # Design System
  │       │   │   ├── tokens/           # Token utilities
  │       │   │   │   ├── server.ts     # Server-safe tokens
  │       │   │   │   ├── client.ts     # Client-safe tokens
  │       │   │   │   └── tokens.ts    # Token definitions (MCP validation only)
  │       │   │   ├── utilities/        # Design utilities
  │       │   │   │   └── token-helpers.ts
  │       │   │   └── globals.css       # Source of truth for all tokens
  │       │   ├── hooks/                # Custom hooks
  │       │   ├── layouts/              # Layout components
  │       │   └── lib/                  # Utilities
  │       ├── mcp/                       # MCP Integration
  │       │   ├── hooks/                 # MCP hooks
  │       │   │   ├── useMcpComponents.ts
  │       │   │   ├── useMcpValidation.ts
  │       │   │   └── useMcpTheme.ts
  │       │   ├── tools/                 # MCP tools
  │       │   │   ├── ValidationPipeline.ts
  │       │   │   └── ComponentValidator.ts
  │       │   ├── providers/             # MCP providers
  │       │   │   ├── McpProvider.tsx
  │       │   │   └── ThemeProvider.tsx
  │       │   └── *.mcp.json             # MCP seed files
  │       ├── constitution/              # Constitution rules
  │       │   ├── components.yml
  │       │   └── rsc.yml
  │       ├── tests/                     # Test files
  │       │   ├── unit/
  │       │   ├── integration/
  │       │   └── conformance/
  │       ├── GRCD-FRONTEND.md           # This document
  │       ├── GRCD-UI.md                 # UI package GRCD
  │       ├── GRCD-COMPONENTS.md         # Components GRCD
  │       └── package.json
  ├── apps/
  │   └── web/                           # Next.js application
  │       ├── app/                       # App Router
  │       │   ├── layout.tsx
  │       │   ├── page.tsx
  │       │   └── (routes)/              # Route groups
  │       └── next.config.ts
  └── docs/                              # Documentation
      └── 01-foundation/
          └── ui-system/                 # UI system documentation
```

### 4.2 Directory Norms & Enforcement

- **Requirement:** Frontend MUST follow this directory layout.
- **Validator:** `dir-lint` tool at `scripts/dir-lint.ts` (to be implemented).
- **Conformance Test:** `T-DIR-1`: Invalid directory structure MUST fail CI.

**AI Agent Rules:**

1. Check this GRCD section for canonical location.
2. Create files ONLY in allowed directories (see Section 4.1).
3. If a directory doesn't exist, create it following the tree structure.
4. Never create files in the repo root or ad‑hoc locations.
5. Use kebab‑case naming conventions.
6. MCP‑related files MUST go in `packages/ui/mcp/` subdirectories.
7. Components MUST go in appropriate subdirectories (`shared/`, `client/`, `server/`).

### 4.3 File Naming Conventions

- **TypeScript files:** `kebab-case.ts` (e.g., `button.tsx`, `theme-provider.tsx`).
- **Test files:** `*.test.ts` or `*.spec.ts` (e.g., `button.test.tsx`).
- **Schema files:** `*.schema.ts` (e.g., `component.schema.ts`).
- **Type files:** `*.types.ts` (e.g., `button.types.ts`).
- **Config files:** `*.config.ts` (e.g., `tailwind.config.ts`).
- **MCP files:** `mcp-*.ts` or `*.mcp.ts` (e.g., `mcp-provider.tsx`).
- **Component files:** `kebab-case.tsx` (e.g., `data-table.tsx`, `ai-assistant.tsx`).

---

## 5. Dependencies & Compatibility Matrix

> **CRITICAL SECTION FOR ANTI‑DRIFT**
>
> This section ensures dependency compatibility and prevents version drift.

### 5.1 Dependency Policy

- **Lockfile Format:** `pnpm-lock.yaml`.
- **Source of Truth:** `/packages/ui/package.json`, `/pnpm-lock.yaml` (root level).
- **Update Policy:** Dependencies updated via PR with compatibility matrix verification. Breaking changes require GRCD update and compatibility matrix review. All updates must pass CI dependency validation.
- **Version Pinning:** Exact versions in lockfile; semantic ranges (e.g., `^4.x`, `^3.x`) in `package.json`.

### 5.2 Compatibility Matrix

| Library                  | Allowed Version Range | Tested With           | Status | Notes                           | Blocked Versions                 |
| ------------------------ | --------------------- | --------------------- | ------ | ------------------------------- | -------------------------------- |
| `react`                  | `^18.x`               | Next.js 16            | ✅     | React 18 required for RSC       | `^19.x` (not tested)             |
| `next`                   | `^16.x`               | React 18              | ✅     | Next.js 16 for RSC support      | `^15.x` (no RSC MCP)             |
| `typescript`             | `^5.x`                | All packages          | ✅     | TypeScript strict mode          | `^4.x` (deprecated)              |
| `tailwindcss`            | `^4.x`                | PostCSS 8+            | ✅     | Tailwind v4 for CSS variables   | `^3.x` (no CSS variable support) |
| `@radix-ui/react-*`      | `^1.x`                | React 18              | ✅     | Radix UI for compositions       | `^2.x` (not tested)              |
| `@tanstack/react-table`  | `^8.x`                | React 18              | ✅     | TanStack Table for data tables  | `^9.x` (not tested)              |
| `recharts`               | `^2.x`                | React 18              | ✅     | Recharts for data visualization | `^3.x` (not tested)              |
| `zod`                    | `^3.x`                | All packages          | ✅     | Schema validation               | `^4.x` (incompatible)            |
| `vitest`                 | `^2.x`                | React Testing Library | ✅     | Test framework                  | `^1.x` (deprecated)              |
| `@testing-library/react` | `^16.x`               | Vitest 2              | ✅     | React testing utilities         | `^15.x` (deprecated)             |

### 5.3 Dependency Groups

**Core Runtime:**

- `react`, `react-dom` – React framework.
- `next` – Next.js framework (RSC support).
- `typescript` – Type checking.

**Design System:**

- `tailwindcss` – CSS framework (v4 for CSS variables).
- `@radix-ui/react-*` – Radix UI primitives (compositions only).
- `clsx`, `tailwind-merge` – Class name utilities.

**Data Visualization:**

- `@tanstack/react-table` – Data tables.
- `recharts` – Charts and graphs.
- `react-flow` – Graph visualization.

**MCP Support:**

- MCP tools are built-in (no external MCP SDK required).
- JSON-RPC handling for MCP protocol (if needed).

**Testing:**

- `vitest` – Test framework.
- `@testing-library/react` – React testing utilities.
- `@testing-library/jest-dom` – DOM matchers.
- `jest-axe` – Accessibility testing.

### 5.4 Dependency Normative Requirements

- `F-DEP-1`: All dependencies MUST align with `package.json` and `pnpm-lock.yaml`.
- `F-DEP-2`: Incompatible dependency versions MUST block frontend build and CI.
- `F-DEP-3`: LLM agents MUST NOT introduce new dependencies without explicit manifest updates and compatibility matrix verification.
- `F-DEP-4`: Dependency updates MUST be tested against compatibility matrix before merge.
- `F-DEP-5`: All new dependencies MUST be added to the compatibility matrix (Section 5.2) with tested version ranges.
- `F-DEP-6`: MCP‑related dependencies MUST be compatible with MCP protocol specification version.

---

## 6. Master Control Prompt (MCP) Profile

> **CRITICAL SECTION FOR HUMAN‑AI GOVERNANCE**
>
> This section defines the MCP profile for frontend development.

### 6.1 MCP Location

- **File:** `/packages/ui/mcp/ui.mcp.json` (Master MCP)
- **Additional MCPs:**
  - `/packages/ui/mcp/ui-components.mcp.json` - Components layer MCP
  - `/packages/ui/mcp/ui-token-theme.mcp.json` - Theme management MCP
  - `/packages/ui/mcp/ui-globals-css.mcp.json` - CSS variables MCP
  - `/packages/ui/mcp/ui-testing.mcp.json` - Testing infrastructure MCP
- **Hash Recorded In:** Audit log under `mcpHash` field
- **Version:** `2.0.0`
- **Last Updated:** `2025-01-27`

### 6.2 MCP Schema (Template‑Compatible)

```json
{
  "component": "frontend",
  "version": "2.0.0",
  "intent": "Generate frontend code following GRCD-FRONTEND.md specifications, MCP governance, and ERP context integration",
  "constraints": [
    "MUST follow GRCD structure from packages/ui/GRCD-FRONTEND.md",
    "MUST save files only under allowed directories (see GRCD Section 4)",
    "MUST respect dependency matrix (see GRCD Section 5)",
    "MUST use TypeScript with strict mode",
    "MUST use kebab-case for file names",
    "MUST NOT create files in root directory",
    "MUST NOT introduce dependencies not in compatibility matrix",
    "MUST NOT import tokens directly in components",
    "MUST NOT bypass ThemeProvider for styling",
    "MUST enforce theme-first architecture",
    "MUST use MCP tools for component generation and validation",
    "MUST integrate ERP context into UI/UX decisions",
    "MUST enforce WCAG 2.2 AA/AAA compliance",
    "MUST respect RSC boundaries (Server/Client/Shared)"
  ],
  "input_sources": [
    "GRCD-FRONTEND.md (this document)",
    "GRCD-UI.md",
    "GRCD-COMPONENTS.md",
    "MCP_TOOLS_VALIDATION_REPORT.md",
    "ERP_IDEAS_AND_PAIN_POINTS.md",
    "codebase (packages/ui/)",
    "existing patterns in packages/ui/",
    "MCP specification (modelcontextprotocol.io)"
  ],
  "output_targets": {
    "code": "packages/ui/src/",
    "components": "packages/ui/src/components/",
    "mcp": "packages/ui/mcp/",
    "tests": "packages/ui/tests/",
    "docs": "docs/01-foundation/ui-system/"
  },
  "style": {
    "normative_language": true,
    "anti_drift": true,
    "type_safety": "strict",
    "error_handling": "typed_errors",
    "logging": "structured",
    "mcp_governance": true,
    "theme_first": true,
    "erp_context": true
  },
  "validation": {
    "pre_commit": [
      "TypeScript type check",
      "Directory structure validation",
      "Dependency compatibility check",
      "GRCD conformance check",
      "MCP manifest validation",
      "Token usage validation",
      "RSC boundary validation",
      "Accessibility validation"
    ]
  },
  "mcp_governance": {
    "component_generation": "useMcpComponents",
    "validation_pipeline": "useMcpValidation, ValidationPipeline",
    "theme_management": "useMcpTheme, McpThemeProvider",
    "token_validation": "tokenHelpers",
    "manifest_validation": true,
    "schema_enforcement": true,
    "audit_required": true,
    "version_compatibility": "semver"
  },
  "erp_context": {
    "ai_features": true,
    "workflow_automation": true,
    "data_visualization": true,
    "multi_tenant": true,
    "mobile_first": true,
    "performance_optimization": true,
    "accessibility_compliance": true
  }
}
```

### 6.3 MCP Usage Instructions

1. **Load MCP:** Read `/packages/ui/mcp/ui.mcp.json` at session start.
2. **Validate MCP:** Check hash matches audit log (if available).
3. **Load GRCD:** Read `packages/ui/GRCD-FRONTEND.md` for canonical specifications.
4. **Load MCP Tools Report:** Reference `packages/ui/MCP_TOOLS_VALIDATION_REPORT.md` for available tools.
5. **Load ERP Context:** Reference `ERP_IDEAS_AND_PAIN_POINTS.md` for ERP requirements.
6. **Check Directory:** Verify file locations against GRCD Section 4.
7. **Check Dependencies:** Verify all dependencies against GRCD Section 5.
8. **Validate MCP Manifests:** Ensure all MCP‑related code follows MCP schema.
9. **Use MCP Tools:** Use `useMcpComponents`, `useMcpValidation`, `useMcpTheme` for development.
10. **Validate Output:** Run pre‑commit checks from MCP validation section.

### 6.4 MCP Normative Requirements

- `F-MCP-1`: All AI coding sessions MUST start from a valid MCP seed (`/packages/ui/mcp/ui.mcp.json`).
- `F-MCP-2`: MCP changes MUST be audited and hash‑logged in audit system.
- `F-MCP-3`: MCP violation events MUST trigger alerts (e.g., file created in wrong directory, incompatible dependency introduced, invalid MCP manifest).
- `F-MCP-4`: MCP MUST reference the current GRCD version for the component (**v4.0.0**).
- `F-MCP-5`: MCP MUST NOT be altered by autonomous AI agents – human intent is the supreme authority.
- `F-MCP-6`: All component generation MUST use `useMcpComponents` hook.
- `F-MCP-7`: All component validation MUST use `useMcpValidation` or `ValidationPipeline`.
- `F-MCP-8`: All theme management MUST use `useMcpTheme` or `McpThemeProvider`.

---

## 7. ERP Context & Requirements

> **CRITICAL SECTION FOR ERP INTEGRATION**
>
> This section defines ERP-specific requirements and context for frontend development.

### 7.1 ERP Feature Requirements

**10 Stunning ERP Ideas to Support:**

1. **AI-Powered Predictive Analytics Dashboard**
   - Real-time predictive insights components
   - Natural language query interface
   - Automated anomaly detection UI
   - Trend visualization components

2. **Unified Workflow Automation Engine**
   - Visual workflow builder UI
   - Cross-module automation interface
   - Smart routing configuration UI
   - Integration management interface

3. **Mobile-First Native Experience**
   - Responsive, touch-optimized components
   - Offline-first UI patterns
   - Mobile-optimized workflows
   - Push notification UI

4. **Contextual AI Assistant (ERP Copilot)**
   - Conversational UI components
   - Context-aware help interface
   - Natural language reporting UI
   - Learning and suggestion UI

5. **Universal Integration Hub**
   - Integration marketplace UI
   - Visual integration builder
   - Real-time sync status UI
   - Webhook management interface

6. **Real-Time Business Intelligence & Custom Dashboards**
   - Customizable dashboard builder
   - Real-time data visualization
   - KPI card components
   - Drill-down navigation

7. **Advanced Security & Compliance Center**
   - Security dashboard UI
   - Compliance monitoring interface
   - Audit trail visualization
   - Role and permission management UI

8. **Intelligent Document Management System**
   - Document viewer components
   - Version control UI
   - Collaboration interface
   - Search and filtering UI

9. **Multi-Channel Communication Hub**
   - Unified inbox interface
   - Communication history UI
   - Channel management interface
   - Notification center

10. **Sustainability & ESG Tracking Module**
    - ESG dashboard components
    - Carbon footprint visualization
    - Sustainability reporting UI
    - Compliance tracking interface

### 7.2 ERP Pain Points to Solve

**10 Market Pain Points to Address:**

1. **Complex Implementation** → Simple, intuitive onboarding UI
2. **High Costs** → Efficient, performant components
3. **User Resistance** → Beautiful, accessible, mobile-first UI
4. **Customization Challenges** → Flexible, themeable components
5. **Data Migration Issues** → Clear migration UI and progress indicators
6. **Integration Difficulties** → Visual integration builder and management UI
7. **Scalability Concerns** → Optimized, virtualized components for large datasets
8. **Limited Flexibility** → Modular, composable component architecture
9. **Security Vulnerabilities** → Secure UI patterns and audit trails
10. **Ongoing Maintenance** → Self-documenting, validated components

### 7.3 ERP UI Patterns

**Data-Intensive Patterns:**

- Large data tables with virtualization
- Real-time data updates
- Complex filtering and sorting
- Bulk operations UI
- Export and import interfaces

**Workflow Patterns:**

- Multi-step forms
- Approval chains
- Task assignment and tracking
- Status indicators and timelines
- Progress visualization

**Analytics Patterns:**

- Customizable dashboards
- Real-time charts and graphs
- KPI displays
- Drill-down navigation
- Predictive insights visualization

**Mobile Patterns:**

- Touch-optimized interactions
- Responsive layouts
- Offline indicators
- Pull-to-refresh
- Swipe gestures

---

## 8. Contracts & Schemas

### 8.1 Component Manifest Schema

```json
{
  "component": "frontend",
  "version": "4.0.0",
  "mcp": {
    "server": {
      "name": "aibos-frontend",
      "version": "2.0.0",
      "protocol": "mcp",
      "protocolVersion": "2025-03-26"
    }
  },
  "components": [
    {
      "name": "Button",
      "type": "primitive",
      "rsc": "shared",
      "tokens": ["bg-bg-elevated", "text-fg", "rounded-lg"],
      "accessibility": "WCAG AA",
      "mcpValidated": true
    }
  ],
  "themes": {
    "base": "default",
    "wcag-aa": "wcag-aa",
    "wcag-aaa": "wcag-aaa",
    "safe-mode": "safe-mode",
    "dark": "dark"
  },
  "validation": {
    "mcpTools": ["useMcpComponents", "useMcpValidation", "useMcpTheme"],
    "pipeline": "ValidationPipeline",
    "constitution": "components.yml, rsc.yml"
  }
}
```

### 8.2 MCP Tool Schema

```typescript
// Component Generation Tool
interface McpComponentGeneration {
  componentName: string;
  componentType:
    | "primitive"
    | "semantic"
    | "composition"
    | "compound"
    | "interactive"
    | "layout"
    | "rsc"
    | "client"
    | "hybrid"
    | "ai"
    | "tenant"
    | "theme-aware";
  validateOnGenerate: boolean;
  generateTests: boolean;
  includeAccessibility: boolean;
  tenant?: string;
  safeMode?: boolean;
  contrastMode?: "aa" | "aaa";
}

// Validation Tool
interface McpValidation {
  componentCode: string;
  validateTokens: boolean;
  validateAccessibility: boolean;
  validateRSC: boolean;
  realTime: boolean;
  tenant?: string;
  safeMode?: boolean;
  contrastMode?: "aa" | "aaa";
}

// Theme Management Tool
interface McpTheme {
  tenant?: string;
  safeMode?: boolean;
  contrastMode?: "aa" | "aaa";
  darkMode?: boolean;
}
```

### 8.3 Schema Validation Strategy

- **Schema Format:** Zod schemas in `packages/ui/mcp/schemas/`.
- **Source of Truth:** Zod schemas are SSOT; TypeScript types generated from them.
- **Validation:**
  - All component manifests validated at build time.
  - All MCP tool invocations validated at runtime.
  - All theme configurations validated before activation.

---

## 9. Error Handling & Recovery

### 9.1 Error Taxonomy

| Error Class          | When Thrown                             | Recovery Strategy                                  | HTTP Status |
| -------------------- | --------------------------------------- | -------------------------------------------------- | ----------- |
| `FrontendError`      | Base class for frontend errors          | Log and standard 5xx response                      | 500         |
| `TokenError`         | Invalid token usage                     | Reject, audit, and guide remediation               | 400         |
| `ThemeError`         | Theme configuration failure             | Fallback to base theme, audit log                  | 500         |
| `ComponentError`     | Component generation/validation failure | Return error to client, audit log                  | 500         |
| `RSCError`           | RSC boundary violation                  | Reject component, log violation, suggest fix       | 400         |
| `AccessibilityError` | WCAG compliance failure                 | Block render, suggest fixes, audit log             | 400         |
| `McpError`           | MCP tool invocation failure             | Reject request, log MCP details, trigger alerts    | 400/422     |
| `ValidationError`    | MCP validation pipeline failure         | Return validation report, block render if critical | 400         |

### 9.2 Retry & Circuit Breaker Policy

| Operation            | Retry Count | Backoff Strategy                  | Timeout | Circuit Breaker Threshold |
| -------------------- | ----------- | --------------------------------- | ------- | ------------------------- |
| Component generation | 1           | None                              | 10s     | 5 errors/60s              |
| MCP validation       | 1           | None                              | 5s      | 10 errors/60s             |
| Theme switching      | 3           | Exponential (100ms, 200ms, 400ms) | 1s      | N/A                       |
| Token validation     | 1           | None                              | 2s      | 20 errors/60s             |

---

## 10. Observability

### 10.1 Metrics (Prometheus)

| Metric Name                            | Type      | Labels                  | Purpose                     | Target        |
| -------------------------------------- | --------- | ----------------------- | --------------------------- | ------------- |
| `frontend_component_generations_total` | Counter   | component_type, status  | Component generation volume | N/A           |
| `frontend_validations_total`           | Counter   | validation_type, result | Validation volume           | N/A           |
| `frontend_theme_switches_total`        | Counter   | theme_type, tenant      | Theme switching             | N/A           |
| `frontend_token_violations_total`      | Counter   | violation_type          | Token violation volume      | N/A           |
| `frontend_rsc_violations_total`        | Counter   | violation_type          | RSC violation volume        | N/A           |
| `frontend_accessibility_score`         | Gauge     | component, theme        | Accessibility score         | ≥95 (WCAG AA) |
| `frontend_bundle_size_bytes`           | Gauge     | component               | Bundle size                 | <500KB        |
| `frontend_render_time_seconds`         | Histogram | component               | Render performance          | <16ms p95     |

### 10.2 Traces (OpenTelemetry)

- **Span Names:** `frontend.component.generate`, `frontend.component.validate`, `frontend.theme.switch`, `frontend.token.validate`, `frontend.rsc.check`.
- **Attributes:** component_name, component_type, theme, tenant, validation_result, mcp_tool, rsc_boundary.

### 10.3 Logging Schema

```json
{
  "timestamp": "2025-01-27T10:30:00Z",
  "level": "info",
  "trace_id": "abc123",
  "tenant_id": "tenant-456",
  "component": "frontend.mcp",
  "message": "Component generated successfully",
  "metadata": {
    "componentName": "Button",
    "componentType": "primitive",
    "generationTime_ms": 1200,
    "validationResult": "passed",
    "mcpTool": "useMcpComponents",
    "theme": "wcag-aa",
    "tenant": "acme"
  }
}
```

---

## 11. Security

### 11.1 Security Requirements

- **Tenant Isolation:** Strict tenant isolation at theme and component level.
- **Token Security:** No sensitive data in tokens or CSS variables.
- **Component Security:** No unsafe patterns (dangerouslySetInnerHTML, eval).
- **MCP Security:** All MCP tool invocations validated and audited.
- **Accessibility Security:** WCAG compliance prevents security vulnerabilities.

### 11.2 Security Patterns

- **Safe Mode:** Disables tenant branding and enforces WCAG compliance.
- **Token Validation:** Prevents injection attacks through token validation.
- **RSC Boundaries:** Prevents server/client boundary violations.
- **Audit Logging:** All security-relevant events logged and audited.

---

## 12. Testing

### 12.1 Testing Strategy

- **Unit Tests:** Component-level tests with Vitest (95% coverage required).
- **Integration Tests:** MCP tool integration tests.
- **Accessibility Tests:** WCAG compliance tests with jest-axe.
- **Visual Tests:** Component visual regression tests.
- **Performance Tests:** Bundle size and render performance tests.

### 12.2 Testing Requirements

- `F-TEST-1`: All components MUST have unit tests (95% coverage).
- `F-TEST-2`: All components MUST pass accessibility tests (WCAG AA/AAA).
- `F-TEST-3`: All MCP tools MUST have integration tests.
- `F-TEST-4`: All theme configurations MUST be tested.
- `F-TEST-5`: All RSC boundaries MUST be validated in tests.

---

## 13. Tiering

### 13.1 Feature Tiering

| Feature Group         | Basic                           | Advanced                                         | Premium                                                    |
| --------------------- | ------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| **Component Library** | Core primitives (31 components) | + Compositions (Radix-based)                     | + Functional components (Tables, Charts, Workflows)        |
| **Theme System**      | Base theme                      | + WCAG AA/AAA themes                             | + Tenant customization, safe mode, dark mode               |
| **MCP Governance**    | Basic validation (token, RSC)   | + Full validation pipeline, component generation | + AI-powered generation, Figma integration, auto-fix       |
| **Accessibility**     | WCAG AA compliance              | + WCAG AAA compliance                            | + Safe mode, reduced motion, full keyboard navigation      |
| **ERP Features**      | Basic data tables, forms        | + Workflow automation UI, dashboards             | + AI assistant, predictive analytics, integration hub      |
| **Mobile Support**    | Responsive design               | + Touch optimization, mobile workflows           | + Offline-first, push notifications, native-like UX        |
| **Performance**       | Standard bundle size            | + Code splitting, lazy loading                   | + Virtualization, advanced caching, performance monitoring |
| **Multi-Tenant**      | Basic tenant isolation          | + Tenant theming, customization                  | + Full tenant branding, white-label support                |
| **Testing**           | Unit tests (95% coverage)       | + Integration tests, accessibility tests         | + Visual regression, performance tests, E2E tests          |
| **Observability**     | Basic metrics                   | + MCP validation metrics, theme metrics          | + Full telemetry, performance dashboards, AI insights      |

### 13.2 Tiering Requirements

- **Basic Tier:** Core functionality required for all deployments
- **Advanced Tier:** Enhanced features for enterprise deployments
- **Premium Tier:** Full feature set with AI-powered capabilities and advanced optimizations

---

## 14. Conclusion & Status

### 14.1 Current Status

**Overall Readiness:** ✅ **95% Ready** for Frontend Development

**Completed:**

- ✅ Theme-first architecture (100%)
- ✅ Component library migration (37/37 components - 100%)
- ✅ MCP tools implementation (100% operational)
- ✅ Validation pipeline (100% functional)
- ✅ Theme management (100% operational)
- ✅ RSC boundary enforcement (100%)
- ✅ WCAG compliance infrastructure (100%)
- ✅ Directory structure and conventions (100%)
- ✅ Dependency compatibility matrix (100%)
- ✅ MCP seed files (5/5 created)

**Pending:**

- ⚪ ERP-specific components (dashboards, workflows, data tables)
- ⚪ AI-powered features (predictive analytics, AI assistant)
- ⚪ Performance monitoring and optimization
- ⚪ Mobile-first optimizations
- ⚪ Advanced testing infrastructure

### 14.2 Development Readiness

**Status:** ✅ **READY TO START FRONTEND DEVELOPMENT**

**Available Tools:**

- ✅ `useMcpComponents` - Component generation
- ✅ `useMcpValidation` - Real-time validation
- ✅ `useMcpTheme` - Theme management
- ✅ `ValidationPipeline` - Multi-stage validation
- ✅ `ComponentValidator` - Component validation
- ✅ `tokenHelpers` - Token utilities

**Available Infrastructure:**

- ✅ Design system (CSS variables, ThemeProvider)
- ✅ Component library (37 components migrated)
- ✅ MCP governance (5 MCP seed files)
- ✅ Testing framework (Vitest, 95% coverage)
- ✅ TypeScript strict mode
- ✅ Next.js 16 RSC support

### 14.3 Next Steps

1. **Immediate (Week 1-2):**
   - Start building ERP-specific components using MCP tools
   - Implement data table components (TanStack Table)
   - Create dashboard layout components
   - Build workflow automation UI components

2. **Short-term (Month 1):**
   - Implement AI assistant UI components
   - Create predictive analytics dashboard components
   - Build integration management UI
   - Optimize for mobile-first experience

3. **Medium-term (Month 2-3):**
   - Performance optimization and monitoring
   - Advanced testing infrastructure
   - Mobile app optimization
   - Advanced ERP features

### 14.4 References

**GRCD Documents:**

- `packages/ui/GRCD-UI.md` - UI package master GRCD
- `packages/ui/GRCD-COMPONENTS.md` - Components layer GRCD
- `packages/ui/GRCD-ARCHITECTURE-OVERVIEW.md` - Architecture overview

**MCP Documents:**

- `packages/ui/MCP_TOOLS_VALIDATION_REPORT.md` - MCP tools validation
- `packages/ui/MCP-READINESS-ASSESSMENT.md` - MCP readiness assessment
- `packages/ui/mcp/ui.mcp.json` - Master MCP seed file

**ERP Context:**

- `ERP_IDEAS_AND_PAIN_POINTS.md` - ERP requirements and context

**Documentation:**

- `docs/01-foundation/ui-system/` - UI system documentation
- `docs/01-foundation/philosophy/components-philosophy.md` - Component philosophy

---

> ✅ **Status:** GRCD-FRONTEND has been created as **v4.0.0** and is structurally compatible with **GRCD-TEMPLATE v4 (MCP-Governed Edition)**. This document serves as the **single source of truth** for all frontend development in the AI-BOS Nexus platform.

**Last Updated:** 2025-01-27  
**Version:** 4.0.0  
**Status:** ✅ **ACTIVE - READY FOR DEVELOPMENT**  
**Next Review:** After significant frontend development milestones
