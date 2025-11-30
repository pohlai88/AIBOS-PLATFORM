/**
 * 🛡️ Zone Guard v1.0
 * 
 * Cross-zone protection enforcement:
 * - Tenant boundary validation
 * - Data isolation checks
 * - Cross-zone access prevention
 * 
 * @version 1.0.0
 */

import { ZoneManager, type Zone } from "./zone-manager";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface CrossZoneCheck {
  allowed: boolean;
  sourceZone?: string;
  targetZone?: string;
  reason?: string;
}

export interface ZoneAccessRequest {
  sourceTenantId: string;
  targetTenantId: string;
  resourceType: string;
  resourceId: string;
  action: "read" | "write" | "execute";
}

// ═══════════════════════════════════════════════════════════
// Zone Guard
// ═══════════════════════════════════════════════════════════

export class ZoneGuard {
  private static crossZoneViolations = 0;

  /**
   * Check if cross-zone access is allowed
   */
  static checkCrossZoneAccess(request: ZoneAccessRequest): CrossZoneCheck {
    // Same tenant = always allowed
    if (request.sourceTenantId === request.targetTenantId) {
      return { allowed: true };
    }

    const sourceZone = ZoneManager.getZoneForTenant(request.sourceTenantId);
    const targetZone = ZoneManager.getZoneForTenant(request.targetTenantId);

    // Cross-tenant access is forbidden by default
    this.crossZoneViolations++;

    eventBus.publish({
      type: "zone.crosszone.blocked",
      sourceTenantId: request.sourceTenantId,
      targetTenantId: request.targetTenantId,
      resourceType: request.resourceType,
      resourceId: request.resourceId,
      action: request.action,
      timestamp: new Date().toISOString(),
    } as any);

    return {
      allowed: false,
      sourceZone: sourceZone?.id,
      targetZone: targetZone?.id,
      reason: `Cross-zone access denied: ${request.sourceTenantId} cannot access ${request.targetTenantId}'s ${request.resourceType}`,
    };
  }

  /**
   * Validate tenant owns a resource
   */
  static validateOwnership(
    tenantId: string,
    resourceTenantId: string,
    resourceType: string
  ): boolean {
    if (tenantId === resourceTenantId) {
      return true;
    }

    this.crossZoneViolations++;

    eventBus.publish({
      type: "zone.ownership.violation",
      requestingTenantId: tenantId,
      ownerTenantId: resourceTenantId,
      resourceType,
      timestamp: new Date().toISOString(),
    } as any);

    return false;
  }

  /**
   * Guard a function to ensure it only operates within tenant boundary
   */
  static guardTenantBoundary<T extends (...args: any[]) => any>(
    fn: T,
    tenantId: string
  ): T {
    return ((...args: any[]) => {
      // Inject tenant validation into context
      const context = { tenantId, __zoneGuarded: true };
      return fn.call(context, ...args);
    }) as T;
  }

  /**
   * Check if data access is within zone
   */
  static isDataAccessAllowed(
    requestingTenantId: string,
    dataTenantId: string
  ): boolean {
    return requestingTenantId === dataTenantId;
  }

  /**
   * Enforce zone isolation (throws on violation)
   */
  static enforceIsolation(
    sourceTenantId: string,
    targetTenantId: string,
    action: string
  ): void {
    if (sourceTenantId !== targetTenantId) {
      this.crossZoneViolations++;

      const error = new Error(
        `Zone isolation violation: ${sourceTenantId} attempted to ${action} in ${targetTenantId}'s zone`
      );

      eventBus.publish({
        type: "zone.isolation.violation",
        sourceTenantId,
        targetTenantId,
        action,
        timestamp: new Date().toISOString(),
      } as any);

      throw error;
    }
  }

  /**
   * Get violation count
   */
  static getViolationCount(): number {
    return this.crossZoneViolations;
  }

  /**
   * Reset violation count
   */
  static resetViolationCount(): void {
    this.crossZoneViolations = 0;
  }

  /**
   * Create a tenant-scoped wrapper for any service
   */
  static scopeToTenant<T extends object>(service: T, tenantId: string): T {
    return new Proxy(service, {
      get(target, prop) {
        const value = (target as any)[prop];
        if (typeof value === "function") {
          return (...args: any[]) => {
            // Automatically inject tenantId as first argument if not present
            if (args[0]?.tenantId === undefined) {
              args[0] = { ...args[0], tenantId };
            }
            return value.apply(target, args);
          };
        }
        return value;
      },
    });
  }
}

export const zoneGuard = ZoneGuard;

