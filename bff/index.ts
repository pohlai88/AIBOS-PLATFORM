/**
 * @fileoverview AI-BOS BFF - MCP-Gateway Multi-Protocol API Surface
 * @module @kernel/bff
 * @description Single source of truth for all API protocols. One brain, many faces.
 */

// ===========================================================================
// Schemas (Single Source of Truth)
// ===========================================================================
export { BffSchemas } from './bff.schema';
export type {
  TenantId,
  UserId,
  RequestId,
  Protocol,
  ErrorCode,
  MetadataType,
  HealthCheck,
  HealthChecks,
  HealthResponse,
  ExecuteRequest,
  ExecuteResponse,
  PaginationParams,
  PaginationMeta,
  EngineInfo,
  EngineListResponse,
  ActionInfo,
  ActionListResponse,
  MetadataEntry,
  ErrorResponse,
} from './bff.schema';

// ===========================================================================
// Manifest (Rules & Restrictions)
// ===========================================================================
export {
  BffManifest,
  BffManifestClass,
  BffManifestSchema,
  createBffManifest,
  ProtocolEnum,
  VersioningStrategyEnum,
  TimeoutStrategyEnum,
  ErrorCodeEnum,
} from './bff.manifest';
export type {
  BffManifestType,
  ProtocolName,
  VersioningStrategy,
  TimeoutStrategy,
  ErrorCode as ManifestErrorCode,
} from './bff.manifest';

// ===========================================================================
// Types
// ===========================================================================
export type {
  BffClientType,
  BffContext,
  BffRequest,
  BffResponse,
  BffError,
  BffResponseMeta,
  BffPagination,
  BffRateLimit,
  BffTransformer,
  ProtocolType,
  ProtocolConfig,
  GatewayConfig,
  GatewayHealth,
  ApiVersion,
} from './bff.types';

// ===========================================================================
// Gateway
// ===========================================================================
export {
  MCPGateway,
  createMCPGateway,
  type KernelExecutor,
  type GatewayHealthStatus,
} from './gateway';

// ===========================================================================
// Default Manifests (Environment-specific)
// ===========================================================================
export {
  DefaultBffManifest,
  DevBffManifest,
  StagingBffManifest,
  getBffManifest,
} from './bff.default';

// ===========================================================================
// Middleware (Manifest-Aware)
// ===========================================================================
export {
  createAuthMiddleware,
  createRateLimitMiddleware,
  createWsRateLimiter,
  createRequestHeadersMiddleware,
  createResponseHeadersMiddleware,
  createCorsMiddleware,
  type AuthContext,
  type AuthResult,
  type RateLimitResult,
} from './middleware';

// ===========================================================================
// Drift Guard (DriftShield Integration)
// ===========================================================================
export {
  ManifestDriftGuard,
  createManifestDriftGuard,
  type DriftCheckResult,
  type DriftHistory,
} from './drift';

// ===========================================================================
// SDK (Auto-Generated Client)
// ===========================================================================
export {
  BffSdkClient,
  createBffSdk,
  type SdkConfig,
  type SdkRequestOptions,
} from './sdk';

// ===========================================================================
// Adapters (Protocol Implementations)
// ===========================================================================
export {
  OpenAPIAdapter,
  createOpenAPIAdapter,
  TRPCAdapter,
  createTRPCAdapter,
  GraphQLAdapter,
  createGraphQLAdapter,
  WebSocketAdapter,
  createWebSocketAdapter,
  type OpenAPIContext,
  type OpenAPIRoute,
  type TRPCContext,
  type TRPCProcedure,
  type GraphQLContext,
  type GraphQLResolver,
  type WsContext,
  type WsMessage,
  type WsConnection,
  type WsChannel,
} from './adapters';