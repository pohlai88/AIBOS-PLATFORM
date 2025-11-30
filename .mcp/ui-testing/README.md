# AIBOS UI Testing MCP Server

> **Model Context Protocol Server for UI Package Testing**  
> **Version:** 1.0.0  
> **Status:** ✅ Active

---

## 🎯 Purpose

The UI Testing MCP server provides AI agents and developers with tools for:

- ✅ **Test Generation** - Automatically generate test files following GRCD-TESTING.md patterns
- ✅ **Coverage Validation** - Check if components meet 95% coverage threshold
- ✅ **Pattern Validation** - Validate test files follow standardized patterns

---

## 🛠️ Available Tools

### 1. `generate_component_test`

Generate test file for a React component following GRCD-TESTING.md patterns.

**Input:**

```json
{
  "componentPath": "src/components/shared/primitives/button.tsx",
  "testType": "unit",
  "includeSnapshots": false
}
```

**Output:**

```json
{
  "success": true,
  "testContent": "...",
  "testFilePath": "src/components/shared/primitives/button.test.tsx",
  "componentPath": "src/components/shared/primitives/button.tsx",
  "message": "Test file generated successfully"
}
```

### 2. `check_test_coverage`

Check if component meets 95% coverage threshold from coverage report.

**Input:**

```json
{
  "componentPath": "src/components/shared/primitives/button.tsx",
  "threshold": 95
}
```

**Output:**

```json
{
  "valid": true,
  "coverage": {
    "lines": 96.26,
    "functions": 100,
    "branches": 28.57,
    "statements": 96.26,
    "minimum": 28.57
  },
  "threshold": 95,
  "message": "Coverage meets threshold (96.26% >= 95%)"
}
```

### 3. `validate_test_pattern`

Validate test file follows GRCD-TESTING.md patterns and standards.

**Input:**

```json
{
  "testFilePath": "src/components/shared/primitives/button.test.tsx"
}
```

**Output:**

```json
{
  "valid": true,
  "violations": [],
  "testFilePath": "src/components/shared/primitives/button.test.tsx",
  "summary": "Test file follows GRCD patterns"
}
```

---

## 📋 Configuration

### Cursor IDE Configuration

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-ui-testing": {
      "command": "node",
      "args": [".mcp/ui-testing/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    }
  }
}
```

### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\\Claude\\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "aibos-ui-testing": {
      "command": "node",
      "args": [".mcp/ui-testing/server.mjs"],
      "cwd": "/path/to/AIBOS-PLATFORM"
    }
  }
}
```

---

## 🚀 Usage Examples

### Generate Test for Component

```typescript
// AI agent can call:
await mcp_ui_testing_generate_component_test({
  componentPath: "src/components/shared/primitives/input.tsx",
  testType: "unit",
  includeSnapshots: false,
});
```

### Check Coverage

```typescript
// AI agent can call:
await mcp_ui_testing_check_test_coverage({
  componentPath: "src/components/shared/primitives/button.tsx",
  threshold: 95,
});
```

### Validate Test Pattern

```typescript
// AI agent can call:
await mcp_ui_testing_validate_test_pattern({
  testFilePath: "src/components/shared/primitives/button.test.tsx",
});
```

---

## 📚 Related Documentation

- **GRCD-TESTING.md** - Complete testing governance document
- **TESTING-INFRASTRUCTURE-SETUP.md** - Testing infrastructure setup guide
- **MCP-TESTING-SERVER-RECOMMENDATION.md** - Server design recommendations

---

## 🔧 Development

### Install Dependencies

```bash
cd .mcp/ui-testing
pnpm install
```

### Test Server

```bash
node server.mjs
```

Expected output:

```
AIBOS UI Testing MCP server running on stdio
```

---

## 📊 Governance

All tool responses include governance metadata:

```json
{
  "governance": {
    "toolId": "aibos-ui-testing",
    "domain": "ui_testing_validation",
    "registryTable": "mdm_tool_registry",
    "category": "test_generation",
    "severity": "info"
  }
}
```

---

**Status:** ✅ **READY FOR USE**
