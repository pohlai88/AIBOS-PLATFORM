/**
 * @fileoverview Auth Middleware Integration Tests (Kernel Auth Engine)
 * @module @bff/middleware/__tests__/auth.integration
 * @description Tests real Kernel Auth Engine integration (JWT + API Keys)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createAuthMiddleware } from '../auth.middleware';
import { createBffManifest } from '../../bff.manifest';
import { jwtService } from '../../../kernel/auth/jwt.service';
import { apiKeyService } from '../../../kernel/auth/api-key.service';

// ============================================================================
// Test Setup
// ============================================================================

const testManifest = createBffManifest({
    name: 'test-bff',
    version: '1.0.0',
    security: {
        requireAuth: true,
        requireTenantId: true,
        allowAnonymous: ['/health', '/public/*'],
        rateLimit: { enabled: false, requestsPerMinute: 100 },
        immutableHeaders: ['X-Kernel-Signature'],
    },
    versioning: {
        strategy: 'header',
        default: 'v1',
        latest: 'v1',
        supported: ['v1'],
        allowLatestAlias: true,
    },
});

const authMiddleware = createAuthMiddleware(testManifest);

// ============================================================================
// Helper Functions
// ============================================================================

function createRequest(headers: Record<string, string>): Request {
    return new Request('https://api.example.com/test', {
        headers: new Headers(headers),
    });
}

// ============================================================================
// Tests
// ============================================================================

describe('Auth Middleware - Kernel Integration', () => {
    let validJwtToken: string;
    let validApiKey: string;

    beforeAll(async () => {
        // Generate a valid JWT token for testing
        validJwtToken = await jwtService.sign({
            subjectId: 'user:test-123',
            tenantId: 'tenant-abc',
            roles: ['user', 'admin'],
            scopes: ['data:read', 'engines:execute'],
            expiresIn: '1h',
        });

        // Note: API key creation requires SUPABASE mode
        // For unit tests, we'll use JWT only
        // validApiKey = await apiKeyService.createApiKey({
        //     tenantId: 'tenant-abc',
        //     subjectId: 'service:test-service',
        //     roles: ['service'],
        //     scopes: ['engines:execute'],
        // });
    });

    // ========================================================================
    // 1. JWT Authentication
    // ========================================================================

    describe('JWT Authentication', () => {
        it('should accept valid JWT Bearer token', async () => {
            const req = createRequest({
                'Authorization': `Bearer ${validJwtToken}`,
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-123',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(true);
            expect(result.context).toBeDefined();
            expect(result.context?.userId).toBe('test-123');
            expect(result.context?.roles).toContain('admin');
            expect(result.context?.permissions).toContain('data:read');
            expect(result.context?.tenantId).toBe('tenant-abc');
        });

        it('should reject invalid JWT token', async () => {
            const req = createRequest({
                'Authorization': 'Bearer invalid-token-xyz',
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-123',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('UNAUTHORIZED');
            expect(result.error?.message).toContain('Invalid or expired JWT');
        });

        it('should reject expired JWT token', async () => {
            // Create token that expires immediately
            const expiredToken = await jwtService.sign({
                subjectId: 'user:expired',
                tenantId: 'tenant-abc',
                expiresIn: '-1h', // Already expired
            });

            const req = createRequest({
                'Authorization': `Bearer ${expiredToken}`,
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-123',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('UNAUTHORIZED');
        });

        it('should extract roles and scopes from JWT', async () => {
            const tokenWithScopes = await jwtService.sign({
                subjectId: 'user:scoped-user',
                tenantId: 'tenant-xyz',
                roles: ['auditor', 'viewer'],
                scopes: ['audit:read', 'logs:view'],
                expiresIn: '1h',
            });

            const req = createRequest({
                'Authorization': `Bearer ${tokenWithScopes}`,
                'X-Tenant-ID': 'tenant-xyz',
                'X-Request-ID': 'test-456',
            });

            const result = await authMiddleware(req, '/api/audit');

            expect(result.success).toBe(true);
            expect(result.context?.roles).toEqual(['auditor', 'viewer']);
            expect(result.context?.permissions).toContain('audit:read');
            expect(result.context?.permissions).toContain('logs:view');
        });
    });

    // ========================================================================
    // 2. Tenant Isolation
    // ========================================================================

    describe('Tenant Isolation', () => {
        it('should enforce tenant ID when required', async () => {
            const req = createRequest({
                'Authorization': `Bearer ${validJwtToken}`,
                // Missing X-Tenant-ID
                'X-Request-ID': 'test-789',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('VALIDATION_ERROR');
            expect(result.error?.message).toContain('Missing X-Tenant-ID');
        });

        it('should match tenant ID from token', async () => {
            const req = createRequest({
                'Authorization': `Bearer ${validJwtToken}`,
                'X-Tenant-ID': 'tenant-abc', // Must match token
                'X-Request-ID': 'test-999',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(true);
            expect(result.context?.tenantId).toBe('tenant-abc');
        });

        it('should reject token without tenantId when required', async () => {
            const noTenantToken = await jwtService.sign({
                subjectId: 'user:no-tenant',
                tenantId: null, // Missing tenant
                expiresIn: '1h',
            });

            const req = createRequest({
                'Authorization': `Bearer ${noTenantToken}`,
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-111',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('missing tenantId');
        });
    });

    // ========================================================================
    // 3. Anonymous Access
    // ========================================================================

    describe('Anonymous Access', () => {
        it('should allow anonymous access to /health', async () => {
            const req = createRequest({
                // No Authorization header
                'X-Request-ID': 'test-health',
            });

            const result = await authMiddleware(req, '/health');

            expect(result.success).toBe(true);
            expect(result.context?.userId).toBe('anonymous');
            expect(result.context?.roles).toContain('anonymous');
        });

        it('should allow anonymous access to /public/*', async () => {
            const req = createRequest({
                'X-Request-ID': 'test-public',
            });

            const result = await authMiddleware(req, '/public/docs');

            expect(result.success).toBe(true);
            expect(result.context?.userId).toBe('anonymous');
        });

        it('should block anonymous access to protected routes', async () => {
            const req = createRequest({
                // No Authorization header
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-protected',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('UNAUTHORIZED');
            expect(result.error?.message).toContain('Missing Authorization');
        });
    });

    // ========================================================================
    // 4. API Version Negotiation
    // ========================================================================

    describe('API Version Negotiation', () => {
        it('should use default version when not specified', async () => {
            const req = createRequest({
                'Authorization': `Bearer ${validJwtToken}`,
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-version-1',
                // No X-API-Version header
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(true);
            expect(result.context?.apiVersion).toBe('v1');
        });

        it('should accept explicit version', async () => {
            const req = createRequest({
                'Authorization': `Bearer ${validJwtToken}`,
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-version-2',
                'X-API-Version': 'v1',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(true);
            expect(result.context?.apiVersion).toBe('v1');
        });

        it('should reject unsupported version', async () => {
            const req = createRequest({
                'Authorization': `Bearer ${validJwtToken}`,
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-version-3',
                'X-API-Version': 'v999',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('VALIDATION_ERROR');
            expect(result.error?.message).toContain('Unsupported API version');
        });
    });

    // ========================================================================
    // 5. Immutable Headers Protection
    // ========================================================================

    describe('Immutable Headers', () => {
        it('should block client-provided immutable headers', async () => {
            const req = createRequest({
                'Authorization': `Bearer ${validJwtToken}`,
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-immutable',
                'X-Kernel-Signature': 'malicious-signature', // Immutable!
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('FORBIDDEN');
            expect(result.error?.message).toContain('immutable');
        });
    });

    // ========================================================================
    // 6. Error Handling
    // ========================================================================

    describe('Error Handling', () => {
        it('should handle malformed JWT gracefully', async () => {
            const req = createRequest({
                'Authorization': 'Bearer malformed.jwt.here',
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-malformed',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('UNAUTHORIZED');
        });

        it('should handle empty Authorization header', async () => {
            const req = createRequest({
                'Authorization': '',
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-empty-auth',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('UNAUTHORIZED');
        });

        it('should handle Bearer token without space', async () => {
            const req = createRequest({
                'Authorization': 'Bearertoken',
                'X-Tenant-ID': 'tenant-abc',
                'X-Request-ID': 'test-no-space',
            });

            const result = await authMiddleware(req, '/api/execute');

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('Invalid token format');
        });
    });
});

