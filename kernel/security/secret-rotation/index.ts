/**
 * Secret Rotation — Zero-Downtime Secret Management
 * 
 * @module security/secret-rotation
 */

export { SecretManager, secretManager } from './secret.manager';
export { RotationScheduler, rotationScheduler } from './rotation.scheduler';
export { AutoRotationService } from './auto-rotation.service';
export { ExpirationMonitor } from './expiration-monitor';
export {
    secrets,
    verifySecret,
    signWith,
    verifySignature,
    getSecret,
    type SecretsProxy,
} from './secret.proxy';
export type {
    SecretType,
    SecretStatus,
    SecretMetadata,
    RotationResult,
    RotationPolicy,
} from './types';
export type {
    RotationSchedule,
    ExpirationAlert,
    ExpirationMonitorConfig,
    SecretExpirationInfo,
} from './auto-rotation.service';
export { DEFAULT_ROTATION_POLICIES } from './types';

