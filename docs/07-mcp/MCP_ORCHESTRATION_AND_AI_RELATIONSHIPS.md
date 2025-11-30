# MCP Orchestration & AI Relationships Guide

> **Source:** Compiled from GitHub IDE best practices, official MCP documentation, orchestration frameworks, and AI-BOS platform architecture  
> **Last Updated:** 2025-11-29  
> **Status:** Active Guidelines for Establishing AI Orchestration with MCP

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Concepts & Definitions](#core-concepts--definitions)
3. [Relationship Framework](#relationship-framework)
4. [Establishing Relationships](#establishing-relationships)
5. [Architecture Patterns](#architecture-patterns)
6. [Implementation Guide](#implementation-guide)
7. [Best Practices](#best-practices)
8. [Real-World Examples](#real-world-examples)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Executive Summary

This guide explains how to establish and manage the relationships between **Orchestration**, **Agentic AI**, **Generative AI**, and the **Model Context Protocol (MCP)**. These four components form a cohesive ecosystem where:

- **Orchestration** coordinates multiple AI agents and workflows
- **Agentic AI** provides autonomous decision-making and action execution
- **Generative AI** produces new content (code, designs, documentation)
- **MCP** standardizes communication and context sharing between all components

**Key Insight:** MCP acts as the **communication backbone** that enables seamless integration between orchestration frameworks, agentic systems, and generative models, creating a unified AI development platform.

---

## 📚 Core Concepts & Definitions

### 1. **Orchestration (Orchestra)**

**Definition:** A framework or system that coordinates, manages, and supervises multiple AI agents, tools, and workflows to achieve complex objectives.

**Key Characteristics:**

- **Task Decomposition:** Breaks complex tasks into smaller, manageable subtasks
- **Agent Routing:** Directs tasks to appropriate specialized agents
- **Workflow Coordination:** Manages sequential and parallel execution
- **Quality Gates:** Enforces validation, testing, and compliance checks
- **State Management:** Tracks progress, maintains context, and handles failures

**Examples:**

- LangGraph supervisor pattern
- FastAPI-based orchestrators
- YAML-based workflow engines
- Multi-agent coordination frameworks

**In AI-BOS Platform:**

```yaml
orchestrator:
  name: "frontend-orchestrator"
  pattern: "supervisor_worker" # LangGraph supervisor pattern
  layers:
    - L1: Supervisor (routes tasks, enforces gates)
    - L2: Workers (specialized agents)
    - L3: Tools (MCP servers)
    - L4: Reality (Next.js app, design tokens)
```

### 2. **Agentic AI**

**Definition:** AI systems that operate autonomously, making decisions and taking actions to achieve specific goals without constant human intervention.

**Key Characteristics:**

- **Autonomy:** Can make decisions independently
- **Goal-Oriented:** Works toward specific objectives
- **Tool Usage:** Interacts with external tools and APIs
- **Context Awareness:** Maintains understanding of environment and state
- **Adaptability:** Adjusts behavior based on feedback and results

**Agent Types:**

- **Specialized Agents:** Focus on specific domains (UI/UX, frontend, testing)
- **General Agents:** Handle broad tasks across multiple domains
- **Supervisor Agents:** Coordinate and route tasks to other agents

**In AI-BOS Platform:**

```yaml
agents:
  - id: "Lynx.UIUXEngineer"
    role: "Designs component API and UX flows using design tokens"
    capabilities:
      - "ui_design"
      - "layout_creation"
      - "token_validation"
    mcp_tools:
      - "tokens.mcp"
      - "design-system.mcp"
```

### 3. **Generative AI**

**Definition:** AI models capable of producing new content (code, text, images, designs) based on training data and context.

**Key Characteristics:**

- **Content Creation:** Generates new artifacts from scratch
- **Context-Driven:** Uses provided context to inform generation
- **Iterative Refinement:** Can improve outputs based on feedback
- **Multi-Modal:** Can generate different types of content (code, text, images)

**Use Cases:**

- Code generation (React components, TypeScript functions)
- Documentation writing
- Design token creation
- Test case generation
- Content creation

**In AI-BOS Platform:**

- Component generation via `aibos-component-generator` MCP server
- UI generation via `aibos-ui-generator` MCP server
- Documentation generation via `aibos-documentation` MCP server

### 4. **Model Context Protocol (MCP)**

**Definition:** A standardized protocol that enables AI assistants to interact with external tools, data sources, and services through a unified interface.

**Key Characteristics:**

- **Standardized Interface:** All tools follow the same protocol
- **Type Safety:** Tools have defined input/output schemas
- **Extensibility:** Easy to add new capabilities
- **Security:** Controlled access with validation and rate limiting
- **Interoperability:** Works across different AI systems and frameworks

**MCP Components:**

- **Tools:** Actions that can be performed (e.g., `validate_react_component`)
- **Resources:** Data that can be accessed (e.g., `resource://theme/tokens`)
- **Prompts:** Templates for AI interactions (e.g., `generate_component`)

**In AI-BOS Platform:**

```json
{
  "mcpServers": {
    "aibos-react": {
      "command": "node",
      "args": [".mcp/react/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    }
  }
}
```

---

## 🔗 Relationship Framework

### The Four-Layer Relationship Model

```
┌─────────────────────────────────────────────────────────┐
│                    ORCHESTRATION                        │
│  (Coordinates, Routes, Manages Workflows)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Uses & Coordinates
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐        ┌──────────────────┐
│  AGENTIC AI   │        │  GENERATIVE AI    │
│  (Autonomous  │        │  (Content         │
│   Decision-   │        │   Generation)     │
│   Making)      │        │                   │
└───────┬───────┘        └─────────┬─────────┘
        │                          │
        │                          │
        │ Both Use                 │
        │                          │
        └──────────┬───────────────┘
                   │
                   │ Standardized Interface
                   │
                   ▼
        ┌──────────────────────┐
        │   MCP (Protocol)      │
        │  (Tools, Resources,   │
        │   Prompts)            │
        └──────────────────────┘
```

### Relationship Descriptions

#### 1. **Orchestration ↔ Agentic AI**

**Relationship:** Orchestration manages and coordinates agentic AI systems.

**How It Works:**

- Orchestrator breaks down complex tasks into subtasks
- Routes subtasks to appropriate specialized agents
- Monitors agent progress and handles failures
- Aggregates results from multiple agents
- Enforces quality gates and compliance

**Example:**

```python
# Orchestrator routes task to agent
task = {
    "type": "create_component",
    "component_name": "Button",
    "design_spec": {...}
}

# Orchestrator selects appropriate agent
agent = orchestrator.select_agent(task)
# → Routes to "Lynx.UIUXEngineer" for design
# → Routes to "Lynx.FrontendImplementor" for implementation

# Agent executes autonomously
result = await agent.execute(task)
```

#### 2. **Orchestration ↔ Generative AI**

**Relationship:** Orchestration coordinates generative AI models to produce content.

**How It Works:**

- Orchestrator provides context and requirements to generative models
- Manages generation workflows (iterative refinement)
- Validates and quality-checks generated content
- Coordinates multiple generation steps (design → code → tests)

**Example:**

```python
# Orchestrator coordinates generation workflow
workflow = [
    {"step": "generate_design", "model": "dalle-3"},
    {"step": "generate_code", "model": "gpt-4"},
    {"step": "generate_tests", "model": "gpt-4"}
]

for step in workflow:
    context = orchestrator.get_context(step)
    generated = await generative_ai.generate(step, context)
    orchestrator.validate(generated)
```

#### 3. **Agentic AI ↔ Generative AI**

**Relationship:** Agentic AI systems use generative AI models to create content as part of their autonomous operations.

**How It Works:**

- Agents call generative models when they need to create content
- Agents provide context and requirements to generative models
- Agents validate and refine generated content
- Agents use generated content to complete their objectives

**Example:**

```typescript
// Agent uses generative AI to create component
class UIUXEngineerAgent {
  async createComponent(spec: DesignSpec) {
    // Agent decides to generate component code
    const prompt = this.buildPrompt(spec);

    // Calls generative AI via MCP
    const generated = await mcp_generator.generate_component({
      prompt,
      componentName: spec.name,
      designTokens: spec.tokens,
    });

    // Agent validates and refines
    const validated = await this.validate(generated);
    return validated;
  }
}
```

#### 4. **MCP as the Communication Backbone**

**Relationship:** MCP provides standardized interfaces for all components to communicate.

**How It Works:**

- **Orchestration → MCP:** Orchestrator uses MCP tools to coordinate agents and access resources
- **Agentic AI → MCP:** Agents use MCP tools to perform actions and access data
- **Generative AI → MCP:** Generative models use MCP prompts and resources for context
- **MCP → Reality:** MCP tools interact with actual systems (filesystem, APIs, databases)

**Example:**

```typescript
// All components use MCP for standardized communication

// Orchestrator uses MCP to route tasks
const taskContext = await mcp_filesystem.read_file({
  path: "task-spec.json",
});

// Agent uses MCP to perform actions
const validation = await mcp_react.validate_react_component({
  filePath: "Button.tsx",
});

// Generative AI uses MCP for context
const designTokens = await mcp_theme.get_theme_tokens({
  category: "components",
});
```

---

## 🏗️ Establishing Relationships

### Step 1: Define Orchestration Layer

**Objective:** Set up the orchestrator that will coordinate all AI systems.

**Implementation:**

```yaml
# orchestrator.frontend.yaml
orchestrator:
  name: "frontend-orchestrator"
  pattern: "supervisor_worker"
  framework: "langgraph"

  # Define how orchestrator coordinates agents
  coordination:
    task_decomposition: true
    agent_routing: "capability_based"
    quality_gates: true
    state_management: "redis"

  # Define orchestrator's access to MCP
  mcp_permissions:
    allowed_servers:
      - "next-devtools" # For route discovery
      - "aibos-filesystem" # For file operations
    denied_servers:
      - "git" # Orchestrator doesn't commit directly
```

**Key Points:**

- Orchestrator should have **read-only** access to most MCP servers
- Orchestrator uses MCP primarily for **context gathering** and **coordination**
- Orchestrator delegates **action execution** to agents

### Step 2: Configure Agentic AI Systems

**Objective:** Set up specialized agents that can autonomously execute tasks.

**Implementation:**

```yaml
# agents.frontend.yaml
agents:
  - id: "uiux_engineer"
    role: "Designs component API and UX flows"
    capabilities:
      - "ui_design"
      - "layout_creation"
      - "token_validation"

    # Agent's access to MCP tools
    mcp_permissions:
      allowed_servers:
        - "aibos-theme" # For design tokens
        - "aibos-filesystem" # For reading/writing files
        - "aibos-component-generator" # For generating components
      denied_servers:
        - "git" # Agent doesn't commit
        - "shell" # Agent doesn't run shell commands

    # Agent's access to generative AI
    generative_ai:
      enabled: true
      models:
        - "gpt-4" # For code generation
        - "claude-3.5" # For design reasoning
      mcp_tools:
        - "aibos-ui-generator" # MCP server that wraps generative AI
```

**Key Points:**

- Agents have **specific, limited** MCP tool access (principle of least privilege)
- Agents use **generative AI via MCP** to create content
- Agents are **autonomous** but operate within defined boundaries

### Step 3: Integrate Generative AI Models

**Objective:** Connect generative AI models to the system via MCP servers.

**Implementation:**

```typescript
// .mcp/ui-generator/server.mjs
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const server = new Server(
  {
    name: "aibos-ui-generator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// Expose generative AI as MCP tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_component",
      description: "Generates React component code using GPT-4",
      inputSchema: {
        type: "object",
        properties: {
          componentName: { type: "string" },
          designSpec: { type: "object" },
          designTokens: { type: "object" },
        },
        required: ["componentName", "designSpec"],
      },
    },
  ],
}));

// Handle generation requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generate_component") {
    // Call generative AI model
    const generated = await callGPT4({
      prompt: buildComponentPrompt(request.params.arguments),
      model: "gpt-4",
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(generated),
        },
      ],
    };
  }
});
```

**Key Points:**

- Generative AI is **wrapped in MCP servers** for standardized access
- MCP servers provide **type-safe interfaces** to generative models
- Generative AI can access **MCP resources** for context (design tokens, documentation)

### Step 4: Connect Components via MCP

**Objective:** Establish MCP as the communication protocol between all components.

**Implementation:**

```typescript
// Orchestrator uses MCP to coordinate
class FrontendOrchestrator {
  async executeTask(task: Task) {
    // 1. Get context via MCP resources
    const designTokens = await mcp_theme.get_theme_tokens();
    const existingComponents = await mcp_filesystem.list_directory({
      path: "apps/web/components",
    });

    // 2. Route to agent via MCP
    const agent = this.selectAgent(task);
    const agentResult = await agent.execute(task, {
      designTokens,
      existingComponents,
    });

    // 3. Validate via MCP tools
    const validation = await mcp_react.validate_react_component({
      filePath: agentResult.filePath,
    });

    // 4. Quality gate via MCP
    if (!validation.valid) {
      await this.handleValidationFailure(validation);
    }

    return agentResult;
  }
}

// Agent uses MCP to perform actions
class UIUXEngineerAgent {
  async createComponent(spec: DesignSpec) {
    // 1. Get design tokens via MCP
    const tokens = await mcp_theme.get_theme_tokens({
      category: "components",
    });

    // 2. Generate component via MCP (which uses generative AI)
    const generated = await mcp_ui_generator.generate_component({
      componentName: spec.name,
      designSpec: spec,
      designTokens: tokens,
    });

    // 3. Write file via MCP
    await mcp_filesystem.write_file({
      path: `apps/web/components/${spec.name}.tsx`,
      contents: generated.code,
    });

    return { filePath: `apps/web/components/${spec.name}.tsx` };
  }
}
```

**Key Points:**

- **All communication** goes through MCP (no direct API calls)
- MCP provides **standardized interfaces** for all interactions
- Components are **loosely coupled** via MCP protocol

---

## 🏛️ Architecture Patterns

### Pattern 1: Supervisor-Worker with MCP Tools

**Description:** Orchestrator (supervisor) routes tasks to specialized agents (workers), all using MCP for communication.

**Architecture:**

```
Orchestrator (Supervisor)
    │
    ├─→ Routes task to Agent A
    │       │
    │       └─→ Uses MCP Tools
    │               ├─→ mcp_theme (resources)
    │               ├─→ mcp_generator (generative AI)
    │               └─→ mcp_filesystem (tools)
    │
    └─→ Routes task to Agent B
            │
            └─→ Uses MCP Tools
                    ├─→ mcp_react (validation)
                    └─→ mcp_a11y (accessibility)
```

**Implementation:**

```python
# Python orchestrator (LangGraph)
from langgraph.graph import StateGraph

def create_orchestrator():
    graph = StateGraph(AgentState)

    # Supervisor node
    graph.add_node("supervisor", supervisor_node)

    # Worker nodes (agents)
    graph.add_node("uiux_agent", uiux_agent_node)
    graph.add_node("frontend_agent", frontend_agent_node)

    # Routing logic
    graph.add_conditional_edges(
        "supervisor",
        route_to_agent,  # Routes based on task type
        {
            "uiux": "uiux_agent",
            "frontend": "frontend_agent"
        }
    )

    return graph.compile()
```

### Pattern 2: Generative AI as MCP Service

**Description:** Generative AI models are exposed as MCP servers, making them accessible to orchestrators and agents.

**Architecture:**

```
Agent/Orchestrator
    │
    └─→ Calls MCP Tool
            │
            └─→ MCP Server (aibos-ui-generator)
                    │
                    └─→ Generative AI Model (GPT-4/Claude)
                            │
                            └─→ Returns Generated Content
```

**Implementation:**

```typescript
// MCP server wraps generative AI
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generate_component") {
    const { componentName, designSpec, designTokens } =
      request.params.arguments;

    // Call generative AI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a React component generator...",
        },
        {
          role: "user",
          content: buildPrompt(componentName, designSpec, designTokens),
        },
      ],
    });

    return {
      content: [
        {
          type: "text",
          text: response.choices[0].message.content,
        },
      ],
    };
  }
});
```

### Pattern 3: Multi-Agent Collaboration via MCP

**Description:** Multiple agents collaborate on a task, sharing context and results via MCP resources.

**Architecture:**

```
Task: Create Component
    │
    ├─→ Agent 1 (UI/UX Engineer)
    │       │
    │       ├─→ Uses mcp_theme (reads design tokens)
    │       ├─→ Uses mcp_generator (generates design)
    │       └─→ Writes to mcp_filesystem (saves design spec)
    │
    └─→ Agent 2 (Frontend Implementor)
            │
            ├─→ Uses mcp_filesystem (reads design spec from Agent 1)
            ├─→ Uses mcp_generator (generates code)
            ├─→ Uses mcp_react (validates code)
            └─→ Writes to mcp_filesystem (saves component)
```

**Implementation:**

```typescript
// Agent 1: UI/UX Engineer
async function uiuxAgent(task: Task) {
  // Get design tokens
  const tokens = await mcp_theme.get_theme_tokens();

  // Generate design
  const design = await mcp_ui_generator.generate_design({
    componentName: task.componentName,
    tokens,
  });

  // Save design spec
  await mcp_filesystem.write_file({
    path: `designs/${task.componentName}.json`,
    contents: JSON.stringify(design),
  });

  return { designSpecPath: `designs/${task.componentName}.json` };
}

// Agent 2: Frontend Implementor
async function frontendAgent(task: Task, uiuxResult: any) {
  // Read design spec from Agent 1
  const designSpec = await mcp_filesystem.read_file({
    path: uiuxResult.designSpecPath,
  });

  // Generate code
  const code = await mcp_ui_generator.generate_component({
    componentName: task.componentName,
    designSpec: JSON.parse(designSpec),
  });

  // Validate
  const validation = await mcp_react.validate_react_component({
    filePath: `components/${task.componentName}.tsx`,
    code,
  });

  if (validation.valid) {
    await mcp_filesystem.write_file({
      path: `components/${task.componentName}.tsx`,
      contents: code,
    });
  }

  return { componentPath: `components/${task.componentName}.tsx` };
}
```

---

## 🛠️ Implementation Guide

### Phase 1: Set Up MCP Infrastructure

**Steps:**

1. Create MCP servers for each capability
2. Register servers in `.cursor/mcp.json`
3. Test server connectivity
4. Document available tools, resources, and prompts

**Example:**

```json
{
  "mcpServers": {
    "aibos-theme": {
      "command": "node",
      "args": [".mcp/theme/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    },
    "aibos-ui-generator": {
      "command": "node",
      "args": [".mcp/ui-generator/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    }
  }
}
```

### Phase 2: Configure Orchestration Layer

**Steps:**

1. Set up orchestrator framework (LangGraph, FastAPI, etc.)
2. Define task routing logic
3. Configure quality gates
4. Set up state management (Redis, PostgreSQL)

**Example:**

```yaml
# orchestrator.frontend.yaml
orchestrator:
  name: "frontend-orchestrator"
  framework: "langgraph"
  pattern: "supervisor_worker"

  coordination:
    task_decomposition: true
    agent_routing: "capability_based"
    quality_gates: true

  mcp_permissions:
    allowed_servers:
      - "next-devtools"
      - "aibos-filesystem"
```

### Phase 3: Define Agentic AI Systems

**Steps:**

1. Create agent configurations
2. Define agent capabilities and roles
3. Configure MCP tool access for each agent
4. Set up agent memory and context management

**Example:**

```yaml
# agents.frontend.yaml
agents:
  - id: "uiux_engineer"
    role: "Designs component API and UX flows"
    capabilities:
      - "ui_design"
      - "layout_creation"
    mcp_permissions:
      allowed_servers:
        - "aibos-theme"
        - "aibos-ui-generator"
        - "aibos-filesystem"
```

### Phase 4: Integrate Generative AI

**Steps:**

1. Create MCP servers that wrap generative AI models
2. Define prompts and generation workflows
3. Configure model access and API keys
4. Test generation quality and performance

**Example:**

```typescript
// .mcp/ui-generator/server.mjs
// Wraps GPT-4 for component generation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generate_component") {
    const generated = await callGPT4({
      prompt: buildPrompt(request.params.arguments),
      model: "gpt-4",
    });
    return { content: [{ type: "text", text: generated }] };
  }
});
```

### Phase 5: Connect All Components

**Steps:**

1. Implement orchestrator that uses MCP to coordinate agents
2. Implement agents that use MCP to perform actions
3. Test end-to-end workflows
4. Monitor and optimize performance

**Example:**

```python
# Orchestrator coordinates via MCP
async def execute_task(task):
    # Get context via MCP
    context = await mcp_filesystem.read_file(task.spec_path)

    # Route to agent
    agent = select_agent(task)
    result = await agent.execute(task, context)

    # Validate via MCP
    validation = await mcp_react.validate_react_component(result)

    return result
```

---

## ✅ Best Practices

### 1. **MCP as Single Source of Truth**

**✅ DO:**

- Use MCP for all inter-component communication
- Standardize all tool interfaces via MCP
- Use MCP resources for shared context

**❌ DON'T:**

- Create direct API calls between components
- Bypass MCP for "performance" reasons
- Mix MCP and non-MCP communication patterns

### 2. **Principle of Least Privilege**

**✅ DO:**

- Grant agents only the MCP tools they need
- Restrict orchestrator to read-only MCP access
- Use MCP permissions to enforce boundaries

**❌ DON'T:**

- Give all agents access to all MCP servers
- Allow agents to modify critical systems
- Skip permission configuration

### 3. **Separation of Concerns**

**✅ DO:**

- Orchestrator: Coordination and routing only
- Agents: Autonomous task execution
- Generative AI: Content generation via MCP
- MCP: Standardized communication protocol

**❌ DON'T:**

- Mix orchestration logic with agent logic
- Embed generative AI directly in agents
- Create custom protocols instead of using MCP

### 4. **State Management**

**✅ DO:**

- Use Redis for ephemeral state (agent coordination)
- Use PostgreSQL for persistent state (audit trails)
- Use MCP resources for shared context

**❌ DON'T:**

- Store state in orchestrator memory
- Mix ephemeral and persistent state
- Duplicate state across components

### 5. **Error Handling**

**✅ DO:**

- Handle MCP tool failures gracefully
- Retry failed operations with backoff
- Log all MCP interactions for debugging

**❌ DON'T:**

- Ignore MCP errors
- Fail silently on tool failures
- Skip error logging

---

## 📖 Real-World Examples

### Example 1: Component Creation Workflow

**Scenario:** Create a new React component with design tokens and validation.

**Flow:**

```
1. Orchestrator receives task: "Create Button component"
   │
   ├─→ Orchestrator uses mcp_filesystem to check existing components
   │
   ├─→ Orchestrator routes to UIUXEngineer agent
   │       │
   │       ├─→ Agent uses mcp_theme to get design tokens
   │       ├─→ Agent uses mcp_ui_generator (generative AI) to create design
   │       └─→ Agent uses mcp_filesystem to save design spec
   │
   ├─→ Orchestrator routes to FrontendImplementor agent
   │       │
   │       ├─→ Agent uses mcp_filesystem to read design spec
   │       ├─→ Agent uses mcp_ui_generator (generative AI) to generate code
   │       ├─→ Agent uses mcp_react to validate code
   │       └─→ Agent uses mcp_filesystem to save component
   │
   └─→ Orchestrator uses mcp_a11y to validate accessibility
```

### Example 2: Multi-Agent Collaboration

**Scenario:** Multiple agents collaborate to create a complete feature.

**Flow:**

```
Task: Create User Profile Page
    │
    ├─→ UIUXEngineer Agent
    │       ├─→ Uses mcp_theme (gets design tokens)
    │       ├─→ Uses mcp_ui_generator (generates design)
    │       └─→ Saves design spec via mcp_filesystem
    │
    ├─→ FrontendImplementor Agent
    │       ├─→ Reads design spec via mcp_filesystem
    │       ├─→ Uses mcp_ui_generator (generates components)
    │       ├─→ Uses mcp_react (validates components)
    │       └─→ Saves components via mcp_filesystem
    │
    └─→ TestEngineer Agent
            ├─→ Reads components via mcp_filesystem
            ├─→ Uses mcp_test_generator (generates tests)
            └─→ Saves tests via mcp_filesystem
```

---

## 🔍 Troubleshooting

### Issue 1: Agents Can't Access MCP Tools

**Symptoms:**

- Agent fails with "MCP tool not found"
- Agent can't perform required actions

**Solutions:**

1. ✅ Check agent's `mcp_permissions.allowed_servers` configuration
2. ✅ Verify MCP server is registered in `.cursor/mcp.json`
3. ✅ Test MCP server independently
4. ✅ Check MCP server logs for errors

### Issue 2: Generative AI Not Producing Quality Output

**Symptoms:**

- Generated code has errors
- Generated designs don't match requirements

**Solutions:**

1. ✅ Improve prompts in MCP server
2. ✅ Provide better context via MCP resources
3. ✅ Add validation steps after generation
4. ✅ Use iterative refinement (generate → validate → refine)

### Issue 3: Orchestrator Can't Coordinate Agents

**Symptoms:**

- Tasks not routed correctly
- Agents not receiving proper context

**Solutions:**

1. ✅ Check orchestrator's routing logic
2. ✅ Verify MCP resources are accessible
3. ✅ Ensure state management is working
4. ✅ Check orchestrator logs for errors

---

## 📚 Additional Resources

### Official Documentation

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP Framework Guidelines](./MCP_FRAMEWORK_GUIDELINES.md)
- [MCP Best Practices](./MCP_BEST_PRACTICES.md)

### AI-BOS Platform Resources

- [Frontend Orchestra Configuration](../../.mcp/frontend_orchestra.md/ORCHESTRA_CONFIGURATION_RECOMMENDATIONS.md)
- [MCP Server Standards](../../.mcp/README.md)
- [Agent Configuration](../../.mcp/frontend_orchestra.md/config/agents.frontend.yaml)

### External Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Multi-Agent Orchestration Patterns](https://github.com/modelcontextprotocol)
- [Agentic AI Best Practices](https://github.com/modelcontextprotocol/servers)

---

**Last Updated:** 2025-11-29  
**Maintained By:** AI-BOS Platform Team  
**Status:** ✅ Active Guidelines
