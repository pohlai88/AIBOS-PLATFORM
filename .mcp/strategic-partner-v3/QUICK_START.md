# Quick Start Guide - Strategic Partner v3.0

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd .mcp/strategic-partner-v3
pnpm install
```

### 2. Add to MCP Configuration

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

### 3. Restart Cursor IDE

Restart Cursor to load the new MCP server.

## 🎮 Usage Examples

### Audit Design System

**Prompt:**
```
"Audit our design system. Use the globals.css file."
```

**Or with specific CSS:**
```
"Audit this CSS: ':root { --color-primary: #6366f1; }'"
```

### Generate Component

**Prompt:**
```
"Generate a Button component for React. Name it 'PrimaryButton'."
```

**Or for Vue:**
```
"Generate a Card component for Vue. Name it 'GlassCard'."
```

### Create Showcase

**Prompt:**
```
"Lynx, generate a showcase for our button, card, and badge components. Title it 'AI-BOS Cockpit Components'."
```

## 📊 Understanding Responses

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "duration": "12.45ms"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Input failed validation",
    "severity": "warning",
    "suggestions": [
      "CSS Content is empty or too short.",
      "CSS missing ':root' definitions."
    ]
  }
}
```

## 🎯 Tool Reference

### `nano_audit`

Audits CSS design systems with comprehensive validation.

**Parameters:**
- `cssContent` (string, optional) - CSS content to audit
- `framework` (string, optional) - Target framework: "react", "vue", "html"
- `filePath` (string, optional) - Path to CSS file (relative to workspace root)

**Returns:**
- Design system metrics
- Token density analysis
- Physics engine detection
- Theme support validation
- Scoring (0-100)
- Recommendations

### `lynx_generate`

Generates framework-agnostic components.

**Parameters:**
- `name` (string, required) - Component name
- `type` (string, required) - Component type: "card", "button", "badge", "panel", "input"
- `targetFramework` (string, required) - Target framework: "react", "vue", "svelte", "html"

**Returns:**
- Generated code
- Styles
- TypeScript types (for React)
- Framework-specific optimizations

### `lynx_generate_showcase`

Creates interactive HTML showcase pages.

**Parameters:**
- `components` (array, required) - List of components: ["button", "card", "badge", "panel", "input"]
- `title` (string, optional) - Page title

**Returns:**
- Complete HTML file with:
  - Nano Banana design system
  - Aurora background effects
  - Interactive components
  - Responsive layout

## 🔍 Troubleshooting

### Server Not Starting

1. Check `cwd` is set to workspace root (absolute path)
2. Verify `node_modules` exists
3. Check Node.js version (>= 18.0.0)

### Validation Errors

- Ensure required parameters are provided
- Check parameter types match schema
- Review error suggestions for fixes

### Performance Issues

- Check performance logs in stderr
- Review operation durations
- Consider caching for repeated operations

## 📚 Next Steps

1. **Test the tools** - Try each tool with sample inputs
2. **Review responses** - Understand the response structure
3. **Integrate workflows** - Use in your development process
4. **Provide feedback** - Report issues or suggest improvements

---

**Need Help?** Check the [README.md](./README.md) for detailed documentation.

