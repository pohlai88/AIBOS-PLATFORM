# MCP Health Monitoring

**Status:** ✅ **IMPLEMENTED**  
**Priority:** 🚀 **High** - Production readiness  
**Reference:** Kubernetes health check patterns, Circuit breaker pattern

---

## Overview

The MCP Health Monitoring system provides comprehensive health checking, circuit breaker protection, and performance metrics for all MCP servers. Based on industry best practices from Kubernetes and Netflix Hystrix.

---

## Features

- ✅ **Health Checks** - Periodic health checks for all MCP servers
- ✅ **Circuit Breaker** - Automatic failover and recovery
- ✅ **Performance Metrics** - Latency, uptime, success/failure rates
- ✅ **Automatic Monitoring** - Background health monitoring
- ✅ **REST API** - Health status endpoints

---

## Usage

### Automatic Health Monitoring

Health monitoring starts automatically when the Kernel boots:

```typescript
import { mcpHealthMonitor } from "./mcp/health";

// Health monitoring is already running
// Check health of a specific server
const health = await mcpHealthMonitor.checkHealth("my-mcp-server");
console.log(health.status); // "healthy" | "degraded" | "unhealthy" | "unknown"
```

### Manual Health Check

```typescript
// Check single server
const result = await mcpHealthMonitor.checkHealth("my-mcp-server");

// Check all servers
const allResults = await mcpHealthMonitor.checkAllHealth();
```

### Get Health Metrics

```typescript
// Get metrics for a specific server
const metrics = mcpHealthMonitor.getMetrics("my-mcp-server");
console.log(metrics.averageLatencyMs);
console.log(metrics.uptime);
console.log(metrics.circuitBreakerState);

// Get metrics for all servers
const allMetrics = mcpHealthMonitor.getAllMetrics();
```

### Circuit Breaker

```typescript
import { CircuitBreaker } from "./mcp/health";

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 30000,
  successThreshold: 2,
});

// Execute with circuit breaker protection
const result = await breaker.execute(
  async () => {
    // Your MCP operation
    return await mcpClient.invokeTool("tool-name", {});
  },
  async () => {
    // Fallback operation
    return { error: "Circuit breaker is open" };
  }
);
```

---

## REST API Endpoints

### GET /mcp/servers/:serverName/health

Get health status of a specific MCP server.

**Response:**
```json
{
  "serverName": "my-mcp-server",
  "status": "healthy",
  "latencyMs": 45,
  "timestamp": "2025-11-29T10:30:00Z",
  "details": {
    "connectionStatus": "connected",
    "lastSuccessfulCheck": "2025-11-29T10:30:00Z",
    "consecutiveFailures": 0
  },
  "metrics": {
    "serverName": "my-mcp-server",
    "status": "healthy",
    "uptime": 3600,
    "totalChecks": 120,
    "successfulChecks": 118,
    "failedChecks": 2,
    "averageLatencyMs": 42,
    "p95LatencyMs": 85,
    "p99LatencyMs": 120,
    "lastCheckAt": "2025-11-29T10:30:00Z",
    "consecutiveFailures": 0,
    "circuitBreakerState": "closed"
  }
}
```

### GET /mcp/health

Get health status of all MCP servers.

**Response:**
```json
{
  "summary": {
    "total": 5,
    "healthy": 4,
    "degraded": 1,
    "unhealthy": 0,
    "unknown": 0
  },
  "servers": [
    {
      "serverName": "server-1",
      "status": "healthy",
      "latencyMs": 45
    }
  ],
  "metrics": {
    "server-1": { /* metrics */ }
  },
  "timestamp": "2025-11-29T10:30:00Z"
}
```

---

## Configuration

### Health Monitor Configuration

```typescript
import { MCPHealthMonitor } from "./mcp/health";

const monitor = MCPHealthMonitor.getInstance({
  checkInterval: 30000, // 30 seconds
  checkTimeout: 5000, // 5 seconds
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    successThreshold: 2,
  },
  autoMonitor: true,
});
```

### Circuit Breaker Configuration

```typescript
const breaker = new CircuitBreaker({
  failureThreshold: 5, // Open after 5 failures
  recoveryTimeout: 30000, // Wait 30s before recovery attempt
  successThreshold: 2, // Close after 2 successes
  enabled: true,
});
```

---

## Health Status States

- **healthy** - Server is responding normally
- **degraded** - Server is responding but with issues (3+ consecutive failures)
- **unhealthy** - Server is not responding (circuit breaker open)
- **unknown** - Server not found in registry

---

## Circuit Breaker States

- **closed** - Normal operation, requests pass through
- **open** - Circuit is open, requests fail fast (after failure threshold)
- **half-open** - Testing recovery, allowing limited requests

---

## Integration with Observability

Health metrics are automatically recorded in:
- Prometheus metrics (`kernel_mcp_health_*`)
- Audit logs
- Event bus

---

## Best Practices

1. **Monitor Health Regularly** - Use automatic monitoring for production
2. **Set Appropriate Thresholds** - Adjust circuit breaker thresholds based on your needs
3. **Use Fallbacks** - Always provide fallback operations when using circuit breakers
4. **Alert on Degraded** - Set up alerts for degraded/unhealthy servers
5. **Review Metrics** - Regularly review health metrics to identify patterns

---

## References

- **Feature Gap Analysis:** See `FEATURE-GAP-ANALYSIS.md` for context
- **Market Strategy:** See `MARKET-STRATEGY-REPORT.md` for prioritization
- **Kubernetes Health Checks:** https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- **Circuit Breaker Pattern:** https://martinfowler.com/bliki/CircuitBreaker.html

---

**Last Updated:** November 29, 2025  
**Status:** ✅ Implemented - Ready for production use

