/**
 * @fileoverview BFF Default Manifest
 * @module @kernel/bff/default
 * @description Production-ready default configuration for the MCP-Gateway BFF.
 * 
 * Note: The default manifest is already embedded in bff.manifest.ts via DEFAULT_MANIFEST_CONFIG.
 * This file re-exports it for explicit usage and provides environment-specific overrides.
 */

import { createBffManifest } from './bff.manifest';

/**
 * Default BFF Manifest - Production Ready
 * Auto-validated and MCP-signed via createBffManifest()
 */
export const DefaultBffManifest = createBffManifest({
    cors: {
        development: ['http://localhost:3000', 'http://localhost:5173'],
        staging: ['https://*.staging.aibos.io', 'https://staging.aibos.io'],
        production: ['https://aibos.io', 'https://*.aibos.io'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        headers: [
            'Content-Type',
            'Authorization',
            'X-Request-ID',
            'X-Tenant-ID',
            'X-API-Key',
            'X-API-Version',
            'X-Client-Type',
        ],
        exposedHeaders: [
            'X-Request-ID',
            'X-RateLimit-Remaining',
            'X-RateLimit-Reset',
            'X-API-Version',
            'X-API-Deprecation',
        ],
        credentials: true,
        maxAge: 86400,
    },
});

/**
 * Development BFF Manifest - Relaxed settings for local dev
 * Note: requireTenantId stays TRUE to test multi-tenant flows correctly
 */
export const DevBffManifest = createBffManifest({
    security: {
        requireTenantId: true, // Keep true for multi-tenant testing
        requireAuth: false, // Relaxed for dev
        allowAnonymous: ['*'], // Allow all for dev
        auditHighRisk: false,
        auditMutations: false,
        sanitizeInputs: true,
        validateOutputs: true,
        immutableHeaders: [],
    },
    rateLimits: {
        requests: { window: '1m', max: 10000 }, // Higher for dev
        burst: { window: '1s', max: 1000 },
        websocket: { connections: 1000, messagesPerSecond: 500 },
        graphql: { maxDepth: 20, maxComplexity: 5000, maxCPU: 200 },
    },
});

/**
 * Staging BFF Manifest - Production-like with some relaxations
 */
export const StagingBffManifest = createBffManifest({
    cors: {
        development: [],
        staging: ['https://*.staging.aibos.io', 'https://staging.aibos.io'],
        production: [],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        headers: [
            'Content-Type',
            'Authorization',
            'X-Request-ID',
            'X-Tenant-ID',
            'X-API-Key',
            'X-API-Version',
            'X-Client-Type',
        ],
        exposedHeaders: [
            'X-Request-ID',
            'X-RateLimit-Remaining',
            'X-RateLimit-Reset',
            'X-API-Version',
            'X-API-Deprecation',
        ],
        credentials: true,
        maxAge: 86400,
    },
});

/**
 * Get manifest by environment
 */
export function getBffManifest(env: 'development' | 'staging' | 'production' = 'production') {
    switch (env) {
        case 'development':
            return DevBffManifest;
        case 'staging':
            return StagingBffManifest;
        case 'production':
        default:
            return DefaultBffManifest;
    }
}

