/**
 * Contract Schema
 * 
 * Base contract type - schema field holds specialized schemas (e.g. ZActionContractSchema)
 */

import { z } from "zod";

export const ContractTypeEnum = z.enum(["action", "engine", "model", "ui", "policy"]);

export const ContractStatusEnum = z.enum(["draft", "active", "deprecated"]);

export const ZContractBase = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  contractType: ContractTypeEnum,
  name: z.string().min(1),
  version: z.number().int().positive().default(1),
  schema: z.record(z.any()), // holds specialized schema (e.g. ZActionContractSchema)
  status: ContractStatusEnum.default("active"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ZCreateContract = ZContractBase.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const ZUpdateContract = ZCreateContract.partial();

export type ContractType = z.infer<typeof ContractTypeEnum>;
export type ContractStatus = z.infer<typeof ContractStatusEnum>;
export type ContractBase = z.infer<typeof ZContractBase>;
export type CreateContract = z.infer<typeof ZCreateContract>;
export type UpdateContract = z.infer<typeof ZUpdateContract>;
