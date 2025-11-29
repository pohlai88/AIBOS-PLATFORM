/**
 * MCP (Model Context Protocol) Type Definitions
 * 
 * Aligned with GRCD-KERNEL v4.0.0 Section 7.2
 * Protocol Version: 2025-03-26
 */

/**
 * MCP Protocol Version
 */
export const MCP_PROTOCOL_VERSION = "2025-03-26" as const;

/**
 * MCP Manifest - Complete server definition
 */
export interface MCPManifest {
  name: string;
  version: string;
  protocol: "mcp";
  protocolVersion: string;
  description?: string;
  tools?: MCPTool[];
  resources?: MCPResource[];
  prompts?: MCPPrompt[];
}

/**
 * MCP Tool Definition
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>; // JSON Schema
}

/**
 * MCP Resource Definition
 */
export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

/**
 * MCP Prompt Template Definition
 */
export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPPromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

/**
 * MCP Tool Invocation Request
 */
export interface MCPToolInvocation {
  tool: string;
  arguments: Record<string, any>;
  metadata?: {
    tenantId?: string;
    userId?: string;
    traceId?: string;
  };
}

/**
 * MCP Tool Invocation Result
 */
export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    executionTimeMs: number;
    validatedAt: string;
  };
}

/**
 * MCP Session
 */
export interface MCPSession {
  sessionId: string;
  manifest: MCPManifest;
  createdAt: Date;
  lastAccessedAt: Date;
  metadata: {
    tenantId?: string;
    userId?: string;
  };
}

/**
 * MCP Validation Result
 */
export interface MCPValidationResult {
  valid: boolean;
  errors?: MCPValidationError[];
  warnings?: MCPValidationWarning[];
}

export interface MCPValidationError {
  path: string;
  message: string;
  code: string;
}

export interface MCPValidationWarning {
  path: string;
  message: string;
  code: string;
}

/**
 * MCP Registry Entry
 */
export interface MCPRegistryEntry {
  manifestHash: string;
  manifest: MCPManifest;
  registeredAt: Date;
  status: "active" | "deprecated" | "disabled";
  metadata?: {
    author?: string;
    source?: string;
  };
}

