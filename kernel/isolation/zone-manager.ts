/**
 * 🏢 Zone Manager v1.0
 * 
 * Tenant Isolation Zone orchestrator:
 * - Zone lifecycle management
 * - Resource allocation
 * - Cross-zone protection
 * 
 * @version 1.0.0
 */

import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ZoneConfig {
  maxMemoryMB: number;
  maxCpuPercent: number;
  maxConcurrentExecutions: number;
  maxRequestsPerMinute: number;
  maxNetworkCallsPerMinute: number;
  isolationLevel: "standard" | "strict" | "paranoid";
  allowedEngines: string[];
  allowedMcps: string[];
}

export interface Zone {
  id: string;
  tenantId: string;
  name: string;
  config: ZoneConfig;
  status: "active" | "suspended" | "terminated";
  createdAt: number;
  lastActivityAt: number;
  metrics: ZoneMetrics;
}

export interface ZoneMetrics {
  currentExecutions: number;
  totalExecutions: number;
  memoryUsedMB: number;
  cpuUsedPercent: number;
  requestsThisMinute: number;
  networkCallsThisMinute: number;
  blockedAttempts: number;
  lastResetAt: number;
}

// ═══════════════════════════════════════════════════════════
// Default Config
// ═══════════════════════════════════════════════════════════

const DEFAULT_ZONE_CONFIG: ZoneConfig = {
  maxMemoryMB: 256,
  maxCpuPercent: 25,
  maxConcurrentExecutions: 10,
  maxRequestsPerMinute: 100,
  maxNetworkCallsPerMinute: 50,
  isolationLevel: "standard",
  allowedEngines: ["*"],
  allowedMcps: ["*"],
};

// ═══════════════════════════════════════════════════════════
// Zone Manager
// ═══════════════════════════════════════════════════════════

export class ZoneManager {
  private static zones = new Map<string, Zone>();
  private static tenantToZone = new Map<string, string>();

  /**
   * Create a new isolation zone for a tenant
   */
  static createZone(
    tenantId: string,
    name: string,
    config?: Partial<ZoneConfig>
  ): Zone {
    // Check if tenant already has a zone
    if (this.tenantToZone.has(tenantId)) {
      throw new Error(`Tenant ${tenantId} already has an isolation zone`);
    }

    const zoneId = `zone_${tenantId}_${Date.now()}`;
    const now = Date.now();

    const zone: Zone = {
      id: zoneId,
      tenantId,
      name,
      config: { ...DEFAULT_ZONE_CONFIG, ...config },
      status: "active",
      createdAt: now,
      lastActivityAt: now,
      metrics: {
        currentExecutions: 0,
        totalExecutions: 0,
        memoryUsedMB: 0,
        cpuUsedPercent: 0,
        requestsThisMinute: 0,
        networkCallsThisMinute: 0,
        blockedAttempts: 0,
        lastResetAt: now,
      },
    };

    this.zones.set(zoneId, zone);
    this.tenantToZone.set(tenantId, zoneId);

    eventBus.publish({
      type: "zone.created",
      zoneId,
      tenantId,
      config: zone.config,
      timestamp: new Date().toISOString(),
    } as any);

    return zone;
  }

  /**
   * Get zone by ID
   */
  static getZone(zoneId: string): Zone | undefined {
    return this.zones.get(zoneId);
  }

  /**
   * Get zone for tenant
   */
  static getZoneForTenant(tenantId: string): Zone | undefined {
    const zoneId = this.tenantToZone.get(tenantId);
    return zoneId ? this.zones.get(zoneId) : undefined;
  }

  /**
   * Get or create zone for tenant
   */
  static ensureZone(tenantId: string, config?: Partial<ZoneConfig>): Zone {
    const existing = this.getZoneForTenant(tenantId);
    if (existing) return existing;
    return this.createZone(tenantId, `Zone for ${tenantId}`, config);
  }

  /**
   * Suspend a zone
   */
  static suspendZone(zoneId: string, reason: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    zone.status = "suspended";

    eventBus.publish({
      type: "zone.suspended",
      zoneId,
      tenantId: zone.tenantId,
      reason,
      timestamp: new Date().toISOString(),
    } as any);

    return true;
  }

  /**
   * Resume a suspended zone
   */
  static resumeZone(zoneId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone || zone.status !== "suspended") return false;

    zone.status = "active";

    eventBus.publish({
      type: "zone.resumed",
      zoneId,
      tenantId: zone.tenantId,
      timestamp: new Date().toISOString(),
    } as any);

    return true;
  }

  /**
   * Terminate a zone
   */
  static terminateZone(zoneId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    zone.status = "terminated";
    this.tenantToZone.delete(zone.tenantId);
    this.zones.delete(zoneId);

    eventBus.publish({
      type: "zone.terminated",
      zoneId,
      tenantId: zone.tenantId,
      timestamp: new Date().toISOString(),
    } as any);

    return true;
  }

  /**
   * Update zone config
   */
  static updateConfig(zoneId: string, config: Partial<ZoneConfig>): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    zone.config = { ...zone.config, ...config };
    return true;
  }

  /**
   * Get all zones
   */
  static getAllZones(): Zone[] {
    return Array.from(this.zones.values());
  }

  /**
   * Get active zones count
   */
  static getActiveCount(): number {
    return Array.from(this.zones.values()).filter(z => z.status === "active").length;
  }

  /**
   * Check if zone allows engine
   */
  static isEngineAllowed(zoneId: string, engineId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;
    if (zone.config.allowedEngines.includes("*")) return true;
    return zone.config.allowedEngines.includes(engineId);
  }

  /**
   * Check if zone allows MCP
   */
  static isMcpAllowed(zoneId: string, mcpId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;
    if (zone.config.allowedMcps.includes("*")) return true;
    return zone.config.allowedMcps.includes(mcpId);
  }
}

export const zoneManager = ZoneManager;

