/**
 * Region Router
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.3: Intelligent Region Routing
 * Routes requests to the optimal region based on latency and data sovereignty
 */

import type { Region, TenantRegionAffinity, RegionRoutingDecision, DataSovereigntyRule } from "./types";
import { regionRegistry } from "./region-registry";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("region-router");

/**
 * Region Router
 * Intelligent routing based on:
 * - Data sovereignty rules
 * - Tenant affinity
 * - Latency
 * - Region health
 */
export class RegionRouter {
  private static instance: RegionRouter;
  private tenantAffinities: Map<string, TenantRegionAffinity> = new Map();

  private constructor() {
    logger.info("Region Router initialized");
  }

  public static getInstance(): RegionRouter {
    if (!RegionRouter.instance) {
      RegionRouter.instance = new RegionRouter();
    }
    return RegionRouter.instance;
  }

  /**
   * Set tenant region affinity
   */
  public setTenantAffinity(affinity: TenantRegionAffinity): void {
    this.tenantAffinities.set(affinity.tenantId, affinity);
    logger.info(
      { tenantId: affinity.tenantId, primaryRegion: affinity.primaryRegion },
      "Tenant affinity configured"
    );
  }

  /**
   * Route request to optimal region
   */
  public routeRequest(
    tenantId: string,
    userRegion?: Region
  ): RegionRoutingDecision {
    // 1. Get tenant affinity
    const affinity = this.tenantAffinities.get(tenantId);

    // 2. If affinity exists, use it
    if (affinity) {
      return this.routeWithAffinity(affinity, userRegion);
    }

    // 3. No affinity - route based on user region or default
    if (userRegion) {
      const region = regionRegistry.getRegion(userRegion);
      if (region && region.status === "active") {
        return {
          targetRegion: userRegion,
          reason: "User region",
          dataResidencyCompliant: true,
        };
      }
    }

    // 4. Default to first active region
    const activeRegions = regionRegistry.listActiveRegions();
    if (activeRegions.length > 0) {
      return {
        targetRegion: activeRegions[0].id,
        reason: "Default region",
        dataResidencyCompliant: true,
      };
    }

    throw new Error("No active regions available");
  }

  /**
   * Route with tenant affinity
   */
  private routeWithAffinity(
    affinity: TenantRegionAffinity,
    userRegion?: Region
  ): RegionRoutingDecision {
    // 1. Check if primary region is active
    const primaryRegion = regionRegistry.getRegion(affinity.primaryRegion);
    if (primaryRegion && primaryRegion.status === "active") {
      // Check data residency compliance
      const compliant = this.checkDataResidency(affinity.primaryRegion, affinity.sovereigntyRule);
      
      if (compliant || !affinity.dataResidencyRequired) {
        return {
          targetRegion: affinity.primaryRegion,
          reason: "Primary region",
          dataResidencyCompliant: compliant,
        };
      }
    }

    // 2. Try user region if allowed
    if (userRegion && affinity.allowedRegions.includes(userRegion)) {
      const compliant = this.checkDataResidency(userRegion, affinity.sovereigntyRule);
      
      if (compliant || !affinity.dataResidencyRequired) {
        return {
          targetRegion: userRegion,
          reason: "User region (fallback)",
          fallbackRegions: [affinity.primaryRegion],
          dataResidencyCompliant: compliant,
        };
      }
    }

    // 3. Find first allowed active region
    for (const allowedRegion of affinity.allowedRegions) {
      const region = regionRegistry.getRegion(allowedRegion);
      if (region && region.status === "active") {
        const compliant = this.checkDataResidency(allowedRegion, affinity.sovereigntyRule);
        
        if (compliant || !affinity.dataResidencyRequired) {
          return {
            targetRegion: allowedRegion,
            reason: "Fallback region",
            fallbackRegions: [affinity.primaryRegion],
            dataResidencyCompliant: compliant,
          };
        }
      }
    }

    throw new Error(`No compliant regions available for tenant ${affinity.tenantId}`);
  }

  /**
   * Check if region complies with data sovereignty rule
   */
  private checkDataResidency(region: Region, rule: DataSovereigntyRule): boolean {
    const regionInfo = regionRegistry.getRegion(region);
    if (!regionInfo) {
      return false;
    }

    const continent = regionInfo.location.continent;

    switch (rule) {
      case "eu_only" as DataSovereigntyRule:
        return continent === "Europe";
      
      case "us_only" as DataSovereigntyRule:
        return continent === "North America";
      
      case "apac_only" as DataSovereigntyRule:
        return continent === "Asia";
      
      case "no_us" as DataSovereigntyRule:
        return continent !== "North America";
      
      case "any" as DataSovereigntyRule:
        return true;
      
      default:
        return true;
    }
  }

  /**
   * Get tenant affinity
   */
  public getTenantAffinity(tenantId: string): TenantRegionAffinity | null {
    return this.tenantAffinities.get(tenantId) || null;
  }

  /**
   * List all tenant affinities
   */
  public listTenantAffinities(): TenantRegionAffinity[] {
    return Array.from(this.tenantAffinities.values());
  }
}

export const regionRouter = RegionRouter.getInstance();

