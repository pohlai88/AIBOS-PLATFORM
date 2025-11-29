// contracts/contract.types.ts
import type { z } from 'zod';

/**
 * Kernel Action Contract
 * 
 * Defines the metadata and validation schemas for a kernel action.
 * This is the "contract" that engines must implement and that the
 * kernel uses for:
 * - Input/output validation
 * - Policy enforcement (RBAC/ABAC/PBAC)
 * - OpenAPI generation
 * - AI governance
 * - Audit & lineage tracking
 */
export interface KernelActionContract<
  TInputSchema extends z.ZodTypeAny = z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny = z.ZodTypeAny
> {
  /** Unique action ID in format: domain.verb.noun (e.g., accounting.read.journal_entries) */
  id: string;
  
  /** Semantic version (e.g., 1.0.0) */
  version: string;
  
  /** Domain/namespace (e.g., accounting, inventory, workflow) */
  domain: string;
  
  /** Action kind: query (read), command (write), mutation (update/delete) */
  kind: 'query' | 'command' | 'mutation';
  
  /** Short human-readable summary */
  summary: string;
  
  /** Detailed description (markdown supported) */
  description: string;
  
  /** Zod schema for input validation */
  inputSchema: TInputSchema;
  
  /** Zod schema for output validation */
  outputSchema: TOutputSchema;
  
  /** Optional: Data classification for security & compliance */
  classification?: {
    /** PII sensitivity level */
    piiLevel?: 'none' | 'low' | 'medium' | 'high';
    
    /** Data sensitivity category */
    sensitivity?: 'public' | 'internal' | 'confidential' | 'financial' | 'pii';
    
    /** Compliance frameworks this action relates to */
    compliance?: Array<'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS'>;
  };
  
  /** Optional: Tags for discovery, policy, and lineage */
  tags?: string[];
  
  /** Optional: Required permissions (for RBAC) */
  permissions?: string[];
  
  /** Optional: Rate limit configuration */
  rateLimit?: {
    /** Max requests per window */
    max: number;
    
    /** Time window in seconds */
    windowSeconds: number;
  };
  
  /** Optional: Caching configuration */
  cache?: {
    /** Cache key strategy */
    strategy: 'tenant' | 'user' | 'input' | 'custom';
    
    /** TTL in seconds */
    ttl: number;
    
    /** Custom cache key generator */
    keyGenerator?: string;
  };
}

/**
 * Infer input type from contract
 */
export type InferInput<T extends KernelActionContract> = 
  T extends KernelActionContract<infer I, any> 
    ? z.infer<I> 
    : never;

/**
 * Infer output type from contract
 */
export type InferOutput<T extends KernelActionContract> = 
  T extends KernelActionContract<any, infer O> 
    ? z.infer<O> 
    : never;
