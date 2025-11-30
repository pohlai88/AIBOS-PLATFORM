# MCP Best Practices - GitHub IDE & Cursor Integration

> **Source:** Compiled from GitHub IDE best practices, official MCP documentation, and AI-BOS platform standards  
> **Last Updated:** 2025-11-29  
> **Status:** Active Guidelines

---

## 📋 Table of Contents

1. [Configuration Best Practices](#configuration-best-practices)
2. [Security Best Practices](#security-best-practices)
3. [Server Development Best Practices](#server-development-best-practices)
4. [Performance Optimization](#performance-optimization)
5. [Error Handling & Monitoring](#error-handling--monitoring)
6. [Versioning & Maintenance](#versioning--maintenance)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## 🔧 Configuration Best Practices

### 1. **Proper Path Configuration**

**✅ CORRECT:**

```json
{
  "mcpServers": {
    "aibos-a11y-validation": {
      "command": "node",
      "args": [".mcp/a11y/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    }
  }
}
```

**❌ INCORRECT:**

```json
{
  "mcpServers": {
    "aibos-a11y-validation": {
      "command": "node",
      "args": [".mcp/a11y/server.mjs"]
      // Missing cwd - will resolve from wrong directory
    }
  }
}
```

**Key Points:**

- ✅ **Always include `cwd`** for local servers with relative paths
- ✅ Use **absolute paths** for `cwd` (Windows: `C:\\path\\to\\workspace`)
- ✅ Use **relative paths** for `args` (e.g., `.mcp/a11y/server.mjs`)
- ❌ Never use `"."` as `cwd` - it resolves from user's home directory

### 2. **Server Naming Conventions**

**Best Practices:**

- ✅ Use `aibos-{name}` format for internal AIBOS servers
- ✅ Use descriptive names for external servers
- ✅ Keep names consistent with server directory names
- ✅ Avoid special characters or spaces

**Examples:**

```json
{
  "aibos-react": "...", // ✅ Good
  "aibos-a11y-validation": "...", // ✅ Good
  "react-validation": "...", // ⚠️  Less clear (use aibos-react)
  "my mcp server": "..." // ❌ Bad (spaces)
}
```

### 3. **External vs Local Servers**

**External Servers (npx):**

```json
{
  "next-devtools": {
    "command": "npx",
    "args": ["-y", "next-devtools-mcp@latest"]
    // No cwd needed - npx handles resolution
  }
}
```

**Local Servers (node):**

```json
{
  "aibos-theme": {
    "command": "node",
    "args": [".mcp/theme/server.mjs"],
    "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM" // Required!
  }
}
```

### 4. **File Formatting**

**✅ Always format with Prettier:**

```bash
npx prettier --write --parser json .cursor/mcp.json
```

**Or use Node.js:**

```bash
node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('.cursor/mcp.json', 'utf8')); fs.writeFileSync('.cursor/mcp.json', JSON.stringify(data, null, 2), 'utf8');"
```

---

## 🔒 Security Best Practices

### 1. **Credential Management**

**✅ DO:**

- Store API keys in environment variables
- Use secure vaults for sensitive information
- Rotate API keys regularly
- Never commit secrets to version control

**❌ DON'T:**

- Hardcode API keys in server files
- Store credentials in `mcp.json`
- Share credentials in documentation

### 2. **Access Control**

**Principle of Least Privilege:**

```json
{
  "shell": {
    "command": "npx",
    "args": ["-y", "mcp-shell@latest"],
    "permissions": {
      "allowedCommands": [
        "pnpm install",
        "pnpm run lint",
        "pnpm run build"
        // Only allow necessary commands
      ]
    }
  }
}
```

**Best Practices:**

- ✅ Grant only necessary permissions
- ✅ Regularly review and update permissions
- ✅ Use read-only volumes when possible
- ✅ Monitor for unauthorized access attempts

### 3. **Network Security**

- ✅ Use HTTPS for all external communications
- ✅ Restrict network access to authorized IP ranges
- ✅ Validate all inputs from external sources
- ✅ Implement rate limiting

---

## 🛠️ Server Development Best Practices

### 1. **Clear Naming Conventions**

**✅ Good Tool Names:**

```typescript
validate_react_component;
check_server_client_usage;
validate_rsc_boundary;
get_theme_tokens;
```

**❌ Bad Tool Names:**

```typescript
validate; // Too vague
check; // Too generic
doStuff; // Not descriptive
```

### 2. **Schema Definition**

**✅ Well-Defined Schemas:**

```typescript
{
  name: "validate_react_component",
  description: "Validates React component for RSC compliance and best practices",
  inputSchema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Path to React component file"
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

### 3. **Component Mapping**

**Organize functionality into MCP components:**

- **Tools** - Actions that can be performed
- **Resources** - Data that can be accessed
- **Prompts** - Templates for AI interactions

### 4. **Error Handling**

**✅ Graceful Error Handling:**

```typescript
try {
  const result = await performAction();
  return {
    success: true,
    data: result,
    metadata: { timestamp: Date.now() },
  };
} catch (error) {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      details: error.stack,
    },
    metadata: { timestamp: Date.now() },
  };
}
```

---

## ⚡ Performance Optimization

### 1. **Enable Only Active Servers**

**✅ DO:**

- Only enable servers you actively use
- Disable unused servers to reduce resource consumption
- Monitor server performance

**❌ DON'T:**

- Enable all servers "just in case"
- Keep deprecated servers enabled

### 2. **Caching Strategies**

- ✅ Cache frequently accessed data
- ✅ Use connection pooling
- ✅ Optimize response sizes
- ✅ Implement request debouncing

### 3. **Resource Management**

- ✅ Clean up resources after use
- ✅ Limit concurrent requests
- ✅ Implement timeouts
- ✅ Monitor memory usage

---

## 📊 Error Handling & Monitoring

### 1. **Structured Logging**

**✅ Implement:**

```typescript
{
  timestamp: "2025-11-29T19:00:00Z",
  level: "error",
  server: "aibos-a11y-validation",
  tool: "validate_accessibility",
  error: {
    message: "File not found",
    code: "ENOENT",
    path: "/path/to/file"
  },
  metadata: {
    correlationId: "abc123",
    userId: "user-456"
  }
}
```

### 2. **Monitoring**

**Track:**

- Response times
- Error rates
- Server uptime
- Resource usage

### 3. **Alerting**

- Set up alerts for critical errors
- Monitor server health
- Track performance degradation

---

## 🔄 Versioning & Maintenance

### 1. **Version Format**

**Semantic Versioning:**

- **Major (X.0.0):** Breaking changes to tool schemas
- **Minor (0.X.0):** New tools or features
- **Patch (0.0.X):** Bug fixes or documentation updates

### 2. **Update Process**

1. Update version in `package.json`
2. Update `lastUpdated` date
3. Document changes in CHANGELOG
4. Test thoroughly before deployment
5. Update documentation

### 3. **Dependency Management**

**✅ Standardized SDK Version:**

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.22.0"
  }
}
```

**Best Practices:**

- ✅ Use consistent SDK version across all servers
- ✅ Regularly update dependencies
- ✅ Test after dependency updates
- ✅ Use `pnpm -w run deps:fix` to sync versions

---

## 🔍 Troubleshooting Common Issues

### Issue 1: Server Not Starting

**Symptoms:**

```
Error: Cannot find module 'C:\Users\username\.mcp\a11y\server.mjs'
```

**Solutions:**

1. ✅ Check `cwd` is set to workspace root (absolute path)
2. ✅ Verify server file exists at specified path
3. ✅ Check file permissions
4. ✅ Restart Cursor IDE

### Issue 2: Path Resolution Errors

**Symptoms:**

- Server resolves from wrong directory
- Relative paths don't work

**Solutions:**

1. ✅ Always include `cwd` with absolute path
2. ✅ Use forward slashes in paths (works on Windows too)
3. ✅ Verify path exists before adding to config

### Issue 3: Configuration Drift

**Symptoms:**

- Servers work intermittently
- Configuration seems inconsistent

**Solutions:**

1. ✅ Format JSON with Prettier regularly
2. ✅ Validate JSON syntax before committing
3. ✅ Use version control to track changes
4. ✅ Rebuild configuration from scratch if needed

### Issue 4: Dependency Mismatches

**Symptoms:**

- Server fails with module not found errors
- Version conflicts

**Solutions:**

1. ✅ Run `pnpm -w run deps:fix` to sync versions
2. ✅ Check `package.json` in server directory
3. ✅ Verify `node_modules` exists
4. ✅ Reinstall dependencies: `cd .mcp/{server} && pnpm install`

---

## ✅ Configuration Checklist

### For Each MCP Server:

- [ ] Server file exists at specified path
- [ ] `cwd` is set to workspace root (absolute path)
- [ ] Dependencies installed (`node_modules` exists)
- [ ] `package.json` has correct SDK version
- [ ] Server name follows naming conventions
- [ ] JSON syntax is valid
- [ ] File is formatted with Prettier
- [ ] Tested after configuration changes

### For Complete Setup:

- [ ] All local servers have `cwd` set
- [ ] All external servers use `npx` correctly
- [ ] No duplicate server names
- [ ] All paths are correct
- [ ] Configuration file is properly formatted
- [ ] Cursor IDE restarted after changes

---

## 📚 Additional Resources

### Official Documentation

- [MCP Specification](https://modelcontextprotocol.io)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)
- [GitHub MCP Examples](https://github.com/modelcontextprotocol)

### AI-BOS Platform Resources

- [MCP Orchestration & AI Relationships](./MCP_ORCHESTRATION_AND_AI_RELATIONSHIPS.md) - **How to establish relationships between orchestration, agentic AI, generative AI, and MCP**
- [MCP Framework Guidelines](./MCP_FRAMEWORK_GUIDELINES.md) - Framework guidelines and integration patterns
- [MCP Configuration Guide](../01-foundation/conventions/MCP_CONFIGURATION_GUIDE.md)
- [MCP Governance Guide](../01-foundation/conventions/MCP_GOVERNANCE_GUIDE.md)
- [MCP Server Standards](../../.mcp/README.md)
- [MCP Integration Guide](../mcp/MCP_INTEGRATION_GUIDE.md)

---

## 🎯 Quick Reference

### Correct Configuration Template

```json
{
  "mcpServers": {
    "aibos-{name}": {
      "command": "node",
      "args": [".mcp/{name}/server.mjs"],
      "cwd": "C:\\AI-BOS\\AIBOS-PLATFORM"
    },
    "external-server": {
      "command": "npx",
      "args": ["-y", "package-name@latest"]
    }
  }
}
```

### Verification Command

```bash
# Check all servers
node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('.cursor/mcp.json', 'utf8')); Object.entries(data.mcpServers).forEach(([name, config]) => { if (config.command === 'node') { const path = require('path'); const fullPath = path.join(config.cwd, config.args[0]); console.log(name + ':', require('fs').existsSync(fullPath) ? '✅' : '❌'); } });"
```

---

**Last Updated:** 2025-11-29  
**Maintained By:** AI-BOS Platform Team  
**Status:** ✅ Active Best Practices
