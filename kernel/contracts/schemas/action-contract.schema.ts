/**
 * Action Contract Schema
 * 
 * Specialized contract for action definitions with input/output schemas
 */

import { z } from "zod";
import { ZContractBase, ContractTypeEnum } from "./contract.schema";
import { SideEffectLevelEnum, RiskBandEnum } from "./engine-manifest.schema";

/**
 * Serialized schema shape for input/output definitions.
 * JSON-serializable Zod descriptions, not live Zod instances.
 */
export const ZSerializedSchema = z.object({
  type: z.string().optional(),
  definition: z.record(z.any()),
});

/**
 * Action execution mode
 */
export const ActionModeEnum = z.enum(["sync", "async"]);

/**
 * Action idempotency behavior
 */
export const ActionIdempotencyEnum = z.enum(["idempotent", "non-idempotent"]);

/**
 * Action Contract - extends ContractBase with action-specific semantics
 * Stored in kernel_contracts.schema column
 */
export const ZActionContractSchema = ZContractBase.extend({
  contractType: z.literal(ContractTypeEnum.enum.action),

  // Unique action identifier within namespace/engine
  actionId: z.string().min(1),

  description: z.string().min(1),

  // Serialized schemas for input/output validation
  inputSchema: ZSerializedSchema,
  outputSchema: ZSerializedSchema,

  mode: ActionModeEnum.default("sync"),
  sideEffectLevel: SideEffectLevelEnum.default("none"),
  riskBand: RiskBandEnum.default("medium"),
  idempotency: ActionIdempotencyEnum.default("idempotent"),

  // Metadata
  tags: z.array(z.string()).default([]),
  deprecated: z.boolean().default(false),
});

export const ZCreateActionContract = ZActionContractSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ActionMode = z.infer<typeof ActionModeEnum>;
export type ActionIdempotency = z.infer<typeof ActionIdempotencyEnum>;
export type SerializedSchema = z.infer<typeof ZSerializedSchema>;
export type ActionContract = z.infer<typeof ZActionContractSchema>;
export type CreateActionContract = z.infer<typeof ZCreateActionContract>;

