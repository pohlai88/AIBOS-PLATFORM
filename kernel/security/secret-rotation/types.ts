/**
 * Secret Rotation Types
 * 
 * @module security/secret-rotation/types
 */

export type SecretType = 'jwt' | 'api_key' | 'db_password' | 'encryption_key';

export type SecretStatus = 'healthy' | 'stale' | 'expired';

export interface SecretMetadata {
    type: SecretType;
    rotatedAt: Date;
    expiresAt: Date;
    ageDays: number;
    status: SecretStatus;
}

export interface RotationResult {
    success: boolean;
    type: SecretType;
    rotatedAt?: Date;
    expiresAt?: Date;
    error?: string;
    systemLoad?: number;
}

export interface RotationPolicy {
    type: SecretType;
    rotationIntervalDays: number;
    gracePeriodHours: number;
    maxAgeDays: number;
}

export const DEFAULT_ROTATION_POLICIES: RotationPolicy[] = [
    {
        type: 'jwt',
        rotationIntervalDays: 30,
        gracePeriodHours: 24,
        maxAgeDays: 60,
    },
    {
        type: 'api_key',
        rotationIntervalDays: 90,
        gracePeriodHours: 72,
        maxAgeDays: 120,
    },
    {
        type: 'db_password',
        rotationIntervalDays: 90,
        gracePeriodHours: 48,
        maxAgeDays: 120,
    },
    {
        type: 'encryption_key',
        rotationIntervalDays: 365,
        gracePeriodHours: 168, // 7 days
        maxAgeDays: 400,
    },
];

