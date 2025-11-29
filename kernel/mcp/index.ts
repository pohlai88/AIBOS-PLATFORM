/**
 * MCP (Model Context Protocol) Module
 * 
 * GRCD-KERNEL v4.0.0 Section 6
 * Central export for all MCP governance components
 */

// Types
export * from "./types";

// Schemas
export * from "./schemas/mcp-manifest.schema";

// Registry
export { MCPRegistry, mcpRegistry } from "./registry/mcp-registry";
export { ManifestLoader, manifestLoader } from "./registry/manifest.loader";
export type { ManifestLoaderConfig } from "./registry/manifest.loader";

// Validators
export { MCPManifestValidator, mcpManifestValidator } from "./validator/manifest.validator";
export { MCPToolValidator, mcpToolValidator } from "./validator/tool.validator";

// Executor
export { MCPToolExecutor, mcpToolExecutor } from "./executor/tool.executor";

// Audit
export { MCPAuditLogger, mcpAuditLogger } from "./audit/mcp-audit";
export type { MCPAuditEventType, MCPAuditContext } from "./audit/mcp-audit";

// Events
export { MCPEventEmitter, mcpEventEmitter, MCP_EVENTS } from "./events/mcp-events";

// Telemetry
export * from "./telemetry/mcp-metrics";
