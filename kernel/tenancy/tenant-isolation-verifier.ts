/**
 * TenantIsolationVerifier - Detects cross-tenant data leakage
 * 
 * Hardening v2: Prevents and detects tenant boundary violations
 */

export interface TenantScopedRecord {
  tenantId: string;
  resourceType: string;
  resourceId: string;
  timestamp?: number;
  action?: "read" | "write" | "delete";
}

export class TenantIsolationVerifier {
  private static accessLog: TenantScopedRecord[] = [];
  private static maxLogSize = 10000;

  /**
   * Log a tenant-scoped access
   */
  static logAccess(rec: TenantScopedRecord): void {
    if (this.accessLog.length >= this.maxLogSize) {
      this.accessLog.shift(); // Remove oldest
    }
    this.accessLog.push({
      ...rec,
      timestamp: rec.timestamp ?? Date.now()
    });
  }

  /**
   * Find resources accessed by multiple tenants (potential leakage)
   */
  static findCrossTenantAccess(): TenantScopedRecord[] {
    const map = new Map<string, Set<string>>();

    for (const rec of this.accessLog) {
      const key = `${rec.resourceType}:${rec.resourceId}`;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(rec.tenantId);
    }

    const violations: TenantScopedRecord[] = [];
    for (const [key, tenants] of map.entries()) {
      if (tenants.size > 1) {
        const [resourceType, resourceId] = key.split(":");
        for (const tenantId of tenants) {
          violations.push({ tenantId, resourceType, resourceId });
        }
      }
    }

    return violations;
  }

  /**
   * Verify a resource belongs to the expected tenant
   */
  static verifyOwnership(resourceTenantId: string, requestTenantId: string): boolean {
    return resourceTenantId === requestTenantId;
  }

  /**
   * Assert ownership (throws if violation)
   */
  static assertOwnership(resourceTenantId: string, requestTenantId: string): void {
    if (!this.verifyOwnership(resourceTenantId, requestTenantId)) {
      throw new Error(
        `Tenant isolation violation: Resource belongs to ${resourceTenantId}, accessed by ${requestTenantId}`
      );
    }
  }

  /**
   * Verify table name is properly namespaced
   */
  static verifyTableNamespace(tableName: string, tenantId: string): boolean {
    return tableName.startsWith(`${tenantId}_`);
  }

  /**
   * Verify cache key is properly namespaced
   */
  static verifyCacheNamespace(cacheKey: string, tenantId: string): boolean {
    return cacheKey.startsWith(`${tenantId}:`);
  }

  /**
   * Sanitize tenant ID to prevent injection
   */
  static sanitizeTenantId(tenantId: string): string {
    return tenantId.replace(/[^a-zA-Z0-9_-]/g, "");
  }

  /**
   * Get access log for a specific tenant
   */
  static getAccessLog(tenantId?: string): TenantScopedRecord[] {
    if (!tenantId) return [...this.accessLog];
    return this.accessLog.filter(r => r.tenantId === tenantId);
  }

  /**
   * Check if there are any violations
   */
  static hasViolations(): boolean {
    return this.findCrossTenantAccess().length > 0;
  }

  /**
   * Reset log (for testing)
   */
  static reset(): void {
    this.accessLog = [];
  }
}
