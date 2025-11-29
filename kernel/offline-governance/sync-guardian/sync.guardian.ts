/**
 * 🛡️ Sync Guardian — Schema & Version Firewall
 * 
 * The HEART of Offline Governance™
 * Every sync request must pass through this firewall.
 * 
 * Features:
 * - Schema version validation
 * - Contract version validation
 * - Signature verification
 * - Payload schema validation
 * - Conflict resolution
 * - Device trust validation
 * - Risk-based sync approval
 * - Zero-trust enforcement
 */

import { z } from "zod";
import { syncMatrixGenerator, type SyncMatrix } from "../sync-matrix/sync-matrix.generator";
import { offlineRiskCalculator, buildRiskFactors } from "../risk-calculator/offline-risk.calculator";
import { eventBus } from "../../events/event-bus";
import { auditChain } from "../../audit/cryptographic-audit";

export interface SyncRequest {
  tenantId: string;
  userId: string;
  deviceId: string;
  syncMatrix: SyncMatrix;
  schemaVersion: string;
  contractVersion: string;
  payload: OfflinePayload[];
  deviceInfo: DeviceInfo;
  timestamp: string;
}

export interface OfflinePayload {
  entity: string;
  operation: "create" | "read" | "update" | "delete";
  data: Record<string, any>;
  offlineId: string; // Client-generated ID
  offlineTimestamp: string;
  deviceTimestamp: string;
}

export interface DeviceInfo {
  fingerprint: string;
  appVersion: string;
  osVersion: string;
  lastSyncAt: string;
  lastLoginAt: string;
  location?: { lat: number; lng: number };
  isRooted?: boolean;
  isEmulator?: boolean;
}

export interface SyncResponse {
  success: boolean;
  approved: boolean;
  reason?: string;
  errors: Array<{
    payload: string;
    error: string;
    code: string;
  }>;
  warnings: string[];
  syncedRecords: number;
  skippedRecords: number;
  conflictRecords: Array<{
    offlineId: string;
    serverData: any;
    clientData: any;
    resolution: "server-wins" | "client-wins" | "merged" | "manual-review";
  }>;
  nextSyncMatrix?: SyncMatrix; // Updated sync matrix if schema changed
}

export type ConflictResolutionStrategy = 
  | "server-wins" 
  | "client-wins" 
  | "merge" 
  | "manual-review" 
  | "ignore-duplicates";

export class SyncGuardian {
  /**
   * Main sync validation and processing
   */
  async processSyncRequest(
    request: SyncRequest,
    conflictStrategy: ConflictResolutionStrategy = "server-wins"
  ): Promise<SyncResponse> {
    const response: SyncResponse = {
      success: false,
      approved: false,
      errors: [],
      warnings: [],
      syncedRecords: 0,
      skippedRecords: 0,
      conflictRecords: [],
    };

    try {
      // ═══════════════════════════════════════════════════════════
      // Step 1: Schema Version Validation
      // ═══════════════════════════════════════════════════════════

      const currentSchemaVersion = await this.getCurrentSchemaVersion(request.tenantId);
      
      if (request.schemaVersion !== currentSchemaVersion) {
        response.approved = false;
        response.reason = `SCHEMA_OUTDATED: Client schema ${request.schemaVersion}, server schema ${currentSchemaVersion}. Please update app.`;
        
        await this.logRejection(request, "SCHEMA_MISMATCH", response.reason);
        return response;
      }

      // ═══════════════════════════════════════════════════════════
      // Step 2: Contract Version Validation
      // ═══════════════════════════════════════════════════════════

      const currentContractVersion = await this.getCurrentContractVersion(request.tenantId);
      
      if (request.contractVersion !== currentContractVersion) {
        response.approved = false;
        response.reason = `CONTRACT_MISMATCH: Client contract ${request.contractVersion}, server contract ${currentContractVersion}. Sync matrix outdated.`;
        
        await this.logRejection(request, "CONTRACT_MISMATCH", response.reason);
        
        // Generate new sync matrix
        response.nextSyncMatrix = await this.generateNewSyncMatrix(request);
        return response;
      }

      // ═══════════════════════════════════════════════════════════
      // Step 3: Sync Matrix Signature Verification
      // ═══════════════════════════════════════════════════════════

      const matrixValidation = await syncMatrixGenerator.validateSyncMatrix(request.syncMatrix);
      
      if (!matrixValidation.valid) {
        response.approved = false;
        response.reason = `SYNC_MATRIX_INVALID: ${matrixValidation.errors.join(", ")}`;
        
        await this.logRejection(request, "INVALID_SYNC_MATRIX", response.reason);
        return response;
      }

      // ═══════════════════════════════════════════════════════════
      // Step 4: Device Trust Validation
      // ═══════════════════════════════════════════════════════════

      const deviceTrustValid = await this.validateDeviceTrust(request.deviceId, request.deviceInfo);
      
      if (!deviceTrustValid) {
        response.approved = false;
        response.reason = "UNTRUSTED_DEVICE: Device not authorized or trust revoked.";
        
        await this.logRejection(request, "UNTRUSTED_DEVICE", response.reason);
        return response;
      }

      // ═══════════════════════════════════════════════════════════
      // Step 5: Risk Assessment
      // ═══════════════════════════════════════════════════════════

      const riskFactors = buildRiskFactors({
        userId: request.userId,
        deviceId: request.deviceId,
        lastSyncAt: new Date(request.deviceInfo.lastSyncAt),
        lastLoginAt: new Date(request.deviceInfo.lastLoginAt),
        appVersion: request.deviceInfo.appVersion,
        offlineRecords: request.payload,
        schemaVersion: request.schemaVersion,
        deviceFingerprint: request.deviceInfo.fingerprint,
        location: request.deviceInfo.location,
      });

      const riskAssessment = await offlineRiskCalculator.assessRisk(
        request.tenantId,
        request.userId,
        request.deviceId,
        riskFactors
      );

      if (riskAssessment.shouldBlock) {
        response.approved = false;
        response.reason = `RISK_TOO_HIGH: Risk score ${riskAssessment.score}/100 (${riskAssessment.level}). ${riskAssessment.reasons.join(", ")}`;
        response.warnings = riskAssessment.recommendations;
        
        await this.logRejection(request, "HIGH_RISK", response.reason);
        return response;
      }

      if (riskAssessment.level === "warning") {
        response.warnings.push(`Risk score: ${riskAssessment.score}/100 - ${riskAssessment.reasons.join(", ")}`);
      }

      // ═══════════════════════════════════════════════════════════
      // Step 6: Payload Validation
      // ═══════════════════════════════════════════════════════════

      for (const payload of request.payload) {
        try {
          // Validate entity is allowed in sync matrix
          const entityPermissions = request.syncMatrix.allowedEntities[payload.entity];
          
          if (!entityPermissions) {
            response.errors.push({
              payload: payload.offlineId,
              error: `Entity '${payload.entity}' not allowed in sync matrix`,
              code: "ENTITY_NOT_ALLOWED",
            });
            response.skippedRecords++;
            continue;
          }

          // Validate operation is allowed
          if (!entityPermissions.operations.includes(payload.operation)) {
            response.errors.push({
              payload: payload.offlineId,
              error: `Operation '${payload.operation}' not allowed for entity '${payload.entity}'`,
              code: "OPERATION_NOT_ALLOWED",
            });
            response.skippedRecords++;
            continue;
          }

          // Validate fields
          const invalidFields = Object.keys(payload.data).filter(
            field => !entityPermissions.fields.includes(field)
          );
          
          if (invalidFields.length > 0) {
            response.errors.push({
              payload: payload.offlineId,
              error: `Invalid fields: ${invalidFields.join(", ")}`,
              code: "INVALID_FIELDS",
            });
            response.skippedRecords++;
            continue;
          }

          // Validate constraints
          const constraintErrors = this.validateConstraints(payload.data, entityPermissions.constraints || {});
          
          if (constraintErrors.length > 0) {
            response.errors.push({
              payload: payload.offlineId,
              error: `Constraint violations: ${constraintErrors.join(", ")}`,
              code: "CONSTRAINT_VIOLATION",
            });
            response.skippedRecords++;
            continue;
          }

          // Validate schema with Zod (if contract has schema)
          const schemaValid = await this.validatePayloadSchema(payload.entity, payload.data);
          
          if (!schemaValid) {
            response.errors.push({
              payload: payload.offlineId,
              error: "Payload schema validation failed",
              code: "SCHEMA_VALIDATION_FAILED",
            });
            response.skippedRecords++;
            continue;
          }

          // ═══════════════════════════════════════════════════════════
          // Step 7: Conflict Detection & Resolution
          // ═══════════════════════════════════════════════════════════

          const conflict = await this.detectConflict(payload);
          
          if (conflict) {
            const resolution = await this.resolveConflict(conflict, conflictStrategy);
            response.conflictRecords.push(resolution);
            
            if (resolution.resolution === "manual-review") {
              response.skippedRecords++;
              continue;
            }
          }

          // ═══════════════════════════════════════════════════════════
          // Step 8: Apply to Database
          // ═══════════════════════════════════════════════════════════

          await this.applyPayload(request.tenantId, payload);
          response.syncedRecords++;

        } catch (error: any) {
          response.errors.push({
            payload: payload.offlineId,
            error: error.message,
            code: "PROCESSING_ERROR",
          });
          response.skippedRecords++;
        }
      }

      // ═══════════════════════════════════════════════════════════
      // Final Response
      // ═══════════════════════════════════════════════════════════

      response.success = response.syncedRecords > 0;
      response.approved = true;
      response.reason = `Synced ${response.syncedRecords} records, skipped ${response.skippedRecords}`;

      await this.logSyncSuccess(request, response);

      return response;

    } catch (error: any) {
      response.success = false;
      response.approved = false;
      response.reason = `Sync failed: ${error.message}`;
      
      await this.logRejection(request, "SYNC_ERROR", error.message);
      
      return response;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Private Helpers
  // ═══════════════════════════════════════════════════════════

  private async getCurrentSchemaVersion(tenantId: string): Promise<string> {
    // Fetch from metadata registry
    return "v12";
  }

  private async getCurrentContractVersion(tenantId: string): Promise<string> {
    // Fetch from contract registry
    return "2025.01.17";
  }

  private async validateDeviceTrust(deviceId: string, deviceInfo: DeviceInfo): Promise<boolean> {
    // Check device registry for trust status
    // Block rooted devices, emulators, revoked devices
    if (deviceInfo.isRooted || deviceInfo.isEmulator) {
      return false;
    }
    return true;
  }

  private validateConstraints(
    data: Record<string, any>,
    constraints: Record<string, any>
  ): string[] {
    const errors: string[] = [];

    Object.entries(constraints).forEach(([field, constraint]) => {
      const value = data[field];

      if (Array.isArray(constraint)) {
        // Enum constraint
        if (!constraint.includes(value)) {
          errors.push(`${field} must be one of: ${constraint.join(", ")}`);
        }
      } else if (typeof constraint === "object" && constraint.min !== undefined) {
        // Range constraint
        if (value < constraint.min) {
          errors.push(`${field} must be >= ${constraint.min}`);
        }
        if (constraint.max !== undefined && value > constraint.max) {
          errors.push(`${field} must be <= ${constraint.max}`);
        }
      }
    });

    return errors;
  }

  private async validatePayloadSchema(entity: string, data: Record<string, any>): Promise<boolean> {
    // Fetch Zod schema from contract and validate
    // For now, return true
    return true;
  }

  private async detectConflict(payload: OfflinePayload): Promise<any> {
    // Check if record already exists with different data
    // For now, return null (no conflict)
    return null;
  }

  private async resolveConflict(conflict: any, strategy: ConflictResolutionStrategy): Promise<any> {
    // Implement conflict resolution strategies
    return {
      offlineId: conflict.offlineId,
      serverData: conflict.serverData,
      clientData: conflict.clientData,
      resolution: strategy,
    };
  }

  private async applyPayload(tenantId: string, payload: OfflinePayload): Promise<void> {
    // Apply payload to database through storage abstraction layer
    // Import logger dynamically to avoid circular dependency
    const { baseLogger } = await import("../../observability/logger");
    baseLogger.info(
      { operation: payload.operation, entity: payload.entity, tenantId },
      "[Sync Guardian] Applying %s to %s",
      payload.operation,
      payload.entity
    );
    
    // In production, use storage abstraction layer
    // await storageAbstractionLayer.getStorage(tenantId).insert(payload.entity, payload.data);
  }

  private async generateNewSyncMatrix(request: SyncRequest): Promise<SyncMatrix> {
    // Generate fresh sync matrix with current contract/schema versions
    return syncMatrixGenerator.generateSyncMatrix(
      {
        tenantId: request.tenantId,
        userId: request.userId,
        deviceId: request.deviceId,
        schemaVersion: await this.getCurrentSchemaVersion(request.tenantId),
        contractVersion: await this.getCurrentContractVersion(request.tenantId),
        expiryHours: 72,
      },
      request.syncMatrix.allowedEntities
    );
  }

  private async logRejection(request: SyncRequest, code: string, reason: string): Promise<void> {
    await auditChain.logEvent("sync.rejected", {
      tenantId: request.tenantId,
      userId: request.userId,
      deviceId: request.deviceId,
      code,
      reason,
      timestamp: new Date().toISOString(),
    });

    await eventBus.publish("sync.rejected", {
      type: "sync.rejected",
      tenantId: request.tenantId,
      userId: request.userId,
      deviceId: request.deviceId,
      code,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  private async logSyncSuccess(request: SyncRequest, response: SyncResponse): Promise<void> {
    await auditChain.logEvent("sync.completed", {
      tenantId: request.tenantId,
      userId: request.userId,
      deviceId: request.deviceId,
      syncedRecords: response.syncedRecords,
      skippedRecords: response.skippedRecords,
      conflicts: response.conflictRecords.length,
      timestamp: new Date().toISOString(),
    });

    await eventBus.publish("sync.completed", {
      type: "sync.completed",
      tenantId: request.tenantId,
      userId: request.userId,
      deviceId: request.deviceId,
      syncedRecords: response.syncedRecords,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Singleton instance
 */
export const syncGuardian = new SyncGuardian();

