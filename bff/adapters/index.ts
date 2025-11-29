/**
 * @fileoverview BFF Adapters Exports
 * @module @bff/adapters
 */

// OpenAPI / REST
export {
  OpenAPIAdapter,
  createOpenAPIAdapter,
  type OpenAPIContext,
  type OpenAPIRoute,
} from './openapi.adapter';

// tRPC
export {
  TRPCAdapter,
  createTRPCAdapter,
  type TRPCContext,
  type TRPCProcedure,
} from './trpc.adapter';

// GraphQL
export {
  GraphQLAdapter,
  createGraphQLAdapter,
  type GraphQLContext,
  type GraphQLResolver,
} from './graphql.adapter';

// WebSocket
export {
  WebSocketAdapter,
  createWebSocketAdapter,
  type WsContext,
  type WsMessage,
  type WsConnection,
  type WsChannel,
} from './websocket.adapter';

