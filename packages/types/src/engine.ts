/**
 * Engine Schema - Shared between Kernel and Web
 */

import { z } from "zod";

export const EngineStatusEnum = z.enum([
    "installed",
    "enabled",
    "disabled",
    "failed",
    "deprecated",
]);

export const RiskBandEnum = z.enum(["low", "medium", "high", "critical"]);

export const SideEffectLevelEnum = z.enum([
    "none",        // read-only, no side-effects
    "local",       // affects only local tenant data
    "external",    // calls external APIs
    "destructive", // deletes/modifies critical data
]);

export const ZEngineCapability = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    actionId: z.string().min(1).optional(),
    sideEffectLevel: SideEffectLevelEnum.default("none"),
});

export const ZEnginePermission = z.object({
    scope: z.string().min(1),
    description: z.string().optional(),
    required: z.boolean().default(true),
});

export const ZMcpEngineManifest = z.object({
    engineId: z.string().min(1),
    name: z.string().min(1),
    version: z.string().min(1),

    description: z.string().min(1),
    author: z.string().optional(),
    homepage: z.string().url().optional(),

    riskBand: RiskBandEnum.default("medium"),
    capabilities: z.array(ZEngineCapability).default([]),
    permissions: z.array(ZEnginePermission).default([]),

    // Links to storage models, metadata references
    storageModels: z.array(z.string()).default([]),
    metadataRefs: z.array(z.string()).default([]),
});

export const ZEngineRecord = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid().nullable(),
    engineId: z.string().min(1),
    name: z.string().min(1),
    version: z.string().min(1),
    manifest: ZMcpEngineManifest,
    signature: z.string().optional(),
    status: EngineStatusEnum.default("installed"),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const ZCreateEngine = ZEngineRecord.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export type EngineStatus = z.infer<typeof EngineStatusEnum>;
export type RiskBand = z.infer<typeof RiskBandEnum>;
export type SideEffectLevel = z.infer<typeof SideEffectLevelEnum>;
export type EngineCapability = z.infer<typeof ZEngineCapability>;
export type EnginePermission = z.infer<typeof ZEnginePermission>;
export type McpEngineManifest = z.infer<typeof ZMcpEngineManifest>;
export type EngineRecord = z.infer<typeof ZEngineRecord>;
export type CreateEngine = z.infer<typeof ZCreateEngine>;
export type Engine = EngineRecord; // Alias for SDK compatibility

