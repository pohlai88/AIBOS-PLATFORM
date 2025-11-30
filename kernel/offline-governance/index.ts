/**
 * 🛡️ Offline Governance™ — The AI-BOS "Quantum Sync Shield"
 * 
 * Field-ready operational OS with zero-trust offline enforcement
 * 
 * **"Work anywhere. Sync safely. Zero risk, zero drift."**
 * 
 * Features:
 * - Contract-first sync matrix (defines exactly what can be synced)
 * - AI-powered risk scoring (behavior analysis & fraud detection)
 * - Schema & version firewall (prevents outdated clients)
 * - Admin stale users monitoring (real-time workforce tracking)
 * - Device trust manager (blocks rooted/cracked devices)
 * - Legacy system blocker (zero tolerance for old versions)
 * - Conflict resolution (server-wins, client-wins, merge, manual)
 * - Zero-trust enforcement (every sync validated)
 * 
 * Perfect for:
 * - Field workers
 * - Long-life employees
 * - High-risk operational environments
 * - Multi-day offline periods
 * - SMEs with unstable networks
 * 
 * @module @aibos/kernel/offline-governance
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Sync Matrix (Contract-First Sync Configuration)
// ═══════════════════════════════════════════════════════════

export {
  SyncMatrixGenerator,
  syncMatrixGenerator,
  SyncMatrixSchema,
  type SyncMatrixConfig,
  type EntitySyncPermissions,
  type SyncMatrix,
} from "./sync-matrix/sync-matrix.generator";

// ═══════════════════════════════════════════════════════════
// Offline Risk Calculator (AI Behavior Engine)
// ═══════════════════════════════════════════════════════════

export {
  OfflineRiskCalculator,
  offlineRiskCalculator,
  buildRiskFactors,
  type RiskFactors,
  type RiskAssessment,
} from "./risk-calculator/offline-risk.calculator";

// ═══════════════════════════════════════════════════════════
// Sync Guardian (Schema & Version Firewall)
// ═══════════════════════════════════════════════════════════

export {
  SyncGuardian,
  syncGuardian,
  type SyncRequest,
  type SyncResponse,
  type OfflinePayload,
  type DeviceInfo,
  type ConflictResolutionStrategy,
} from "./sync-guardian/sync.guardian";

// ═══════════════════════════════════════════════════════════
// Admin Stale Users Monitor (Field Workforce Watchtower)
// ═══════════════════════════════════════════════════════════

export {
  StaleUsersMonitor,
  staleUsersMonitor,
  type StaleUserRecord,
  type StaleUsersQuery,
  type StaleUsersStats,
} from "./admin-monitor/stale-users.monitor";

// ═══════════════════════════════════════════════════════════
// Device Trust Manager & Legacy System Blocker
// ═══════════════════════════════════════════════════════════

export {
  DeviceTrustManager,
  deviceTrustManager,
  type DeviceRegistration,
  type DeviceTrustValidation,
} from "./device-trust/device-trust.manager";

// ═══════════════════════════════════════════════════════════
// Quick Start Examples
// ═══════════════════════════════════════════════════════════

/**
 * Example 1: Generate Sync Matrix for Field Worker
 * 
 * ```typescript
 * import { syncMatrixGenerator } from '@aibos/kernel/offline-governance';
 * 
 * const matrix = await syncMatrixGenerator.generateFromContracts(
 *   {
 *     tenantId: 'my-tenant',
 *     userId: 'field-worker-123',
 *     deviceId: 'device-abc',
 *     schemaVersion: 'v12',
 *     contractVersion: '2025.01.17',
 *     expiryHours: 72, // Valid for 3 days offline
 *   },
 *   ['field_worker'] // User roles
 * );
 * 
 * // Send matrix to mobile app
 * // App uses this to enforce offline operations
 * ```
 */

/**
 * Example 2: Process Offline Sync Request
 * 
 * ```typescript
 * import { syncGuardian } from '@aibos/kernel/offline-governance';
 * 
 * const response = await syncGuardian.processSyncRequest(
 *   {
 *     tenantId: 'my-tenant',
 *     userId: 'field-worker-123',
 *     deviceId: 'device-abc',
 *     syncMatrix: matrix,
 *     schemaVersion: 'v12',
 *     contractVersion: '2025.01.17',
 *     payload: offlineRecords,
 *     deviceInfo: {...},
 *     timestamp: new Date().toISOString(),
 *   },
 *   'server-wins' // Conflict resolution strategy
 * );
 * 
 * if (response.approved) {
 *   console.log(`Synced ${response.syncedRecords} records`);
 * } else {
 *   console.log(`Sync blocked: ${response.reason}`);
 * }
 * ```
 */

/**
 * Example 3: Monitor Stale Field Workers
 * 
 * ```typescript
 * import { staleUsersMonitor } from '@aibos/kernel/offline-governance';
 * 
 * const { users, stats } = await staleUsersMonitor.getStaleUsers({
 *   tenantId: 'my-tenant',
 *   minHoursOffline: 24, // Workers offline > 1 day
 *   sortBy: 'riskScore',
 *   sortOrder: 'desc',
 * });
 * 
 * console.log(`${stats.staleUsers} workers offline > 24h`);
 * console.log(`${stats.criticalUsers} high-risk workers`);
 * 
 * // Block high-risk user
 * if (users[0].riskScore > 80) {
 *   await staleUsersMonitor.blockUser(
 *     tenantId,
 *     users[0].userId,
 *     users[0].deviceId,
 *     'Risk score too high',
 *     adminId
 *   );
 * }
 * ```
 */

/**
 * Example 4: Validate Device Trust
 * 
 * ```typescript
 * import { deviceTrustManager } from '@aibos/kernel/offline-governance';
 * 
 * // Register new device
 * const registration = await deviceTrustManager.registerDevice(
 *   'my-tenant',
 *   'user-123',
 *   {
 *     fingerprint: 'device-unique-fingerprint',
 *     manufacturer: 'Samsung',
 *     model: 'Galaxy A52',
 *     osType: 'android',
 *     osVersion: '12.0',
 *     appVersion: '1.3.0',
 *     buildNumber: '123',
 *     apkSignature: 'sha256:...',
 *   }
 * );
 * 
 * // Validate before sync
 * const validation = await deviceTrustManager.validateDeviceTrust(
 *   registration.deviceId,
 *   currentDeviceInfo
 * );
 * 
 * if (!validation.valid) {
 *   console.log('Device not trusted:', validation.errors);
 * }
 * ```
 */

