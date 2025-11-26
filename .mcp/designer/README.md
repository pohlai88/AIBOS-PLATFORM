# 🎨 AI-BOS Designer MCP — Architecture & Development Guide

**Version:** 1.0.0  
**Status:** Stable  
**Last Updated:** 2025

> **Designer MCP is AI-BOS's machine-enforced Design Governance Engine**.
>
> It provides *validation*, *auto-fixing*, *multi-tenant theming*, *RSC-aware design checks*, and *enterprise CI enforcement* across Figma and React.

---

## 📘 1. Overview

Designer MCP is a **Model Context Protocol server** that ensures design correctness at every layer of the AI-BOS platform.

It performs:

- **Design Validation** (Typography, Spacing, Layout, Geometry, Visual)
- **Contextual Awareness** (RSC / client, Safe Mode, Layer-1/2/3 components)
- **Multi-Tenant Theme Enforcement**
- **Component AST Extraction** (React → DesignNodes)
- **Figma Plugin Integration**
- **Reports (HTML/PDF)**
- **AutoFix for Code**
- **CI/CD Blocking & Auto-Fix PRs**

This README explains how to maintain, extend, and operate the system.

---

## 📂 2. Directory Structure

```
.mcp/designer/
│
├── server.ts                 # Main MCP server
├── index.ts                  # Entrypoint export
│
├── types/                    # Shared type definitions
│     DesignNode.ts
│     ValidationError.ts
│
├── errors/                   # Error code definitions
│     errorCodes.ts
│
├── config/                   # Multi-brand rule config + schema validation
│     configLoader.ts
│     schemaValidator.ts
│     default/
│         rules.typography.json
│         rules.spacing.json
│         rules.layout.json
│         rules.geometry.json
│         rules.visual.json
│     dlbb/
│         ...
│     client-template/
│         ...
│
├── schemas/                  # JSON-schema definitions for rule validation
│     typography.schema.json
│     spacing.schema.json
│     layout.schema.json
│     geometry.schema.json
│     visual.schema.json
│
├── engines/                  # Logic for each design rule category
│     typographyEngine.ts
│     spacingEngine.ts
│     layoutEngine.ts
│     geometryEngine.ts
│     visualEngine.ts
│
├── validators/               # Combines engines → full validation
│     validateTypography.ts
│     validateSpacing.ts
│     validateLayout.ts
│     validateGeometry.ts
│     validateVisual.ts
│     validateAll.ts
│
├── extractor/                # React AST → DesignNodes
│     index.ts
│     parseComponent.ts
│     parseTailwind.ts
│     parseInlineStyles.ts
│     parseJSX.ts
│     tailwindMap.json
│
├── context/                  # Layer/RSC/tenant/safe-mode awareness
│     index.ts
│     detectRSC.ts
│     detectComponentLayer.ts
│     detectDesignMode.ts
│     detectTenantTheme.ts
│     enrichNode.ts
│
├── reporter/                 # HTML/PDF report generator
│     generateReport.ts
│     htmlTemplate.ts
│     summary.ts
│     pdf.ts
│     theme.css
│
├── autofix/                  # AutoFix engine (AI-driven code rewrites)
│     index.ts
│     fixRules.ts
│     applyFixes.ts
│     smartReplace.ts
│     jsxRewrite.ts
│
├── figma-plugin/             # Figma plugin bridge
│     manifest.json
│     code.ts
│     ui.html
│     bridge.ts
│
└── ci/                       # CI/CD integration layer
      runValidation.ts
      summarizeCI.ts
      commentGitHub.ts
      createFixPR.ts
      config.ci.json
      ci.ts
      index.ts
```

---

## 🧠 3. Core Concepts

Designer MCP operates on a unified design representation called:

### → **DesignNode**

Produced by either:

#### A) Figma Plugin Bridge
Exporting frames into JSON

#### B) React AST Extractor
Parsing `.tsx` files into analyzable nodes

Validators run on these nodes to detect:

- Typography issues
- Spacing deviation
- Layout violations
- Visual/surface mismatches
- Geometry issues (radius, icons, padding)

AutoFix + CI integrate into the full pipeline.

---

## 🧩 4. Multi-Tenant Rules

Rules are located under:

```
.mcp/designer/config/<tenant>/
```

Tenants can include:

- `default`
- `dlbb`
- `client-template`
- `enterprise-clientX`

Each tenant holds 5 rule files:

```
rules.typography.json
rules.spacing.json
rules.layout.json
rules.geometry.json
rules.visual.json
```

Each rule file is validated against JSON-Schema to avoid misconfiguration.

---

## 🔍 5. Validators & Engines

Each engine validates a specific design category:

| Engine           | Category                                      | Primary Rules |
| ---------------- | --------------------------------------------- | ------------- |
| typographyEngine | text size, weight, line-height, modular scale | TYP-*         |
| spacingEngine    | padding, gap, spacing grid                    | SPC-*         |
| layoutEngine     | frame width, alignment grid                   | LAY-*         |
| geometryEngine   | button padding, icon size, radius             | GEO-*         |
| visualEngine     | surface role, effects                         | VIS-*         |

Validators combine engines:

```
validateAll → full rule-suite
```

---

## 🧬 6. Context Engine (Stage 13)

Context enrichment adds deep awareness:

| Context            | Purpose                                   |
| ------------------ | ----------------------------------------- |
| `rscBoundary`      | Prevents illegal CSS in server components |
| `componentLayer`   | Enforces different rules for L1/L2/L3     |
| `designMode`       | default / safe / aa / aaa                 |
| `tenant`           | multi-brand theming                       |
| `allowedOverrides` | theme overrides allowed at this node      |

This ensures **no conflicts with previous stages** — only richer interpretation.

---

## 🔧 7. React Component AST Extraction

The extractor converts React code into DesignNodes by processing:

- JSX elements
- Tailwind classes
- Inline style objects
- Design tokens
- Component structure
- Hierarchy

Tools used:

- Babel Parser
- Babel Traverse

Outputs a consistent DesignNode tree for validators.

---

## 📦 8. Figma Plugin Bridge

Located under `figma-plugin/`:

- Allows selecting frames
- Exporting to MCP JSON Node format
- Sends to Designer MCP for validation
- Returns results to Figma UI

This enables **Figma → React uniform enforcement**.

---

## 📝 9. Reporting System (HTML + PDF)

The Reporter can generate:

### • HTML design audit reports
### • PDF reports (using Puppeteer)

Including:

- Summary by severity
- Summary by error code
- Summary by node type
- Detailed issue table
- Themed visual formatting

Perfect for:

- Internal QA
- Client onboarding
- Audit evidence (SOC2, ISO27001)
- Design reviews

---

## 🛠️ 10. AutoFix Engine

AutoFix includes:

- Error → FixRule mapping
- Tailwind class replacement
- Inline style merging
- Token replacement
- JSX rewrite with Babel Generator

This allows:

- PR auto-fix suggestions
- One-click fixes
- Auto-fix branches in CI

---

## 🚦 11. CI/CD Enforcement

CI runner:

- Extracts design metadata from changed components
- Validates under multiple tenant themes
- Summarizes errors
- Comments on GitHub PRs
- Optionally blocks merges
- Optionally creates auto-fix PR

GitHub Actions workflow provided:

```
.github/workflows/designer-validation.yml
```

This ensures **no design regression can enter production**.

---

## 🛡️ 12. Safety & Best Practices

### ✔ Never edit design rules directly in code
Always modify the JSON rule files.

### ✔ Always validate rule schema before merging
Schema validation is automatic but must be respected.

### ✔ Do not bypass MCP
Component changes must be validated through MCP & CI.

### ✔ Keep Tailwind Map updated
Ensures AST → DesignNode mapping is accurate.

### ✔ Layered Design Governance
Always categorize new components into L1/L2/L3.

### ✔ Tokens-first development
Never hardcode visual values.

---

## 🧭 13. Roadmap (Future Stages)

Potential expansions:

- **Stage 14:** Full GitHub App (auto-fix branches + app manifest)
- **Stage 15:** Token-sync Figma ↔ React (bi-directional)
- **Stage 16:** Visual Studio Code plugin (inline design hints)
- **Stage 17:** Designer AI Chat Panel with real-time feedback
- **Stage 18:** Figma Project Auditor (entire file, not just frames)
- **Stage 19:** Multi-brand style migration engine
- **Stage 20:** Token drift checker (Figma vs tokens.ts)

---

## 🎉 14. Summary

Designer MCP is now a **world-class design governance system**, providing:

- ✅ Precise validation logic
- ✅ Multi-tenant theme enforcement
- ✅ RSC awareness
- ✅ Layer-aware design rules
- ✅ Figma + React sync
- ✅ Full auto-fix pipeline
- ✅ CI/CD merge gate
- ✅ Enterprise reporting

This README will allow **any new developer** to understand, maintain, and evolve the system.

---

## 📚 Quick Start

### Run validation locally:

```bash
cd .mcp/designer
pnpm install
npx tsx ci/ci.ts path/to/component.tsx
```

### Run MCP server:

```bash
npx tsx server.ts
```

### Generate report:

```typescript
import { generateReport } from "./reporter/generateReport";
import { validateAll } from "./validators/validateAll";

const errors = validateAll(nodes);
const report = await generateReport(errors, "dlbb", true); // PDF
```

---

## 🔗 Related Documentation

- [UI System Philosophy](/docs/01-foundation/ui-system/components-philosophy.md)
- [Design Tokens](/packages/ui/src/design/tokens/)
- [Component Library](/packages/ui/src/components/)

---

**Maintained by AI-BOS Platform Team**
