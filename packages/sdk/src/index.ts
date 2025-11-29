/**
 * @aibos/sdk - TypeScript SDK for AIBOS Kernel API
 * 
 * Provides a typed, promise-based client for interacting with the Kernel backend.
 */

export { KernelClient } from "./client";
export { KernelError } from "./errors";
export type { KernelClientConfig, KernelClientOptions } from "./types";

// Re-export types from @aibos/types
export type {
  Tenant,
  Engine,
  AuditEvent,
  Invoice,
  InvoiceWithRelations,
  CreateInvoice,
  UpdateInvoice,
  VerifyInvoice,
  Supplier,
} from "@aibos/types";
