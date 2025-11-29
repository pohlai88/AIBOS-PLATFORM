# Orchestra Domains

This directory contains manifest definitions for the 8 domain-specific orchestras in the AI-BOS ecosystem.

## 🎭 Available Orchestras

### 1. Database Orchestra (`db`)
**Purpose:** Schema design, query optimization, migrations, data governance  
**Agents:** Schema Architect, Query Optimizer  
**Dependencies:** None (leaf node)  
**Status:** ✅ Manifest complete

### 2. UX/UI Orchestra (`ux-ui`)
**Purpose:** Component design, accessibility, user flows, design systems  
**Agents:** UI Designer, A11y Specialist, UX Researcher  
**Dependencies:** BFF API  
**Status:** ⏳ Stub manifest needed

### 3. BFF/API Orchestra (`bff-api`)
**Purpose:** Backend-for-Frontend, API design, GraphQL/REST, data aggregation  
**Agents:** API Designer, Integration Specialist  
**Dependencies:** Database, Backend Infra, UX/UI  
**Status:** ⏳ Stub manifest needed

### 4. Backend Infrastructure Orchestra (`backend-infra`)
**Purpose:** Service architecture, deployment, scaling, infrastructure as code  
**Agents:** DevOps Engineer, Infrastructure Architect  
**Dependencies:** Database, Observability  
**Status:** ⏳ Stub manifest needed

### 5. Compliance Orchestra (`compliance`)
**Purpose:** Legal compliance, data privacy, audit trails, regulatory requirements  
**Agents:** Compliance Officer, Privacy Specialist, Audit Manager  
**Dependencies:** Database, Backend Infra, Observability  
**Status:** ⏳ Stub manifest needed  
**Special:** Can access all domains, cannot be called by others

### 6. Observability Orchestra (`observability`)
**Purpose:** Monitoring, logging, tracing, alerting, metrics  
**Agents:** SRE, Metrics Analyst  
**Dependencies:** None (leaf node - metrics/logs)  
**Status:** ⏳ Stub manifest needed

### 7. Finance Orchestra (`finance`)
**Purpose:** Billing, invoicing, cost optimization, financial reporting  
**Agents:** Financial Analyst, Billing Specialist  
**Dependencies:** Database, Compliance  
**Status:** ⏳ Stub manifest needed  
**Special:** Most operations are read-only

### 8. DevEx Orchestra (`devex`)
**Purpose:** Developer experience, tooling, documentation, CI/CD  
**Agents:** DevEx Engineer, Documentation Specialist  
**Dependencies:** Observability, Backend Infra  
**Status:** ⏳ Stub manifest needed  
**Special:** Can observe, cannot be called

---

## 📋 Manifest Template

All orchestra manifests follow this schema:

```json
{
  "name": "{domain}-orchestra",
  "version": "1.0.0",
  "domain": "{domain}",
  "description": "Orchestra description",
  "agents": [
    {
      "name": "agent-name",
      "role": "Agent Role",
      "description": "Agent description",
      "capabilities": ["capability1", "capability2"],
      "mcpTools": ["github", "shell"]
    }
  ],
  "tools": [
    {
      "name": "tool_name",
      "description": "Tool description",
      "inputSchema": {
        "type": "object",
        "properties": {},
        "required": []
      }
    }
  ],
  "policies": [
    {
      "id": "policy-id",
      "domain": "{domain}",
      "rule": "Policy rule",
      "precedence": "legal|industry|internal",
      "enforced": true
    }
  ],
  "dependencies": ["other-domain"],
  "mcpServers": ["github", "shell"],
  "metadata": {
    "author": "AI-BOS Team",
    "tags": ["tag1", "tag2"],
    "priority": "low|medium|high|critical"
  }
}
```

---

## 🏗️ Cross-Orchestra Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                    Orchestra Flow                        │
└─────────────────────────────────────────────────────────┘

UX/UI ──────→ BFF API ──────→ Database
                  │
                  ├──────→ Backend Infra ──→ Database
                  │              │
                  │              └──→ Observability
                  │
                  └──────→ UX/UI

Compliance ─────→ All (read/audit access)

Finance ────────→ Database, Compliance

DevEx ──────────→ Observability, Backend Infra (observe only)
```

---

## 🎼 Conductor-of-Conductors Pattern

The **Orchestra Conductor** (`kernel/orchestras/coordinator/conductor.ts`) coordinates all domain orchestras:

1. **Request Routing:** Routes actions to the appropriate orchestra
2. **Dependency Validation:** Ensures all dependencies are available
3. **Cross-Orchestra Coordination:** Manages workflows across multiple orchestras
4. **Session Management:** Tracks coordination sessions
5. **Authorization:** Enforces cross-orchestra permissions via `cross-orchestra.ts`

---

## 🔐 Authorization Rules

Defined in `kernel/orchestras/coordinator/cross-orchestra.ts`:

- **Database:** Can be called by BFF API, Backend Infra, Compliance
- **UX/UI:** Can call BFF API
- **BFF API:** Can call Database, Backend Infra, UX/UI
- **Backend Infra:** Can call Database, Observability
- **Compliance:** Can call all (special access)
- **Observability:** Leaf node (metrics/logs only)
- **Finance:** Can call Database, Compliance (read-only for most)
- **DevEx:** Can observe (Observability, Backend Infra)

---

## 🚀 Usage

### Register an Orchestra

```typescript
import { orchestraRegistry } from "../orchestras";
import manifest from "./domains/db/manifest.json";

await orchestraRegistry.register(manifest);
```

### Coordinate an Action

```typescript
import { orchestraConductor } from "../orchestras";

const result = await orchestraConductor.coordinateAction({
  domain: "db",
  action: "analyze_schema",
  arguments: { tables: ["users", "orders"] },
  context: {
    tenantId: "tenant-123",
    userId: "user-456",
    traceId: "trace-789",
  },
});
```

### Cross-Orchestra Workflow

```typescript
const results = await orchestraConductor.coordinateCrossOrchestra(
  [
    { domain: "ux-ui", action: "generate_component", ... },
    { domain: "bff-api", action: "create_endpoint", ... },
    { domain: "db", action: "create_schema", ... },
  ],
  true // parallel execution
);
```

---

## 📚 Next Steps

1. **Complete stub manifests** for remaining 7 orchestras
2. **Implement domain-specific logic** for each orchestra
3. **Add integration tests** for cross-orchestra workflows
4. **Create orchestra-specific MCP tools** for specialized operations

---

**Status:** Phase 2 Foundation Complete  
**Compliance:** F-15, F-16, F-17 in progress

