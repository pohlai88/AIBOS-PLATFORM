# MCP Framework Guidelines & Integration Guide

> **Source:** Compiled from official MCP specification, GitHub repositories, and community best practices  
> **Last Updated:** 2025-11-29  
> **Status:** Active Guidelines for AI-BOS Platform

---

## 📋 Table of Contents

1. [Official MCP Resources](#official-mcp-resources)
2. [Framework Guidelines](#framework-guidelines)
3. [Integration Patterns](#integration-patterns)
4. [Server Development Standards](#server-development-standards)
5. [Client Integration Guide](#client-integration-guide)
6. [Transport Protocols](#transport-protocols)
7. [Security & Authentication](#security--authentication)
8. [Testing & Validation](#testing--validation)
9. [Deployment Best Practices](#deployment-best-practices)

---

## 🔗 Official MCP Resources

### Primary Sources

1. **Official Specification Repository**
   - **GitHub:** [modelcontextprotocol/modelcontextprotocol](https://github.com/modelcontextprotocol/modelcontextprotocol)
   - **Documentation:** [modelcontextprotocol.io](https://modelcontextprotocol.io)
   - **Schema:** TypeScript definitions in `schema/2025-06-18/schema.ts`
   - **JSON Schema:** Available at `schema/2025-06-18/schema.json`

2. **Official Servers Repository**
   - **GitHub:** [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
   - **Reference Implementations:** Filesystem, Git, Memory, Sequential Thinking, Time
   - **Community Servers:** 500+ community-built servers listed

3. **Official SDKs**
   - **TypeScript:** [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
   - **Python:** [mcp](https://github.com/modelcontextprotocol/python-sdk)
   - **Go:** [go-sdk](https://github.com/modelcontextprotocol/go-sdk)
   - **Rust:** [rust-sdk](https://github.com/modelcontextprotocol/rust-sdk)
   - **Java:** [java-sdk](https://github.com/modelcontextprotocol/java-sdk)
   - **C#:** [csharp-sdk](https://github.com/modelcontextprotocol/csharp-sdk)
   - **Swift:** [swift-sdk](https://github.com/modelcontextprotocol/swift-sdk)
   - **Ruby:** [ruby-sdk](https://github.com/modelcontextprotocol/ruby-sdk)
   - **PHP:** [php-sdk](https://github.com/modelcontextprotocol/php-sdk)
   - **Kotlin:** [kotlin-sdk](https://github.com/modelcontextprotocol/kotlin-sdk)

---

## 📐 Framework Guidelines

### 1. **Core MCP Concepts**

#### Protocol Components

MCP consists of three main component types:

1. **Tools** - Actions that can be performed

   ```typescript
   {
     name: "tool_name",
     description: "What the tool does",
     inputSchema: {
       type: "object",
       properties: { ... },
       required: [ ... ]
     }
   }
   ```

2. **Resources** - Data that can be accessed

   ```typescript
   {
     uri: "resource://identifier",
     name: "Resource Name",
     description: "What the resource contains",
     mimeType: "application/json"
   }
   ```

3. **Prompts** - Templates for AI interactions
   ```typescript
   {
     name: "prompt_name",
     description: "When to use this prompt",
     arguments: [
       { name: "arg1", description: "...", required: true }
     ]
   }
   ```

### 2. **Server Architecture Patterns**

#### Standard Server Structure

```
.mcp/{server-name}/
├── server.mjs          # Main server file
├── package.json        # Dependencies & metadata
├── README.md           # Documentation
├── tools/              # Tool implementations (optional)
├── resources/          # Resource handlers (optional)
└── prompts/           # Prompt templates (optional)
```

#### Required Package.json Fields

```json
{
  "name": "@aibos/mcp-{name}",
  "version": "X.Y.Z",
  "type": "module",
  "description": "Clear description of server purpose",
  "main": "server.mjs",
  "scripts": {
    "start": "node server.mjs"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

### 3. **Tool Design Patterns**

#### ✅ Good Tool Design

```typescript
// Clear, descriptive name
{
  name: "validate_react_component",
  description: "Validates React component for RSC compliance and best practices",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Path to React component file (relative to workspace root)"
      },
      componentName: {
        type: "string",
        description: "Name of the component to validate"
      }
    },
    required: ["filePath", "componentName"]
  }
}
```

#### ❌ Bad Tool Design

```typescript
// Vague, unclear
{
  name: "validate",
  description: "Validates stuff",
  inputSchema: {
    type: "object",
    properties: {
      data: { type: "string" }
    }
  }
}
```

### 4. **Error Handling Standards**

#### Structured Error Responses

```typescript
try {
  const result = await performAction();
  return {
    success: true,
    data: result,
    metadata: {
      timestamp: new Date().toISOString(),
      server: "aibos-validation",
      version: "1.0.0",
    },
  };
} catch (error) {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code || "UNKNOWN_ERROR",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      server: "aibos-validation",
    },
  };
}
```

---

## 🔌 Integration Patterns

### 1. **Server-to-Client Integration**

#### Cursor IDE Configuration

```json
{
  "mcpServers": {
    "aibos-{name}": {
      "command": "node",
      "args": [".mcp/{name}/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    }
  }
}
```

#### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "aibos-{name}": {
      "command": "node",
      "args": [".mcp/{name}/server.mjs"],
      "cwd": "/path/to/workspace"
    }
  }
}
```

### 2. **Multi-Server Orchestration**

#### Pattern: Sequential Validation

```typescript
// Validate component across multiple MCP servers
async function validateComponent(filePath: string) {
  // 1. React validation
  const reactResult = await mcp_React_validate_react_component({
    filePath,
    componentName: extractComponentName(filePath),
  });

  // 2. Convention validation
  const conventionResult = await mcp_Convention_validate_naming({
    filePath,
    componentName: extractComponentName(filePath),
  });

  // 3. A11y validation
  const a11yResult = await mcp_A11y_validate_accessibility({
    filePath,
  });

  // Combine results
  return {
    react: reactResult,
    conventions: conventionResult,
    a11y: a11yResult,
    allValid: reactResult.valid && conventionResult.valid && a11yResult.valid,
  };
}
```

#### Pattern: Resource Chaining

```typescript
// Chain resources from multiple servers
async function getComponentContext(componentName: string) {
  // 1. Get design from Figma
  const design = await mcp_Figma_get_design_context({
    fileKey: FIGMA_FILE_KEY,
    nodeId: findNodeId(componentName),
  });

  // 2. Get tokens from theme server
  const tokens = await mcp_Theme_get_theme_tokens({
    category: "components",
    component: componentName,
  });

  // 3. Get documentation
  const docs = await mcp_Documentation_get_component_docs({
    componentName,
  });

  return { design, tokens, docs };
}
```

### 3. **Client-Side Integration**

#### TypeScript Client Pattern

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: [".mcp/validation/server.mjs"],
  cwd: process.cwd(),
});

const client = new Client(
  {
    name: "validation-client",
    version: "1.0.0",
  },
  {
    capabilities: {},
  }
);

await client.connect(transport);

// Call tool
const result = await client.callTool({
  name: "validate_component",
  arguments: {
    filePath: "src/components/Button.tsx",
    componentName: "Button",
  },
});
```

---

## 🛠️ Server Development Standards

### 1. **SDK Version Standardization**

**✅ Standardized Version:**

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0"
  }
}
```

**Best Practices:**

- ✅ Use consistent SDK version across all servers
- ✅ Pin to specific version in production
- ✅ Test after SDK updates
- ✅ Use `pnpm -w run deps:fix` to sync versions

### 2. **Server Implementation Template**

#### TypeScript/JavaScript Template

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "aibos-{name}",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "tool_name",
      description: "Tool description",
      inputSchema: {
        type: "object",
        properties: {
          // Define properties
        },
        required: [],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "tool_name":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(await handleTool(args)),
          },
        ],
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio");
}

main().catch(console.error);
```

### 3. **Resource Implementation**

```typescript
// Register resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "resource://theme/tokens",
      name: "Theme Tokens",
      description: "Design system tokens",
      mimeType: "application/json",
    },
  ],
}));

// Handle resource requests
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "resource://theme/tokens") {
    const tokens = await loadThemeTokens();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(tokens, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});
```

### 4. **Prompt Implementation**

```typescript
// Register prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: "generate_component",
      description: "Generate a React component from design specs",
      arguments: [
        {
          name: "componentName",
          description: "Name of the component",
          required: true,
        },
        {
          name: "designSpec",
          description: "Design specification from Figma",
          required: true,
        },
      ],
    },
  ],
}));

// Handle prompt requests
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "generate_component") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a React component named ${args.componentName} based on this design: ${args.designSpec}`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});
```

---

## 🔌 Client Integration Guide

### 1. **Cursor IDE Integration**

#### Configuration File: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "aibos-react": {
      "command": "node",
      "args": [".mcp/react/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    },
    "aibos-theme": {
      "command": "node",
      "args": [".mcp/theme/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    }
  }
}
```

#### Verification Steps

1. ✅ Check server file exists
2. ✅ Verify `cwd` is absolute path
3. ✅ Ensure dependencies installed
4. ✅ Restart Cursor IDE
5. ✅ Check MCP status in Cursor

### 2. **Claude Desktop Integration**

#### Configuration File: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "aibos-validation": {
      "command": "node",
      "args": [".mcp/validation/server.mjs"],
      "cwd": "/path/to/workspace"
    }
  }
}
```

### 3. **Programmatic Client Integration**

#### Node.js Client Example

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function createMCPClient(serverPath: string) {
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
    cwd: process.cwd(),
  });

  const client = new Client(
    {
      name: "aibos-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  return client;
}

// Usage
const client = await createMCPClient(".mcp/validation/server.mjs");
const result = await client.callTool({
  name: "validate_component",
  arguments: { filePath: "src/Button.tsx" },
});
```

---

## 📡 Transport Protocols

### 1. **STDIO Transport (Standard)**

**Use Case:** Local servers, development

```json
{
  "command": "node",
  "args": [".mcp/server/server.mjs"],
  "cwd": "/workspace"
}
```

**Pros:**

- ✅ Simple setup
- ✅ No network configuration
- ✅ Works offline
- ✅ Secure (local only)

**Cons:**

- ❌ One connection per server
- ❌ No remote access

### 2. **SSE (Server-Sent Events) Transport**

**Use Case:** Remote servers, production

```json
{
  "url": "https://mcp.example.com/sse"
}
```

**Pros:**

- ✅ Remote access
- ✅ Multiple clients
- ✅ Real-time updates

**Cons:**

- ❌ Requires network
- ❌ More complex setup
- ❌ Authentication needed

### 3. **Streamable HTTP Transport**

**Use Case:** Remote servers with streaming

```json
{
  "url": "https://mcp.example.com/http",
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

**Pros:**

- ✅ Standard HTTP
- ✅ Easy to proxy
- ✅ Supports streaming

**Cons:**

- ❌ Requires network
- ❌ Authentication needed

---

## 🔒 Security & Authentication

### 1. **Credential Management**

#### ✅ DO:

- Store API keys in environment variables
- Use secure vaults (Azure Key Vault, AWS Secrets Manager)
- Rotate credentials regularly
- Never commit secrets to version control

#### ❌ DON'T:

- Hardcode credentials in server files
- Store secrets in `mcp.json`
- Share credentials in documentation

### 2. **OAuth 2.0 Integration**

```typescript
// OAuth 2.0 flow for external services
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "authenticate") {
    // Initiate OAuth flow
    const authUrl = generateOAuthUrl();
    return {
      content: [
        {
          type: "text",
          text: `Please visit ${authUrl} to authenticate`,
        },
      ],
    };
  }
});
```

### 3. **Access Control**

#### Principle of Least Privilege

```json
{
  "shell": {
    "command": "npx",
    "args": ["-y", "mcp-shell@latest"],
    "permissions": {
      "allowedCommands": ["pnpm install", "pnpm run lint", "pnpm run build"]
    }
  }
}
```

---

## 🧪 Testing & Validation

### 1. **Unit Testing**

```typescript
import { describe, it, expect } from "vitest";
import { validateComponent } from "./server.mjs";

describe("Component Validation", () => {
  it("should validate React component", async () => {
    const result = await validateComponent({
      filePath: "test/Button.tsx",
      componentName: "Button",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### 2. **Integration Testing**

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

describe("MCP Server Integration", () => {
  it("should respond to tool calls", async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: "validate_component",
      arguments: { filePath: "test/Button.tsx" },
    });

    expect(result.content[0].type).toBe("text");
  });
});
```

### 3. **Validation Checklist**

- [ ] Server starts without errors
- [ ] All tools are registered
- [ ] Resources are accessible
- [ ] Prompts return valid messages
- [ ] Error handling works correctly
- [ ] Authentication flows work
- [ ] Performance is acceptable

---

## 🚀 Deployment Best Practices

### 1. **Local Development**

```bash
# Install dependencies
cd .mcp/{server-name}
pnpm install

# Test server
node server.mjs

# Verify in Cursor
# Check MCP status in Cursor settings
```

### 2. **Production Deployment**

#### Docker Container

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

CMD ["node", "server.mjs"]
```

#### Environment Variables

```bash
# .env.example
MCP_SERVER_PORT=3000
API_KEY=your-api-key
DATABASE_URL=postgresql://...
```

### 3. **Monitoring & Logging**

```typescript
// Structured logging
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  logger.info("Tool called", {
    tool: request.params.name,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await handleTool(request.params);
    logger.info("Tool succeeded", { tool: request.params.name });
    return result;
  } catch (error) {
    logger.error("Tool failed", {
      tool: request.params.name,
      error: error.message,
    });
    throw error;
  }
});
```

---

## 📚 Official Documentation References

### Specification Documents

1. **Protocol Specification**
   - **URL:** [modelcontextprotocol.io/specification](https://modelcontextprotocol.io/specification)
   - **GitHub:** `modelcontextprotocol/modelcontextprotocol/docs/specification/`

2. **SDK Documentation**
   - **TypeScript:** [GitHub - typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
   - **Python:** [GitHub - python-sdk](https://github.com/modelcontextprotocol/python-sdk)
   - **All SDKs:** [modelcontextprotocol.io/sdk](https://modelcontextprotocol.io/sdk)

3. **Tutorials**
   - **URL:** [modelcontextprotocol.io/tutorials](https://modelcontextprotocol.io/tutorials)
   - **GitHub:** `modelcontextprotocol/modelcontextprotocol/docs/tutorials/`

### Community Resources

1. **Awesome MCP Lists**
   - [Awesome MCP Servers by punkpeye](https://glama.ai/mcp/servers)
   - [Awesome MCP Servers by wong2](https://mcpservers.org)
   - [Awesome Remote MCP Servers](https://github.com/jaw9c/awesome-remote-mcp-servers)

2. **MCP Registries**
   - [MCP Registry](https://registry.modelcontextprotocol.io/)
   - [Smithery](https://smithery.ai/)
   - [MCPHub](https://www.mcphub.com)

3. **Community Forums**
   - [GitHub Discussions](https://github.com/orgs/modelcontextprotocol/discussions)
   - [Discord Server](https://glama.ai/mcp/discord)
   - [Reddit r/mcp](https://www.reddit.com/r/mcp)

---

## 🎯 AI-BOS Platform Specific Guidelines

### 1. **Naming Conventions**

- ✅ Use `aibos-{name}` format for internal servers
- ✅ Keep names consistent with directory names
- ✅ Use descriptive, clear names

### 2. **File Structure**

```
.mcp/{server-name}/
├── server.mjs          # Main server (required)
├── package.json        # Dependencies (required)
├── README.md           # Documentation (required)
├── tools/              # Tool implementations (optional)
├── resources/          # Resource handlers (optional)
└── prompts/           # Prompt templates (optional)
```

### 3. **Configuration Requirements**

```json
{
  "mcpServers": {
    "aibos-{name}": {
      "command": "node",
      "args": [".mcp/{name}/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM" // Absolute path required!
    }
  }
}
```

### 4. **Version Management**

- ✅ Use semantic versioning (MAJOR.MINOR.PATCH)
- ✅ Update version in `package.json`
- ✅ Document changes in README
- ✅ Sync versions with `pnpm -w run deps:fix`

---

## ✅ Quick Reference Checklist

### For New MCP Server:

- [ ] Created directory structure
- [ ] Initialized `package.json` with required fields
- [ ] Installed `@modelcontextprotocol/sdk@^1.22.0`
- [ ] Implemented `server.mjs` with tools/resources/prompts
- [ ] Added comprehensive `README.md`
- [ ] Registered in `.cursor/mcp.json` with correct `cwd`
- [ ] Tested server startup
- [ ] Verified tools work in Cursor
- [ ] Added error handling
- [ ] Implemented logging
- [ ] Documented all tools/resources/prompts

### For Integration:

- [ ] Verified server file exists
- [ ] Checked `cwd` is absolute path
- [ ] Confirmed dependencies installed
- [ ] Tested server independently
- [ ] Verified in Cursor MCP status
- [ ] Tested tool calls
- [ ] Validated error handling
- [ ] Checked performance

---

## 📖 Additional Resources

### Official Documentation

- [MCP Specification](https://modelcontextprotocol.io/specification)
- [MCP Tutorials](https://modelcontextprotocol.io/tutorials)
- [MCP SDK Documentation](https://modelcontextprotocol.io/sdk)
- [MCP Examples](https://modelcontextprotocol.io/examples)

### AI-BOS Platform Resources

- [MCP Orchestration & AI Relationships](./MCP_ORCHESTRATION_AND_AI_RELATIONSHIPS.md) - **How to establish relationships between orchestration, agentic AI, generative AI, and MCP**
- [MCP Best Practices](./MCP_BEST_PRACTICES.md)
- [MCP Configuration Guide](../01-foundation/conventions/MCP_CONFIGURATION_GUIDE.md)
- [MCP Governance Guide](../01-foundation/conventions/MCP_GOVERNANCE_GUIDE.md)
- [MCP Integration Guide](./MCP_INTEGRATION_GUIDE.md)
- [MCP Server Standards](../../.mcp/README.md)

### GitHub Repositories

- [Official Specification](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [Official Servers](https://github.com/modelcontextprotocol/servers)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)

---

**Last Updated:** 2025-11-29  
**Maintained By:** AI-BOS Platform Team  
**Status:** ✅ Active Framework Guidelines
