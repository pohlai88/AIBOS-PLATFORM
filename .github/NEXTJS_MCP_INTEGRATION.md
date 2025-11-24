# Next.js MCP Integration in CI/CD

## Overview

This document explains how Next.js MCP is integrated into the GitHub Actions CI/CD workflows.

## Current Integration

### CI Workflow (`.github/workflows/ci.yml`)

The `nextjs-mcp-validate` job validates that the Next.js MCP endpoint is available:

```yaml
nextjs-mcp-validate:
  needs: setup
  runs-on: ubuntu-latest
  steps:
    - name: Start Next.js dev server
      run: |
        cd apps/web
        pnpm dev &
        sleep 15
    - name: Validate Next.js MCP endpoint
      run: |
        curl -f http://localhost:3000/_next/mcp || echo "⚠️ Next.js MCP endpoint not available"
      continue-on-error: true
```

## How It Works

1. **Starts Dev Server**: The Next.js dev server is started in the background
2. **Waits for Ready**: Sleeps 15 seconds to allow server to start
3. **Validates Endpoint**: Checks if `/_next/mcp` endpoint is available
4. **Non-Blocking**: Uses `continue-on-error: true` so it doesn't fail the build

## Requirements

- ✅ Next.js 16.0.0 or later (MCP support added in v16)
- ✅ Dev server must start successfully
- ✅ Port 3000 must be available

## Available Next.js MCP Tools

When the dev server is running, the following MCP tools are available:

### Runtime Diagnostics

- `nextjs_runtime` - Query runtime information
- `nextjs_runtime_discover_servers` - Find running servers
- `nextjs_runtime_list_tools` - List available tools

### Documentation

- `nextjs_docs` - Search Next.js documentation
- `nextjs_docs_get` - Get specific documentation

### Build Diagnostics

- `nextjs_runtime_get_errors` - Get compilation errors
- `nextjs_runtime_get_routes` - Get all routes
- `nextjs_runtime_get_logs` - Get runtime logs

## Usage in CI

### Example: Check for Build Errors

```yaml
- name: Check Next.js build errors
  run: |
    # Start dev server
    cd apps/web && pnpm dev &
    sleep 15

    # Use Next.js MCP to check for errors
    # (In a real scenario, you'd use the MCP client)
    curl http://localhost:3000/_next/mcp
```

### Example: Validate Routes

```yaml
- name: Validate Next.js routes
  run: |
    # Start dev server
    cd apps/web && pnpm dev &
    sleep 15

    # Check routes via MCP
    # This would use the MCP client in practice
```

## Limitations

1. **Background Process**: Dev server runs in background, needs proper cleanup
2. **Port Conflicts**: Only one dev server can run per job
3. **Timing**: Need to wait for server to be ready
4. **MCP Client**: Currently using curl, full MCP client integration would be better

## Future Enhancements

1. **MCP Client Integration**: Use actual MCP client instead of curl
2. **Error Detection**: Automatically detect and report build errors
3. **Route Validation**: Validate all routes are accessible
4. **Performance Metrics**: Collect and report performance data
5. **Parallel Testing**: Run multiple Next.js instances for different scenarios

## Troubleshooting

### MCP Endpoint Not Available

**Symptoms:** `curl` returns 404 or connection refused

**Solutions:**

1. Check Next.js version: `cat apps/web/package.json | grep "next"`
2. Verify dev server started: Check logs for "Ready on http://localhost:3000"
3. Increase sleep time if server takes longer to start
4. Check for port conflicts

### Server Doesn't Start

**Symptoms:** Dev server fails to start

**Solutions:**

1. Check for build errors: `pnpm build` in apps/web
2. Verify dependencies: `pnpm install`
3. Check Node version: Should be 18+
4. Review error logs

## Best Practices

1. **Always use `continue-on-error: true`** for MCP validation (non-critical)
2. **Wait sufficient time** for dev server to start (15+ seconds)
3. **Clean up processes** after validation
4. **Log MCP responses** for debugging
5. **Use MCP client** when available instead of curl

## Related Documentation

- [Next.js MCP Guide](../.cursor/NEXTJS_MCP_GUIDE.md)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Next.js 16 Documentation](https://nextjs.org/docs)
