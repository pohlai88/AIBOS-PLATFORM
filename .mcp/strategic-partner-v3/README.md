# AI-BOS Strategic Partner v3.0

> **Pipeline-Based MCP Server** - Transforming from "Script" to "Platform"

## 🎯 Overview

This MCP server implements the **Strategic Architecture v3.0**, adopting enterprise-grade patterns from MaterialExpressiveMcp and other top MCP implementations. It provides a **Pipeline Architecture** where every request flows through layers of validation, performance monitoring, and structured error handling.

## 🏗️ Architecture

### Core Infrastructure (`mcp-core.mjs`)

Implements three key skills:

1. **Validation Pipelines** - Centralized, type-safe validation for each tool
2. **Performance Monitoring** - Automatic timing and metric tracking
3. **Enhanced Error Handling** - Structured errors with severity levels and actionable suggestions

### Agents

- **Nano Agent v2** (`nano-agent.mjs`) - Design system auditor with token extraction
- **Lynx Agent v2** (`lynx-agent.mjs`) - Framework-agnostic component generator and showcase creator

## 🚀 Features

### 1. Design System Auditing (`nano_audit`)

Validates CSS design systems with:
- ✅ Adaptive luminance checking
- ✅ Kinetic physics detection
- ✅ Theme support validation
- ✅ Token density analysis
- ✅ Performance tracking

**Example:**
```json
{
  "cssContent": ":root { --color-primary: #6366f1; }",
  "framework": "react"
}
```

### 2. Component Generation (`lynx_generate`)

Generates components for multiple frameworks from a single abstract definition:
- ✅ React (TypeScript)
- ✅ Vue (Composition API)
- ✅ Svelte
- ✅ HTML

**Example:**
```json
{
  "name": "Button",
  "type": "button",
  "targetFramework": "react"
}
```

### 3. Interactive Showcase Generation (`lynx_generate_showcase`)

Creates standalone HTML files demonstrating components:
- ✅ Living style guide
- ✅ Nano Banana design system integration
- ✅ Interactive components
- ✅ Aurora background effects

**Example:**
```json
{
  "components": ["button", "card", "badge"],
  "title": "AI-BOS Cockpit Components"
}
```

## 📦 Installation

```bash
cd .mcp/strategic-partner-v3
pnpm install
```

## 🔧 Configuration

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-strategic-partner-v3": {
      "command": "node",
      "args": [".mcp/strategic-partner-v3/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    }
  }
}
```

## 🎮 Usage Examples

### Audit Design System

```
"Audit our design system CSS. Use the globals.css file."
```

### Generate Component

```
"Generate a Button component for React. Name it 'PrimaryButton'."
```

### Create Showcase

```
"Lynx, generate a showcase for our button, card, and badge components. Title it 'AI-BOS Cockpit Components'."
```

## 📊 Performance Monitoring

All operations are automatically timed and logged:

```
[PERF] nano_audit: 45.23ms
[PERF] lynx_generate: 12.67ms
[PERF] lynx_generate_showcase: 89.12ms
```

## 🛡️ Error Handling

Errors include:
- **Type** - Error category
- **Severity** - INFO, WARNING, CRITICAL
- **Suggestions** - Actionable fix recommendations
- **Metadata** - Additional context

## 🔍 Validation

Every request is validated before processing:
- Parameter validation
- Business logic validation
- Output validation

## 📚 Related Documentation

- [MCP Skills & Patterns](./../../docs/07-mcp/MCP_SKILLS_LEARNINGS.md) - Research learnings
- [MCP Best Practices](./../../docs/07-mcp/MCP_BEST_PRACTICES.md) - Configuration guide

## 🎯 What We Adopted

1. ✅ **Validation Pipelines** - Centralized validation for each tool
2. ✅ **Performance Monitoring** - Automatic timing and metrics
3. ✅ **Enhanced Error Handling** - Structured errors with suggestions
4. ✅ **Framework Agnostic** - Single logic, multiple outputs
5. ✅ **Design Token Extraction** - Automatic token analysis
6. ✅ **Interactive Showcases** - Living style guide generation

## 🚀 Next Steps

1. Add caching for expensive operations
2. Implement multi-format exports (JSON, Markdown, HTML)
3. Add WCAG scoring system
4. Support web page analysis
5. Add memory optimization for large operations

---

**Version:** 3.0.0  
**Status:** ✅ Production Ready  
**Maintained By:** AI-BOS Platform Team

