/**
 * 🎯 Universal Capability Matrix v2.0
 * 
 * Enterprise-grade provider capability modeling with:
 * - Type-safe provider IDs
 * - Auto-normalized defaults
 * - Advanced scoring algorithm
 * - Cost & stability profiling
 * - AI-governance integration
 * - Kernel-optimized capabilities
 * 
 * @version 2.0.0
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Type-Safe Provider IDs (Issue #2 Fix)
// ═══════════════════════════════════════════════════════════

export const PROVIDER_IDS = ["supabase", "aws", "azure", "gcp", "neon", "local", "custom"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

// ═══════════════════════════════════════════════════════════
// Data Residency Enum (Issue #5 Fix)
// ═══════════════════════════════════════════════════════════

export const DATA_RESIDENCY_REGIONS = [
    "us", "us-east", "us-west",
    "eu", "eu-west", "eu-central",
    "asia", "asia-southeast", "singapore", "japan", "australia",
    "middle-east", "india",
    "local"
] as const;
export type DataResidencyRegion = (typeof DATA_RESIDENCY_REGIONS)[number];

// ═══════════════════════════════════════════════════════════
// Capability Levels (Improvement A)
// ═══════════════════════════════════════════════════════════

export const TransactionLevel = z.enum(["none", "basic", "distributed"]);
export const IndexLevel = z.enum(["none", "basic", "advanced", "geospatial"]);
export const FullTextLevel = z.enum(["none", "basic", "vector", "semantic"]);
export const SchemaModel = z.enum(["strict", "flex", "schemaless"]);
export const LatencyProfile = z.enum(["ultra-low", "low", "medium", "high"]);
export const ThroughputProfile = z.enum(["ultra-high", "high", "medium", "low"]);
export const CostProfile = z.enum(["ultra-low", "low", "medium", "high", "enterprise"]);
export const StabilityTier = z.enum(["production", "beta", "alpha", "experimental"]);

// ═══════════════════════════════════════════════════════════
// Use Cases (Improvement C)
// ═══════════════════════════════════════════════════════════

export const USE_CASES = [
    "erp", "hrms", "inventory", "workflows", "analytics",
    "metadata", "high-frequency", "large-documents", "iot",
    "offline-sync", "realtime", "ml-pipelines", "audit-logs"
] as const;
export type UseCase = (typeof USE_CASES)[number];

// ═══════════════════════════════════════════════════════════
// Compliance Certifications
// ═══════════════════════════════════════════════════════════

export const CERTIFICATIONS = [
    "SOC2", "PCI-DSS", "HIPAA", "GDPR", "ISO27001", "FedRAMP", "PDPA"
] as const;
export type Certification = (typeof CERTIFICATIONS)[number];

// ═══════════════════════════════════════════════════════════
// Supported Data Types
// ═══════════════════════════════════════════════════════════

export const DATA_TYPES = [
    "string", "number", "boolean", "date", "datetime", "timestamp",
    "json", "array", "blob", "uuid", "bigint", "decimal", "binary", "vector"
] as const;
export type DataType = (typeof DATA_TYPES)[number];

// Extended data types for specialized providers
export const EXTENDED_DATA_TYPES = ["jsonb", "geospatial", "xml"] as const;
export type ExtendedDataType = (typeof EXTENDED_DATA_TYPES)[number];

// ═══════════════════════════════════════════════════════════
// Capability Matrix Schema (Full)
// ═══════════════════════════════════════════════════════════

export const CapabilityMatrixSchema = z.object({
    // ─────────────────────────────────────────────────────────
    // Core Capabilities (with Levels - Improvement A)
    // ─────────────────────────────────────────────────────────
    supportsSQL: z.boolean().default(false),
    transactionLevel: TransactionLevel.default("none"),
    indexLevel: IndexLevel.default("none"),
    fullTextLevel: FullTextLevel.default("none"),
    supportsBatch: z.boolean().default(false),
    supportsStreaming: z.boolean().default(false),
    supportsCursors: z.boolean().default(false),

    // ─────────────────────────────────────────────────────────
    // Schema Model
    // ─────────────────────────────────────────────────────────
    schemaModel: SchemaModel.default("flex"),
    supportsSchemaEvolution: z.boolean().default(false),
    supportsMigrations: z.boolean().default(false),

    // ─────────────────────────────────────────────────────────
    // Data Types
    // ─────────────────────────────────────────────────────────
    supportedTypes: z.array(z.enum(DATA_TYPES)).default(["string", "number", "boolean"]),

    // ─────────────────────────────────────────────────────────
    // Performance Profile
    // ─────────────────────────────────────────────────────────
    latencyProfile: LatencyProfile.default("medium"),
    throughputProfile: ThroughputProfile.default("medium"),
    maxConnectionPool: z.number().default(10),
    maxQuerySize: z.number().default(1000000),
    maxBatchSize: z.number().default(1000),

    // ─────────────────────────────────────────────────────────
    // Cost & Stability (Improvements B & D)
    // ─────────────────────────────────────────────────────────
    costProfile: CostProfile.default("medium"),
    stabilityTier: StabilityTier.default("production"),

    // ─────────────────────────────────────────────────────────
    // Use Cases (Improvement C)
    // ─────────────────────────────────────────────────────────
    idealFor: z.array(z.enum(USE_CASES)).default([]),

    // ─────────────────────────────────────────────────────────
    // Reliability
    // ─────────────────────────────────────────────────────────
    supportsRetry: z.boolean().default(true),
    supportsIdempotency: z.boolean().default(false),
    supportsDLQ: z.boolean().default(false),

    // ─────────────────────────────────────────────────────────
    // Security
    // ─────────────────────────────────────────────────────────
    supportsEncryptionAtRest: z.boolean().default(false),
    supportsEncryptionInTransit: z.boolean().default(true),
    supportsRBAC: z.boolean().default(false),
    supportsRLS: z.boolean().default(false),
    supportsAuditLog: z.boolean().default(false),

    // ─────────────────────────────────────────────────────────
    // Compliance
    // ─────────────────────────────────────────────────────────
    certifications: z.array(z.enum(CERTIFICATIONS)).default([]),
    dataResidency: z.array(z.enum(DATA_RESIDENCY_REGIONS)).default([]),

    // ─────────────────────────────────────────────────────────
    // Limits
    // ─────────────────────────────────────────────────────────
    maxRecordSize: z.number().default(1000000),
    maxFieldCount: z.number().default(100),
    maxTableNameLength: z.number().default(64),

    // ─────────────────────────────────────────────────────────
    // Advanced / Realtime
    // ─────────────────────────────────────────────────────────
    supportsRealtime: z.boolean().default(false),
    supportsWebhooks: z.boolean().default(false),
    supportsGraphQL: z.boolean().default(false),
    supportsREST: z.boolean().default(true),

    // ─────────────────────────────────────────────────────────
    // Data Governance
    // ─────────────────────────────────────────────────────────
    supportsSoftDeletes: z.boolean().default(false),

    // ─────────────────────────────────────────────────────────
    // Kernel-Benefit Capabilities (Improvement E)
    // ─────────────────────────────────────────────────────────
    driftSensitivity: z.enum(["low", "medium", "high"]).default("medium"),
    supportsDeltaSync: z.boolean().default(false),
    supportsChangefeed: z.boolean().default(false),
    supportsCDC: z.boolean().default(false),
    supportsSparseIndexes: z.boolean().default(false),
    supportsCrossRegionReplication: z.boolean().default(false),
    supportsPointInTimeRecovery: z.boolean().default(false),
});

export type CapabilityMatrix = z.infer<typeof CapabilityMatrixSchema>;

// ═══════════════════════════════════════════════════════════
// Provider Definitions (Raw - will be normalized)
// ═══════════════════════════════════════════════════════════

const RAW_PROVIDER_CAPABILITIES: Record<ProviderId, Partial<CapabilityMatrix>> = {
    supabase: {
        supportsSQL: true,
        transactionLevel: "basic",
        indexLevel: "advanced",
        fullTextLevel: "basic",
        supportsBatch: true,
        supportsCursors: true,
        schemaModel: "strict",
        supportsSchemaEvolution: true,
        supportsMigrations: true,
        supportedTypes: ["string", "number", "boolean", "date", "datetime", "timestamp", "json", "array", "uuid", "bigint", "decimal", "vector"],
        latencyProfile: "low",
        throughputProfile: "high",
        maxConnectionPool: 100,
        maxQuerySize: 10000000,
        maxBatchSize: 10000,
        costProfile: "low",
        stabilityTier: "production",
        idealFor: ["erp", "hrms", "inventory", "workflows", "realtime", "audit-logs", "ml-pipelines"],
        supportsSoftDeletes: true,
        supportsEncryptionAtRest: true,
        supportsEncryptionInTransit: true,
        supportsRBAC: true,
        supportsRLS: true,
        supportsAuditLog: true,
        certifications: ["SOC2", "GDPR"],
        dataResidency: ["us", "eu", "asia", "singapore"],
        maxRecordSize: 10000000,
        maxFieldCount: 1600,
        maxTableNameLength: 63,
        supportsRealtime: true,
        supportsWebhooks: true,
        driftSensitivity: "high",
        supportsDeltaSync: true,
        supportsChangefeed: true,
        supportsPointInTimeRecovery: true,
    },

    aws: {
        supportsSQL: true,
        transactionLevel: "distributed",
        indexLevel: "advanced",
        fullTextLevel: "vector",
        supportsBatch: true,
        supportsStreaming: true,
        supportsCursors: true,
        schemaModel: "strict",
        supportsSchemaEvolution: true,
        supportsMigrations: true,
        supportedTypes: ["string", "number", "boolean", "date", "datetime", "timestamp", "json", "array", "uuid", "bigint", "decimal", "binary", "vector"],
        latencyProfile: "low",
        throughputProfile: "ultra-high",
        maxConnectionPool: 500,
        maxQuerySize: 100000000,
        maxBatchSize: 100000,
        costProfile: "medium",
        stabilityTier: "production",
        idealFor: ["erp", "analytics", "high-frequency", "ml-pipelines", "large-documents"],
        supportsSoftDeletes: true,
        supportsRetry: true,
        supportsIdempotency: true,
        supportsDLQ: true,
        supportsEncryptionAtRest: true,
        supportsEncryptionInTransit: true,
        supportsRBAC: true,
        supportsRLS: true,
        supportsAuditLog: true,
        certifications: ["SOC2", "PCI-DSS", "HIPAA", "GDPR", "ISO27001", "FedRAMP"],
        dataResidency: ["us", "us-east", "us-west", "eu", "eu-west", "asia", "singapore", "japan", "australia", "middle-east", "india"],
        maxRecordSize: 100000000,
        maxFieldCount: 1600,
        maxTableNameLength: 128,
        supportsWebhooks: true,
        driftSensitivity: "low",
        supportsDeltaSync: true,
        supportsCDC: true,
        supportsCrossRegionReplication: true,
        supportsPointInTimeRecovery: true,
    },

    azure: {
        supportsSQL: true,
        transactionLevel: "distributed",
        indexLevel: "advanced",
        fullTextLevel: "vector",
        supportsBatch: true,
        supportsStreaming: true,
        supportsCursors: true,
        schemaModel: "strict",
        supportsSchemaEvolution: true,
        supportsMigrations: true,
        supportedTypes: ["string", "number", "boolean", "date", "datetime", "timestamp", "json", "array", "uuid", "bigint", "decimal", "binary"],
        latencyProfile: "low",
        throughputProfile: "ultra-high",
        maxConnectionPool: 500,
        maxQuerySize: 100000000,
        maxBatchSize: 100000,
        costProfile: "medium",
        stabilityTier: "production",
        idealFor: ["erp", "analytics", "workflows", "large-documents", "iot"],
        supportsSoftDeletes: true,
        supportsRetry: true,
        supportsIdempotency: true,
        supportsDLQ: true,
        supportsEncryptionAtRest: true,
        supportsEncryptionInTransit: true,
        supportsRBAC: true,
        supportsRLS: true,
        supportsAuditLog: true,
        certifications: ["SOC2", "PCI-DSS", "HIPAA", "GDPR", "ISO27001", "FedRAMP"],
        dataResidency: ["us", "eu", "asia", "singapore", "middle-east", "india"],
        maxRecordSize: 100000000,
        maxFieldCount: 1024,
        maxTableNameLength: 128,
        supportsWebhooks: true,
        driftSensitivity: "low",
        supportsCDC: true,
        supportsCrossRegionReplication: true,
        supportsPointInTimeRecovery: true,
    },

    gcp: {
        supportsSQL: true,
        transactionLevel: "distributed",
        indexLevel: "advanced",
        fullTextLevel: "semantic",
        supportsBatch: true,
        supportsStreaming: true,
        supportsCursors: true,
        schemaModel: "strict",
        supportsSchemaEvolution: true,
        supportsMigrations: true,
        supportedTypes: ["string", "number", "boolean", "date", "datetime", "timestamp", "json", "array", "uuid", "bigint", "decimal", "binary", "vector"],
        latencyProfile: "low",
        throughputProfile: "ultra-high",
        maxConnectionPool: 500,
        maxQuerySize: 100000000,
        maxBatchSize: 100000,
        costProfile: "medium",
        stabilityTier: "production",
        idealFor: ["analytics", "ml-pipelines", "high-frequency", "iot"],
        supportsSoftDeletes: true,
        supportsRetry: true,
        supportsIdempotency: true,
        supportsDLQ: true,
        supportsEncryptionAtRest: true,
        supportsEncryptionInTransit: true,
        supportsRBAC: true,
        supportsRLS: true,
        supportsAuditLog: true,
        certifications: ["SOC2", "PCI-DSS", "HIPAA", "GDPR", "ISO27001"],
        dataResidency: ["us", "eu", "asia", "singapore", "australia", "india"],
        maxRecordSize: 100000000,
        maxFieldCount: 1600,
        maxTableNameLength: 128,
        supportsWebhooks: true,
        driftSensitivity: "low",
        supportsDeltaSync: true,
        supportsCDC: true,
        supportsCrossRegionReplication: true,
        supportsPointInTimeRecovery: true,
    },

    neon: {
        supportsSQL: true,
        transactionLevel: "basic",
        indexLevel: "advanced",
        fullTextLevel: "basic",
        supportsBatch: true,
        supportsCursors: true,
        schemaModel: "strict",
        supportsSchemaEvolution: true,
        supportsMigrations: true,
        supportedTypes: ["string", "number", "boolean", "date", "datetime", "timestamp", "json", "array", "uuid", "bigint", "decimal"],
        latencyProfile: "ultra-low",
        throughputProfile: "high",
        maxConnectionPool: 100,
        maxQuerySize: 10000000,
        maxBatchSize: 10000,
        costProfile: "low",
        stabilityTier: "production",
        idealFor: ["erp", "hrms", "workflows", "metadata"],
        supportsSoftDeletes: true,
        supportsEncryptionAtRest: true,
        supportsEncryptionInTransit: true,
        supportsRBAC: true,
        supportsRLS: true,
        certifications: ["SOC2", "GDPR"],
        dataResidency: ["us", "eu"],
        maxRecordSize: 10000000,
        maxFieldCount: 1600,
        maxTableNameLength: 63,
        driftSensitivity: "high",
        supportsDeltaSync: true,
        supportsPointInTimeRecovery: true,
    },

    local: {
        supportsSQL: true,
        transactionLevel: "basic",
        indexLevel: "basic",
        schemaModel: "flex",
        supportsSchemaEvolution: true,
        supportsMigrations: true,
        supportedTypes: ["string", "number", "boolean", "date", "datetime", "json", "blob"],
        latencyProfile: "ultra-low",
        throughputProfile: "medium",
        maxConnectionPool: 1,
        maxQuerySize: 1000000,
        maxBatchSize: 1000,
        costProfile: "ultra-low",
        stabilityTier: "production",
        idealFor: ["offline-sync", "metadata", "audit-logs"],
        supportsSoftDeletes: true,
        dataResidency: ["local"],
        maxRecordSize: 1000000,
        maxFieldCount: 100,
        maxTableNameLength: 64,
        driftSensitivity: "low",
    },

    custom: {
        costProfile: "medium",
        stabilityTier: "experimental",
        idealFor: [],
    },
};

// ═══════════════════════════════════════════════════════════
// Normalized Provider Capabilities (Issue #1 Fix)
// ═══════════════════════════════════════════════════════════

function normalizeProviders(): Record<ProviderId, CapabilityMatrix> {
    const normalized: Record<string, CapabilityMatrix> = {};

    for (const [id, raw] of Object.entries(RAW_PROVIDER_CAPABILITIES)) {
        normalized[id] = CapabilityMatrixSchema.parse(raw);
    }

    return normalized as Record<ProviderId, CapabilityMatrix>;
}

export const PROVIDER_CAPABILITIES: Record<ProviderId, CapabilityMatrix> = normalizeProviders();

// ═══════════════════════════════════════════════════════════
// Capability Checker (Issue #3 Fix - Type-Safe)
// ═══════════════════════════════════════════════════════════

type BooleanCapabilities = {
    [K in keyof CapabilityMatrix]: CapabilityMatrix[K] extends boolean ? K : never;
}[keyof CapabilityMatrix];

export class CapabilityChecker {
    /**
     * Check if provider supports a boolean capability (type-safe)
     */
    static supports(provider: ProviderId, capability: BooleanCapabilities): boolean {
        const caps = PROVIDER_CAPABILITIES[provider] || PROVIDER_CAPABILITIES.custom;
        const value = caps[capability];

        if (typeof value !== "boolean") {
            throw new Error(`Capability '${capability}' is not a boolean. Use getCapability() instead.`);
        }

        return value;
    }

    /**
     * Get any capability value
     */
    static getCapability<K extends keyof CapabilityMatrix>(
        provider: ProviderId,
        capability: K
    ): CapabilityMatrix[K] {
        const caps = PROVIDER_CAPABILITIES[provider] || PROVIDER_CAPABILITIES.custom;
        return caps[capability];
    }

    /**
     * Get full provider capabilities
     */
    static getCapabilities(provider: ProviderId): CapabilityMatrix {
        return PROVIDER_CAPABILITIES[provider] || PROVIDER_CAPABILITIES.custom;
    }

    /**
     * Check if operation is supported
     */
    static canPerform(provider: ProviderId, operation: string): { supported: boolean; reason?: string } {
        const caps = this.getCapabilities(provider);

        switch (operation) {
            case "transaction":
                return caps.transactionLevel !== "none"
                    ? { supported: true }
                    : { supported: false, reason: "Provider does not support transactions" };
            case "distributed-transaction":
                return caps.transactionLevel === "distributed"
                    ? { supported: true }
                    : { supported: false, reason: "Provider does not support distributed transactions" };
            case "sql":
                return caps.supportsSQL
                    ? { supported: true }
                    : { supported: false, reason: "Provider does not support raw SQL" };
            case "fulltext":
                return caps.fullTextLevel !== "none"
                    ? { supported: true }
                    : { supported: false, reason: "Provider does not support full-text search" };
            case "vector-search":
                return caps.fullTextLevel === "vector" || caps.fullTextLevel === "semantic"
                    ? { supported: true }
                    : { supported: false, reason: "Provider does not support vector search" };
            case "realtime":
                return caps.supportsRealtime
                    ? { supported: true }
                    : { supported: false, reason: "Provider does not support realtime subscriptions" };
            case "rls":
                return caps.supportsRLS
                    ? { supported: true }
                    : { supported: false, reason: "Provider does not support row-level security" };
            case "cdc":
                return caps.supportsCDC
                    ? { supported: true }
                    : { supported: false, reason: "Provider does not support change data capture" };
            default:
                return { supported: true };
        }
    }

    /**
     * Find best provider for requirements (Issue #4 Fix - Advanced Scoring)
     */
    static findBestProvider(requirements: Partial<CapabilityMatrix>): Array<{
        provider: ProviderId;
        score: number;
        matchDetails: Record<string, boolean>;
    }> {
        const providers = PROVIDER_IDS.filter(p => p !== "custom");

        return providers
            .map(provider => {
                const caps = PROVIDER_CAPABILITIES[provider];
                let score = 0;
                let maxScore = 0;
                const matchDetails: Record<string, boolean> = {};

                Object.entries(requirements).forEach(([key, reqValue]) => {
                    const capValue = caps[key as keyof CapabilityMatrix];
                    maxScore += 10;

                    // Boolean match
                    if (typeof reqValue === "boolean") {
                        const matched = capValue === reqValue || (reqValue === true && capValue === true);
                        matchDetails[key] = matched;
                        if (matched) score += 10;
                    }
                    // String/enum match
                    else if (typeof reqValue === "string") {
                        const matched = capValue === reqValue;
                        matchDetails[key] = matched;
                        if (matched) score += 10;
                        // Partial credit for "better" values
                        else if (key === "transactionLevel" && capValue === "distributed" && reqValue === "basic") {
                            score += 8;
                            matchDetails[key] = true;
                        }
                        else if (key === "latencyProfile") {
                            const order = ["ultra-low", "low", "medium", "high"];
                            if (order.indexOf(capValue as string) <= order.indexOf(reqValue)) {
                                score += 8;
                                matchDetails[key] = true;
                            }
                        }
                    }
                    // Array subset match (certifications, dataResidency, idealFor)
                    else if (Array.isArray(reqValue)) {
                        const capArray = capValue as string[];
                        const hasAll = reqValue.every(v => capArray.includes(v));
                        matchDetails[key] = hasAll;
                        if (hasAll) score += 10;
                        else {
                            // Partial credit
                            const overlap = reqValue.filter(v => capArray.includes(v)).length;
                            score += Math.round((overlap / reqValue.length) * 8);
                        }
                    }
                    // Number comparison (limits)
                    else if (typeof reqValue === "number") {
                        const matched = (capValue as number) >= reqValue;
                        matchDetails[key] = matched;
                        if (matched) score += 10;
                    }
                });

                return {
                    provider,
                    score: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
                    matchDetails,
                };
            })
            .filter(p => p.score > 50)
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Find providers ideal for a use case
     */
    static findProvidersForUseCase(useCase: UseCase): ProviderId[] {
        return PROVIDER_IDS.filter(id => {
            if (id === "custom") return false;
            return PROVIDER_CAPABILITIES[id].idealFor.includes(useCase);
        });
    }

    /**
     * Find providers by cost profile
     */
    static findProvidersByCost(maxCost: z.infer<typeof CostProfile>): ProviderId[] {
        const costOrder: z.infer<typeof CostProfile>[] = ["ultra-low", "low", "medium", "high", "enterprise"];
        const maxIndex = costOrder.indexOf(maxCost);

        return PROVIDER_IDS.filter(id => {
            if (id === "custom") return false;
            const providerCost = PROVIDER_CAPABILITIES[id].costProfile;
            return costOrder.indexOf(providerCost) <= maxIndex;
        });
    }

    /**
     * Validate custom adapter capabilities
     */
    static validateCapabilities(capabilities: unknown): { valid: boolean; errors: string[] } {
        const result = CapabilityMatrixSchema.safeParse(capabilities);
        if (result.success) {
            return { valid: true, errors: [] };
        }
        return {
            valid: false,
            errors: result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
        };
    }

    /**
     * Check compliance requirements
     */
    static meetsCompliance(
        provider: ProviderId,
        requiredCerts: Certification[],
        requiredResidency?: DataResidencyRegion[]
    ): { compliant: boolean; missing: string[] } {
        const caps = this.getCapabilities(provider);
        const missing: string[] = [];

        // Check certifications
        for (const cert of requiredCerts) {
            if (!caps.certifications.includes(cert)) {
                missing.push(`Missing certification: ${cert}`);
            }
        }

        // Check data residency
        if (requiredResidency) {
            for (const region of requiredResidency) {
                if (!caps.dataResidency.includes(region)) {
                    missing.push(`Missing data residency: ${region}`);
                }
            }
        }

        return {
            compliant: missing.length === 0,
            missing,
        };
    }

    /**
     * Compare two providers across major capability dimensions (AI reasoning)
     */
    static compare(
        providerA: ProviderId,
        providerB: ProviderId
    ): Record<string, "better" | "equal" | "worse"> {
        const a = PROVIDER_CAPABILITIES[providerA];
        const b = PROVIDER_CAPABILITIES[providerB];

        const keys: (keyof CapabilityMatrix)[] = [
            "transactionLevel",
            "indexLevel",
            "fullTextLevel",
            "latencyProfile",
            "throughputProfile",
            "costProfile",
            "stabilityTier",
            "supportsSoftDeletes",
            "supportsCDC",
            "supportsDeltaSync",
            "supportsRealtime",
        ];

        const result: Record<string, "better" | "equal" | "worse"> = {};

        for (const key of keys) {
            const valA = a[key];
            const valB = b[key];
            if (valA === valB) {
                result[key] = "equal";
            } else {
                result[key] = this.rankCapability(key, valA, valB);
            }
        }

        return result;
    }

    private static rankCapability(key: keyof CapabilityMatrix, a: any, b: any): "better" | "worse" {
        const orderMap: Record<string, string[]> = {
            transactionLevel: ["none", "basic", "distributed"],
            indexLevel: ["none", "basic", "advanced", "geospatial"],
            fullTextLevel: ["none", "basic", "vector", "semantic"],
            latencyProfile: ["high", "medium", "low", "ultra-low"],
            throughputProfile: ["low", "medium", "high", "ultra-high"],
            costProfile: ["enterprise", "high", "medium", "low", "ultra-low"],
            stabilityTier: ["experimental", "alpha", "beta", "production"],
        };

        const order = orderMap[key];
        if (!order) {
            // Boolean comparison - true is better
            return a === true ? "better" : "worse";
        }

        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);

        return indexA > indexB ? "better" : "worse";
    }
}

export const capabilityChecker = new CapabilityChecker();
