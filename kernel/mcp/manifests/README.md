# MCP Manifests Directory

This directory contains MCP (Model Context Protocol) server manifests that are automatically loaded at boot time.

## Usage

### 1. Add Manifest Files

Create JSON files in this directory with your MCP server definitions:

```json
{
  "name": "my-server",
  "version": "1.0.0",
  "protocol": "mcp",
  "protocolVersion": "2025-03-26",
  "description": "My custom MCP server",
  "tools": [
    {
      "name": "my_tool",
      "description": "What this tool does",
      "inputSchema": {
        "type": "object",
        "properties": {
          "param1": {
            "type": "string",
            "description": "Parameter description"
          }
        },
        "required": ["param1"]
      }
    }
  ]
}
```

### 2. Environment Variables

You can also load manifests via environment variable:

```bash
export MCP_MANIFESTS='[{"name": "server1", "version": "1.0.0", ...}]'
```

### 3. Remote Registry

Configure remote manifest loading:

```bash
export MCP_REGISTRY_URL='https://your-registry.com/manifests'
```

## Manifest Schema

All manifests must conform to the MCP schema defined in:
- `kernel/mcp/schemas/mcp-manifest.schema.ts`

### Required Fields

- `name`: Server name (unique identifier)
- `version`: SemVer version (e.g., "1.0.0")
- `protocol`: Must be "mcp"
- `protocolVersion`: MCP protocol version (e.g., "2025-03-26")

### Optional Fields

- `description`: Human-readable description
- `tools`: Array of tool definitions
- `resources`: Array of resource definitions
- `prompts`: Array of prompt templates

## Validation

Manifests are automatically validated at boot time:

1. **Schema Validation**: Checked against Zod schema
2. **Uniqueness Check**: Tool/resource/prompt names must be unique
3. **Protocol Version**: Warnings for version mismatches

Invalid manifests will be logged but won't prevent boot.

## Example: GitHub MCP Server

```json
{
  "name": "github",
  "version": "1.0.0",
  "protocol": "mcp",
  "protocolVersion": "2025-03-26",
  "description": "GitHub API integration via MCP",
  "tools": [
    {
      "name": "search_repositories",
      "description": "Search GitHub repositories",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query"
          },
          "per_page": {
            "type": "number",
            "description": "Results per page (max 100)"
          }
        },
        "required": ["query"]
      }
    }
  ]
}
```

## Debugging

Check bootstrap logs for manifest loading status:

```
📂 Loading MCP manifests...
📄 Loaded manifest: my-server.json
✅ Validated 1/1 manifests
✅ Registered MCP server: my-server
```

## GRCD Compliance

This directory structure aligns with:
- **GRCD-KERNEL v4.0.0 Section 6.1** (MCP Registry)
- **F-2**: Validate manifests before hydration via MCP
- **F-5**: Support engine lifecycle via MCP

