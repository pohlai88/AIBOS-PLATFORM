# 🎨 AI-BOS Studio

> **The No-Code UI/UX Builder for Business People, Powered by AI**

Build enterprise-grade applications without writing a single line of code. AI-BOS Studio combines the best of Retool, Bubble, and Storybook into one unified platform designed for micro-developers and small teams who need maximum efficiency.

---

## 🌟 Vision

AI-BOS Studio empowers business users to create, customize, and deploy professional applications through an intuitive visual interface. Our platform bridges the gap between design and development, enabling rapid iteration while maintaining enterprise-grade governance and compliance.

### What Makes Us Different

| Traditional Tools                      | AI-BOS Studio                        |
| -------------------------------------- | ------------------------------------ |
| Separate tools for UI, data, workflows | **Unified platform**                 |
| Complex configuration                  | **Zero config, instant start**       |
| Code-heavy customization               | **AI-assisted, no-code**             |
| Generic components                     | **Your governed design system**      |
| Manual deployments                     | **1-click publish with audit trail** |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI-BOS Studio                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   RETOOL     │  │   BUBBLE     │  │  STORYBOOK   │              │
│  │  (DB Bind)   │ +│  (App Build) │ +│  (Preview)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│          ↓               ↓                ↓                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    UNIFIED ENGINE                            │   │
│  │                                                              │   │
│  │  • Visual Canvas (Drag-Drop)                                │   │
│  │  • Data Connector (Multi-DB + API)                          │   │
│  │  • Workflow Builder (NocoBase-inspired)                     │   │
│  │  • Theme Overlay (CSS Variables)                            │   │
│  │  • AI Architect (LLM-powered)                               │   │
│  │  • Governance Engine (Contracts + Metadata)                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│          ↓               ↓                ↓                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  @aibos/ui   │  │  @aibos/bff  │  │  Supabase    │              │
│  │  Components  │  │  Gateway     │  │  Realtime    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Tiered Feature Matrix

### 🟩 Basic — _"Start making apps in minutes."_

**Target:** Business owners, operation managers, non-technical builders

| Category        | Features                                               |
| --------------- | ------------------------------------------------------ |
| **App Builder** | Drag-drop canvas, pre-built templates, auto-responsive |
| **Data**        | 1-click DB connection, auto CRUD, simple query builder |
| **Workflows**   | OnClick/PageLoad triggers, basic actions               |
| **AI**          | Generate pages from prompts, auto-suggest labels       |
| **Theming**     | Brand colors, logo, light/dark mode                    |
| **Deploy**      | 1-click publish, auto-save drafts                      |

### 🟦 Advanced — _"Build workflows and department systems."_

**Target:** Department managers, Ops teams, internal product owners

| Category        | Features                                                     |
| --------------- | ------------------------------------------------------------ |
| **App Builder** | Reusable blocks, conditional visibility, computed fields     |
| **Data**        | Multi-datasource joins, secure API calls, caching            |
| **Workflows**   | Visual builder, human approvals, scheduled jobs, webhooks    |
| **AI**          | Generate workflows & schemas, suggest optimizations          |
| **Theming**     | Full theme editor, responsive breakpoints, per-project brand |
| **Governance**  | Roles (viewer/editor/admin), audit logs, staging environment |

### 🟥 Premium — _"Enterprise governance with AI architect."_

**Target:** Group CIO, CDO, CTO, compliance teams, multi-entity corporations

| Category         | Features                                                              |
| ---------------- | --------------------------------------------------------------------- |
| **App Builder**  | Governed component library, DSaaS, multi-tenant isolation             |
| **Data**         | Field-level permissions, zero-trust connections, encrypted connectors |
| **Workflows**    | SLA enforcement, cross-team flows, AI anomaly detection               |
| **AI Architect** | UX/a11y evaluation, auto-refactor, compliance checking                |
| **Theming**      | Design tokens, WCAG AA/AAA safe mode, Figma sync                      |
| **Governance**   | Full audit trail, signed manifests, policy engine, data lineage       |
| **Deploy**       | Blue/green, canary releases, multi-region strategy                    |

---

## 🛠️ Technology Stack

| Layer             | Technology                               |
| ----------------- | ---------------------------------------- |
| **Frontend**      | React 19, Next.js 16, TypeScript         |
| **Components**    | @aibos/ui (Radix UI + Custom)            |
| **Styling**       | CSS Variables, Design Tokens, Tailwind   |
| **Backend**       | @aibos/bff (Multi-protocol gateway)      |
| **Database**      | Supabase (PostgreSQL + Realtime)         |
| **AI/LLM**        | MCP Integration, OpenAI/Claude           |
| **Collaboration** | Supabase Realtime (Presence + Broadcast) |

---

## 📁 Project Structure

```
packages/ui/studio/
├── README.md                    # This file
├── PRD.md                       # Product Requirements Document
├── src/
│   ├── canvas/                  # Visual drag-drop editor
│   │   ├── Canvas.tsx
│   │   ├── DragDropProvider.tsx
│   │   └── components/
│   ├── data/                    # Data binding & connectors
│   │   ├── DataSourceManager.tsx
│   │   ├── QueryBuilder.tsx
│   │   └── connectors/
│   ├── workflows/               # Automation builder
│   │   ├── WorkflowCanvas.tsx
│   │   ├── nodes/
│   │   └── triggers/
│   ├── themes/                  # Theme overlay system
│   │   ├── ThemeProvider.tsx
│   │   ├── ThemePicker.tsx
│   │   └── overlays/
│   ├── ai/                      # AI architect features
│   │   ├── AIAssistant.tsx
│   │   ├── PageGenerator.tsx
│   │   └── GovernanceAgent.tsx
│   ├── governance/              # Enterprise governance
│   │   ├── PolicyEngine.tsx
│   │   ├── AuditLogger.tsx
│   │   └── RBAC.tsx
│   └── preview/                 # Component preview (Storybook-lite)
│       ├── PreviewPanel.tsx
│       └── ComponentRegistry.tsx
├── manifests/
│   ├── design-manifest.json
│   └── history/
└── docs/
    ├── CHANGELOG.md
    └── ROADMAP.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Supabase account (for data & realtime)

### Installation

```bash
# Clone the repository
git clone https://github.com/aibos/platform.git
cd platform

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Setup

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key  # For AI features
```

---

## 🎯 Core Concepts

### 1. Theme Overlay System

```
┌─────────────────────────────────────────┐
│  Layer 1: globals.css (base tokens)     │  ← Immutable foundation
├─────────────────────────────────────────┤
│  Layer 2: theme-overlay.css (tenant)    │  ← Organization branding
├─────────────────────────────────────────┤
│  Layer 3: user-prefs.css (personal)     │  ← User customization
└─────────────────────────────────────────┘
```

### 2. Data Binding Flow

```
DB Schema → Auto-introspect → Generate Forms → Bind to Canvas
     ↓
  Metadata    →    Contracts    →    Validation    →    CRUD
```

### 3. AI-Assisted Building

```
User Prompt: "Create a customer management page"
     ↓
AI generates: Layout + Components + Data bindings + Workflows
     ↓
User refines: Drag-drop adjustments + Theme customization
     ↓
Deploy: 1-click publish with governance checks
```

---

## 🔐 Security & Governance

### Multi-Tenant Isolation

```sql
-- Row Level Security for tenant isolation
CREATE POLICY "tenant_isolation" ON studio_apps
FOR ALL USING (
  tenant_id = auth.jwt() ->> 'tenant_id'
);
```

### Audit Trail

Every action is logged with:

- User ID
- Timestamp
- Action type
- Before/After state
- IP address

### Compliance Modes

- **WCAG AA**: Automatic accessibility checks
- **WCAG AAA**: Strict accessibility enforcement
- **Safe Mode**: Prevent non-compliant deployments

---

## 📊 Comparison with Market Leaders

| Feature        | Retool | Bubble | Webflow | NocoBase | **AI-BOS Studio** |
| -------------- | ------ | ------ | ------- | -------- | ----------------- |
| DB Binding     | ✅     | ⚠️     | ❌      | ✅       | ✅                |
| Visual Builder | ⚠️     | ✅     | ✅      | ✅       | ✅                |
| Workflows      | ⚠️     | ✅     | ❌      | ✅       | ✅                |
| AI-Powered     | ❌     | ⚠️     | ⚠️      | ❌       | ✅                |
| Design Tokens  | ❌     | ❌     | ⚠️      | ❌       | ✅                |
| Governance     | ❌     | ❌     | ❌      | ⚠️       | ✅                |
| Self-Hosted    | ❌     | ❌     | ❌      | ✅       | ✅                |
| Open Source    | ❌     | ❌     | ❌      | ✅       | ✅                |

---

## 🗺️ Roadmap

### Phase 1: Foundation (Current)

- [x] Component library (@aibos/ui)
- [x] Design token system
- [x] Theme overlay architecture
- [ ] Visual canvas MVP
- [ ] Basic data binding

### Phase 2: Core Features

- [ ] Workflow builder
- [ ] AI page generation
- [ ] Multi-datasource support
- [ ] Collaboration features

### Phase 3: Enterprise

- [ ] Governance engine
- [ ] AI Architect mode
- [ ] Multi-tenant isolation
- [ ] Compliance tools

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🔗 References

### Inspiration Sources

| Tool                                                | What We Learned               |
| --------------------------------------------------- | ----------------------------- |
| [Retool](https://retool.com)                        | DB binding, query builder     |
| [Bubble](https://bubble.io)                         | Visual app builder, workflows |
| [Webflow](https://webflow.com)                      | Design precision, responsive  |
| [NocoBase](https://github.com/nocobase/nocobase)    | Data model driven, plugins    |
| [Appsmith](https://github.com/appsmithorg/appsmith) | Open source internal tools    |
| [Puck](https://github.com/puckeditor/puck)          | Visual React editor           |
| [Plate](https://github.com/udecode/plate)           | MCP integration pattern       |

---

## 📞 Support

- **Documentation**: [docs.ai-bos.io](https://docs.ai-bos.io)
- **Discord**: [Join our community](https://discord.gg/aibos)
- **Email**: support@ai-bos.io

---

<p align="center">
  <strong>Built with ❤️ by the AI-BOS Team</strong>
  <br>
  <em>Empowering business users to build without limits</em>
</p>
