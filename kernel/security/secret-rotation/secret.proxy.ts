/**
 * Secret Proxy — Live Secret Access (No Env Variables)
 * 
 * Enforces Security Governance Policy #1:
 * "No env-secret allowed. Must use SecretManagerProxy."
 * 
 * Usage:
 * ```typescript
 * import { secrets } from './security/secret-rotation/secret.proxy';
 * 
 * // ❌ FORBIDDEN
 * const key = process.env.JWT_SECRET;
 * 
 * // ✅ CORRECT
 * const key = secrets.jwt;
 * ```
 * 
 * Features:
 * - Live proxy (always returns current active key)
 * - No restart required on rotation
 * - Type-safe secret access
 * - Automatic failover to next key during rotation
 * 
 * @module security/secret-rotation/secret.proxy
 */

import { secretManager } from './secret.manager';
import type { SecretType } from './types';

/**
 * Secret Proxy — Live access to secrets
 * 
 * This proxy ensures all code uses the current active secret,
 * even after rotation (no restart required).
 */
export const secrets = new Proxy(
    {} as Record<SecretType, string>,
    {
        get(_target, prop: string | symbol) {
            if (typeof prop !== 'string') {
                throw new Error('Secret proxy only supports string keys');
            }

            // Map common property names to SecretType
            const secretType = mapPropertyToSecretType(prop);

            if (!secretType) {
                throw new Error(`Unknown secret property: ${prop}. Use one of: jwt, apiKey, dbPassword, encryptionKey`);
            }

            // Return live secret from manager
            return secretManager.getActive(secretType);
        },
        set() {
            throw new Error('Secrets are read-only. Use secretManager.rotateSecret() to update.');
        },
    }
);

/**
 * Secret Verifier Proxy — Verify secrets (accepts both active and next)
 * 
 * Usage:
 * ```typescript
 * const isValid = verifySecret.jwt(candidateToken);
 * ```
 */
export const verifySecret = new Proxy(
    {} as Record<SecretType, (candidate: string) => boolean>,
    {
        get(_target, prop: string | symbol) {
            if (typeof prop !== 'string') {
                throw new Error('Secret verifier proxy only supports string keys');
            }

            const secretType = mapPropertyToSecretType(prop);

            if (!secretType) {
                throw new Error(`Unknown secret property: ${prop}`);
            }

            // Return verification function
            return (candidate: string) => secretManager.verify(secretType, candidate);
        },
    }
);

/**
 * Secret Signer Proxy — Sign data with active key
 * 
 * Usage:
 * ```typescript
 * const signature = signWith.jwt({ userId: 'u123' });
 * ```
 */
export const signWith = new Proxy(
    {} as Record<SecretType, (payload: unknown) => string>,
    {
        get(_target, prop: string | symbol) {
            if (typeof prop !== 'string') {
                throw new Error('Secret signer proxy only supports string keys');
            }

            const secretType = mapPropertyToSecretType(prop);

            if (!secretType) {
                throw new Error(`Unknown secret property: ${prop}`);
            }

            // Return signing function
            return (payload: unknown) => secretManager.sign(secretType, payload);
        },
    }
);

/**
 * Secret Signature Verifier Proxy — Verify signed data
 * 
 * Usage:
 * ```typescript
 * const isValid = verifySignature.jwt(signature, { userId: 'u123' });
 * ```
 */
export const verifySignature = new Proxy(
    {} as Record<SecretType, (signature: string, payload: unknown) => boolean>,
    {
        get(_target, prop: string | symbol) {
            if (typeof prop !== 'string') {
                throw new Error('Secret signature verifier proxy only supports string keys');
            }

            const secretType = mapPropertyToSecretType(prop);

            if (!secretType) {
                throw new Error(`Unknown secret property: ${prop}`);
            }

            // Return verification function
            return (signature: string, payload: unknown) => {
                return secretManager.verifySignature(secretType, signature, payload);
            };
        },
    }
);

// ─────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────

function mapPropertyToSecretType(prop: string): SecretType | null {
    const mapping: Record<string, SecretType> = {
        jwt: 'jwt',
        jwtSecret: 'jwt',
        JWT_SECRET: 'jwt',
        
        apiKey: 'api_key',
        API_KEY: 'api_key',
        api_key: 'api_key',
        
        dbPassword: 'db_password',
        DB_PASSWORD: 'db_password',
        db_password: 'db_password',
        databasePassword: 'db_password',
        
        encryptionKey: 'encryption_key',
        ENCRYPTION_KEY: 'encryption_key',
        encryption_key: 'encryption_key',
    };

    return mapping[prop] || null;
}

/**
 * Type-safe secret accessor (for code completion)
 */
export interface SecretsProxy {
    /** JWT signing secret (HMAC SHA-512) */
    jwt: string;
    
    /** API key for external services */
    apiKey: string;
    
    /** Database password */
    dbPassword: string;
    
    /** Encryption key (AES-256) */
    encryptionKey: string;
}

/**
 * Typed secret access
 * 
 * @example
 * ```typescript
 * import { getSecret } from './security/secret-rotation/secret.proxy';
 * 
 * const jwtSecret = getSecret('jwt');
 * const apiKey = getSecret('apiKey');
 * ```
 */
export function getSecret(type: keyof SecretsProxy): string {
    return (secrets as any)[type];
}

