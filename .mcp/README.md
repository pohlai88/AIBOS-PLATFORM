# 📘 AI-BOS Model Context Protocol Framework

### **Specification & README — Version 1.0.0**

_Last Updated: 2025-11-26_

---

# 0. Executive Summary

AI-BOS adopts the **Model Context Protocol (MCP)** as the foundational communication and integration protocol across all surfaces, engines, tooling, and AI agents.

This document:

- Explains MCP as defined by the official spec
- Defines AI-BOS's **extensions, governance rules, safety guarantees, and architectural conventions**
- Establishes a **Single Source of Truth (SSOT)** for all current and future MCP development
- Serves as the **root reference** for developers, micro-developers, auditors, and AI systems
- Defines the versioning, validation, and testing model for AI-BOS MCP servers

This SSOT ENSURES:

- determinism
- consistency
- traceability
- security
- compatibility
- future scalability

---

# 1. Introduction

## 1.1 What is MCP (from the official spec)

MCP — **Model Context Protocol** — is an open standard for enabling AI systems to interact with tools, resources, and services through a standardized, schema-driven, JSON-RPC-based interface.

Official spec references:

- [https://modelcontextprotocol.io/specification/2025-03-26/architecture](https://modelcontextprotocol.io/specification/2025-03-26/architecture)
- [https://anthropic.com/news/model-context-protocol](https://anthropic.com/news/model-context-protocol)

### MCP defines:

- **Servers** (service providers)
- **Clients** (AI systems, IDEs, Studio, agents)
- **Tools** (actions that can be invoked through structured schemas)
- **Resources** (lists, documents, database entries)
- **Prompts** (optional prompt templates)
- **Schemas** (JSON Schema-based input/output validation)
- **Session lifecycle** (initialize, capabilities, shutdown)
- **Transport** via JSON-RPC over stdio or HTTP

MCP provides a **safe, standardized, predictable** way for AI to interact with external systems.

---

# 2. Why AI-BOS Uses MCP

AI-BOS is built on the principle of **metadata-first, contract-first, governable-by-AI architecture**.

MCP is the perfect foundation because:

### ✔ It is **schema-driven**

Everything in AI-BOS is metadata-driven; MCP's JSON Schema model aligns perfectly.

### ✔ It is **deterministic**

AI-BOS requires strict determinism for reliability and safety.

### ✔ It is **tool-oriented**

AI-BOS engines + actions = MCP tools.

### ✔ It is **AI-native**

Built for direct use by LLMs — aligning with AI-BOS's "AI-governed OS" philosophy.

### ✔ It is **extensible**

AI-BOS extends MCP for:

- multi-tenant safety
- sandbox isolation
- metadata registry
- engine registration
- governance
- signature/permission systems
- kernel testing
- platform lifecycle

---

# 3. Scope of This Document

This document defines:

### **A. Pure MCP elements (coming from the official spec)**

- servers
- client-server lifecycle
- tools
- resources
- prompts
- schemas
- JSON-RPC patterns
- capability negotiation

### **B. AI-BOS extensions to MCP (platform-level governance)**

AI-BOS extends MCP to support:

1. Multi-tenant contexts
2. Engine manifests & lifecycle
3. Metadata registry & contract-based engines
4. Sandbox isolation levels (1–3)
5. Signature validation system
6. Permission framework (kernel/public/tenant/sandbox)
7. Governance rules engine
8. Audit logging layer (kernel events)
9. Healthcheck/diagnostics endpoints
10. Hardening suites (v1/v2/v3)
11. MCP Confidence Protocol
12. MCP Inspector toolset
13. Custom test harness (Vitest + MCP orchestrator)
14. MCP Registry for versioned distribution

All extensions are clearly separated from MCP specification to avoid drift.

---

# 4. Core Principles

Every MCP in AI-BOS MUST follow these principles:

### 📌 1. **Schema First**

Every tool MUST define input & output schemas.
No dynamic/untyped payloads allowed.

### 📌 2. **Deterministic Behavior**

Given identical input → MUST produce identical output.
Randomness must be sandboxed or disabled.

### 📌 3. **Declarative, Not Imperative**

MCP servers describe capabilities, not ad-hoc executable logic.

### 📌 4. **Immutable Contracts**

Schemas, manifests, and tool definitions MUST be versioned.

### 📌 5. **Auditability**

Every tool execution is logged with:

- timestamp
- tenant
- engine
- payload
- output
- performance
- confidence score

### 📌 6. **Least Privilege**

Tools must only access declared permission scopes.

### 📌 7. **Kernel Enforced**

The Master Kernel MUST validate:

- schemas
- signatures
- permissions
- determinism
- version compatibility

### 📌 8. **Zero Trust**

All external MCPs run in sandbox-level isolation.

---

# 5. MCP Server Architecture (Based on Official Spec)

AI-BOS adheres to the official MCP server architecture:

```
MCP Server
  ├── Initialization
  ├── Capability declaration
  ├── Tool definitions
  ├── Resource definitions
  ├── Prompt definitions
  ├── JSON-RPC transport
  ├── Session lifecycle
  └── Shutdown
```

## Required Files:

```
index.ts           # entry point
manifest.json      # schema-based definition
tools/             # tool implementations
schemas/           # JSON Schemas for tool I/O
```

---

# 6. AI-BOS Extensions to MCP (Governance Layer)

AI-BOS adds a platform layer ON TOP OF MCP:

```
AI-BOS Platform Layer
  ├── Kernel Governance MCPs
  ├── Metadata Registry
  ├── Engine Registry
  ├── Tenant Context
  ├── Signature Validation
  ├── Sandbox Isolation
  ├── Hardening Suites
  ├── Audit Logging
  ├── MCP Confidence Protocol
  └── MCP Inspector
```

These are NOT part of the official MCP spec.
These are required to turn MCP into an **OS-level architecture**.

---

# 7. Required AI-BOS MCP Extensions (Formal Specification)

Below is the canonical list of AI-BOS MCP extensions.

## 7.1 Signature Verification (Mandatory)

Every MCP manifest must be signed:

- manifest signature
- schema checksum
- tool signature

Kernel verifies before allowing execution.

## 7.2 Permission Model

```
kernel: [full internal access]
tenant: [isolated per tenant]
public: [read-only safe access]
sandbox: [restricted execution]
```

## 7.3 Sandbox Isolation Levels

- **Level 1**: Internal kernel MCPs
- **Level 2**: External MCPs (marketplace/micro-developers)
- **Level 3**: Untrusted code (runtime action execution)

## 7.4 Metadata Registry Compliance

- tool definitions must match kernel metadata contracts
- drift detection must run on load

## 7.5 Engine Manifest Validation

Every external engine MCP must declare:

- engine name
- version
- capabilities
- actions
- schemas
- tenant context behavior

## 7.6 Audit Logging / Security Events

Every MCP tool execution produces:

- security event
- trace ID
- performance metrics

## 7.7 MCP Confidence Protocol

Every MCP tool response must include:

```
confidenceScore: number (0–1)
validated: boolean
schemaVerified: boolean
signatureVerified: boolean
deterministic: boolean
```

## 7.8 MCP Inspector

A kernel-level MCP tool that:

- inspects MCP registry
- checks schema drift
- checks signature validity
- evaluates determinism
- calculates confidence
- verifies permission boundaries

---

# 8. Directory Structure (Recommended)

```
/mcp/
  /kernel-test-mcp/
  /kernel-governance-mcp/
  /kernel-sandbox-mcp/
  /kernel-diagnostics-mcp/
  /external/*
```

Each MCP folder contains:

```
manifest.json
index.ts
schemas/
tools/
types/
```

---

# 9. Developer Best Practices

For all MCP developers (internal or micro-developers):

### ✔ Declare all tools in manifest

### ✔ Provide JSON Schemas for all inputs/outputs

### ✔ Implement deterministic logic

### ✔ Use async-only functions

### ✔ Avoid side effects

### ✔ Respect tenant isolation

### ✔ Sign manifests

### ✔ Follow semver

### ✔ Run MCP Validation Suite before publishing

---

# 10. Versioning Policy

- MCP Constitution Version: **X.Y.Z**
- Backwards Compatibility: Minor updates only
- Breaking Changes: require major version

Kernel rejects MCPs outside version range.

---

# 11. Security Overview

AI-BOS MCP security model protects against:

- tool poisoning
- schema drift
- privilege escalation
- untrusted code execution
- cross-tenant leakage
- signature tampering
- nondeterministic tool behavior
- supply chain attacks

Based on research:

- arXiv:2506.13538 (MCP maintainability & vulnerabilities)
- arXiv:2510.16558 (MCP registry security gaps)

AI-BOS mitigates these risks through:

- sandboxing
- audit logging
- signatures
- deterministic execution
- validator suite
- inspector tools

---

# 12. Roadmap (Future MCP Versions)

- Hardening v2 governance
- Observability + Metrics MCP
- Distributed MCP (multi-region)
- Marketplace publishing pipeline
- AI-driven auto-hardening
- Autonomous MCP upgrade assistants

---

# 13. Summary

This document defines:

- the **official MCP features** (from Claude's spec)
- the **AI-BOS governance extensions**
- the **architectural requirements**
- the **security model**
- the **directory structure**
- the **developer rules**
- the **versioning and lifecycle**
- the **confidence protocol**
- the **inspector and validation requirements**

This is your **SSOT**.
Every MCP in AI-BOS must comply with this specification.

---

# 14. MCP Server Standards (Implementation Guide)

## 14.1 Package.json Requirements

All MCP servers **MUST** have:

```json
{
  "name": "@aibos/mcp-{name}",
  "version": "X.Y.Z",
  "type": "module",
  "description": "...",
  "main": "server.mjs",
  "scripts": {
    "start": "node server.mjs"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0"
  },
  "keywords": ["mcp", "...", "aibos"],
  "author": "AIBOS Platform",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

**Required Fields:**

- ✅ SDK version: `^1.22.0` (standardized)
- ✅ Engines: `node >=18.0.0`, `pnpm >=8.0.0`
- ✅ Package manager: `pnpm@8.15.0`
- ✅ Author: `"AIBOS Platform"`
- ✅ License: `"MIT"`
- ✅ Type: `"module"` (for ES modules)

## 14.2 Server Structure

All MCP servers **MUST** follow this structure:

```
.mcp/{server-name}/
├── server.mjs          # Main server implementation
├── package.json        # Dependencies and metadata
├── README.md          # Server-specific documentation
└── tools/             # Optional: CLI tools or utilities
    └── ...
```

## 14.3 Server Implementation Standards

### Required Imports

```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
```

### Required Server Setup

```javascript
const server = new Server(
  {
    name: "aibos-{name}",
    version: "X.Y.Z",
    description: "...",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Required Tool Handlers

```javascript
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "tool_name",
        description: "Tool description",
        inputSchema: {
          type: "object",
          properties: {
            // Define input schema
          },
          required: ["..."],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // Handle tool execution
});
```

## 14.4 Governance Metadata

All MCP servers **MUST** include governance metadata in responses:

```javascript
const GOVERNANCE_CONTEXT = {
  toolId: "aibos-{name}",
  domain: "{domain_name}",
  registryTable: "mdm_tool_registry",
};

function withGovernanceMetadata(payload, category, severity) {
  return {
    ...payload,
    governance: {
      ...GOVERNANCE_CONTEXT,
      category,
      severity,
    },
  };
}
```

**Required Fields:**

- ✅ `toolId` - Unique identifier for the tool
- ✅ `domain` - Domain/category (e.g., `ui_component_validation`)
- ✅ `registryTable` - Always `"mdm_tool_registry"`
- ✅ `category` - Issue category (e.g., `"accessibility"`, `"design-tokens"`)
- ✅ `severity` - `"error"` | `"warning"` | `"info"`

## 14.5 Error Handling

All tools **MUST** return structured error responses:

```javascript
try {
  // Tool logic
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
} catch (error) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: false,
            error: error.message,
            registryContext: GOVERNANCE_CONTEXT,
          },
          null,
          2
        ),
      },
    ],
    isError: true,
  };
}
```

## 14.6 Security Standards

### Path Validation

All file operations **MUST** validate paths:

```javascript
function validatePath(filePath) {
  const resolved = path.resolve(workspaceRoot, filePath);

  // Must be within allowed directory
  if (!resolved.startsWith(allowedDir)) {
    throw new Error("Path outside allowed directory");
  }

  // Prevent path traversal
  if (filePath.includes("..")) {
    throw new Error("Path traversal not allowed");
  }

  return resolved;
}
```

### Input Sanitization

All user inputs **MUST** be sanitized:

```javascript
function sanitizeInput(input) {
  // Remove potentially dangerous characters
  return input.replace(/[<>]/g, "").trim().substring(0, MAX_LENGTH);
}
```

### Rate Limiting

Tools that modify files **SHOULD** implement rate limiting:

```javascript
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(toolName) {
  // Implementation
}
```

### File Locking

Tools that modify files **SHOULD** implement file locking:

```javascript
const LOCK_FILE = path.join(workspaceRoot, ".mcp-{name}.lock");

async function acquireLock(lockId) {
  // Check for existing lock
  // Acquire lock
  // Return success/failure
}

async function releaseLock(lockId) {
  // Release lock
}
```

## 14.7 Performance Standards

### Caching

Servers **SHOULD** implement caching for expensive operations:

```javascript
const cache = new Map();

function getCached(key, computeFn) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const value = computeFn();
  cache.set(key, value);
  return value;
}
```

### AST Caching

Servers that parse code **SHOULD** cache ASTs:

```javascript
const astCache = new Map();

function getParsedFile(filePath) {
  if (astCache.has(filePath)) {
    return astCache.get(filePath);
  }
  const content = fs.readFileSync(filePath, "utf8");
  const ast = parse(content, PARSE_OPTIONS);
  astCache.set(filePath, { content, ast });
  return { content, ast };
}
```

---

# 15. Configuration Rules

## 15.1 MCP Configuration File

All servers **MUST** be registered in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-{name}": {
      "command": "node",
      "args": [".mcp/{name}/server.mjs"],
      "cwd": "."
    }
  }
}
```

## 15.2 Configuration Naming

- ✅ Use `aibos-{name}` format for internal servers
- ✅ Use descriptive names for external servers
- ✅ Keep names consistent with server directory names

## 15.3 Required Configuration

All servers **MUST** have:

- ✅ `command` - Command to run (usually `"node"`)
- ✅ `args` - Array of arguments (server file path)
- ✅ `cwd` - Working directory (usually `"."`)

## 15.4 Optional Configuration

Servers **MAY** have:

- `env` - Environment variables
- `permissions` - Command permissions (for shell MCP)

---

# 16. Development Process

## 16.1 Creating a New MCP Server

1. **Create Directory Structure:**

   ```bash
   mkdir -p .mcp/{server-name}
   cd .mcp/{server-name}
   ```

2. **Initialize Package:**

   ```bash
   pnpm init
   # Update package.json with required fields
   ```

3. **Install Dependencies:**

   ```bash
   pnpm add @modelcontextprotocol/sdk@^1.22.0
   ```

4. **Create Server:**

   ```bash
   touch server.mjs
   # Implement server following standards
   ```

5. **Create README:**

   ```bash
   touch README.md
   # Document server purpose, tools, usage
   ```

6. **Register in mcp.json:**

   ```json
   {
     "mcpServers": {
       "aibos-{name}": {
         "command": "node",
         "args": [".mcp/{name}/server.mjs"]
       }
     }
   }
   ```

7. **Test Server:**
   ```bash
   node server.mjs
   # Test via Cursor MCP
   ```

## 16.2 Updating an Existing Server

1. **Update Code:**
   - Make changes to `server.mjs`
   - Update version in `package.json`
   - Update `README.md` if needed

2. **Test Changes:**

   ```bash
   node server.mjs
   # Test via Cursor MCP
   ```

3. **Update Documentation:**
   - Update `.mcp/MCP_COMPARISON_TABLE.md` if tools change
   - Update `.mcp/README.md` if standards change

## 16.3 Versioning

- **Major (X.0.0):** Breaking changes to tool schemas
- **Minor (0.X.0):** New tools or features
- **Patch (0.0.X):** Bug fixes or documentation updates

---

# 17. Server List

## Internal Servers

| Server                      | Status    | Tools | Purpose                         |
| --------------------------- | --------- | ----- | ------------------------------- |
| `aibos-filesystem`          | ✅ Active | 4     | Optimized filesystem access     |
| `react-validation`          | ✅ Active | 4     | React component validation      |
| `aibos-theme`               | ✅ Active | 5     | Theme/token management          |
| `aibos-documentation`       | ✅ Active | 4     | Documentation automation        |
| `aibos-ui-generator`        | ✅ Active | 1     | UI generation from prompts      |
| `aibos-component-generator` | ✅ Active | 1     | Component generation (86 rules) |
| `aibos-a11y-validation`     | ✅ Active | 2     | Accessibility validation        |

## External Servers

| Server          | Status    | Purpose                      |
| --------------- | --------- | ---------------------------- |
| `next-devtools` | ✅ Active | Next.js MCP integration      |
| `supabase`      | ✅ Active | Supabase database operations |
| `github`        | ✅ Active | GitHub repository operations |
| `git`           | ✅ Active | Git operations               |
| `shell`         | ✅ Active | Shell command execution      |
| `playwright`    | ✅ Active | Browser automation           |

**See [MCP_COMPARISON_TABLE.md](./MCP_COMPARISON_TABLE.md) for detailed comparison.**

---

# 18. Troubleshooting

## Server Not Loading

1. **Check Configuration:**

   ```bash
   cat .cursor/mcp.json
   # Verify server is configured
   ```

2. **Check Dependencies:**

   ```bash
   cd .mcp/{server-name}
   pnpm install
   ```

3. **Test Server Directly:**

   ```bash
   node server.mjs
   # Should start without errors
   ```

4. **Check Logs:**
   - Check Cursor MCP logs
   - Check server console output

## Tool Not Available

1. **Verify Tool Registration:**
   - Check `ListToolsRequestSchema` handler
   - Verify tool name matches

2. **Check Tool Schema:**
   - Verify `inputSchema` is correct
   - Check required fields

3. **Test Tool Directly:**
   ```javascript
   // In server.mjs, add test call
   const result = await handleToolCall({
     name: "tool_name",
     arguments: {
       /* test args */
     },
   });
   ```

## Performance Issues

1. **Enable Caching:**
   - Add AST caching for code parsing
   - Add file content caching

2. **Optimize Operations:**
   - Batch file operations
   - Use streaming for large files

3. **Monitor Resource Usage:**
   - Check memory usage
   - Check CPU usage

---

# 19. Related Documentation

- [MCP Comparison Table](./MCP_COMPARISON_TABLE.md) - Detailed server comparison
- [MCP Workflow](./MCP_WORKFLOW.md) - Usage workflows
- [Package Standardization](./PACKAGE_STANDARDIZATION.md) - Package.json standards
- [Documentation MCP](../.mcp/documentation/README.md) - Documentation server
- [React MCP](../.mcp/react/README.md) - React validation server
- [Theme MCP](../.mcp/theme/README.md) - Theme server

---

# 20. Best Practices

## ✅ Do

- ✅ Follow all standards in this document
- ✅ Include governance metadata in all responses
- ✅ Implement proper error handling
- ✅ Validate all inputs
- ✅ Document all tools in README
- ✅ Test servers before committing
- ✅ Update comparison table when adding tools

## ❌ Don't

- ❌ Skip governance metadata
- ❌ Bypass input validation
- ❌ Use arbitrary SDK versions
- ❌ Create servers without README
- ❌ Skip error handling
- ❌ Hardcode paths or credentials

---

**Last Updated:** 2025-11-26  
**Maintained By:** AI-BOS MCP Team  
**Version:** 1.0.0
