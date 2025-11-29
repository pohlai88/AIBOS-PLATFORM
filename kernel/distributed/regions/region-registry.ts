/**
 * Region Registry
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.3: Region Management
 * Manages available regions and their configurations
 */

import type { Region, RegionInfo } from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("region-registry");

/**
 * Region Registry
 * Central registry for all available regions
 */
export class RegionRegistry {
  private static instance: RegionRegistry;
  private regions: Map<Region, RegionInfo> = new Map();

  private constructor() {
    this.initializeDefaultRegions();
    logger.info({ regionCount: this.regions.size }, "Region Registry initialized");
  }

  public static getInstance(): RegionRegistry {
    if (!RegionRegistry.instance) {
      RegionRegistry.instance = new RegionRegistry();
    }
    return RegionRegistry.instance;
  }

  /**
   * Register a region
   */
  public registerRegion(region: RegionInfo): void {
    this.regions.set(region.id, region);
    logger.info({ regionId: region.id, name: region.name }, "Region registered");
  }

  /**
   * Get region by ID
   */
  public getRegion(regionId: Region): RegionInfo | null {
    return this.regions.get(regionId) || null;
  }

  /**
   * List all regions
   */
  public listRegions(): RegionInfo[] {
    return Array.from(this.regions.values());
  }

  /**
   * List active regions
   */
  public listActiveRegions(): RegionInfo[] {
    return this.listRegions().filter(r => r.status === "active");
  }

  /**
   * Get regions by continent
   */
  public getRegionsByContinent(continent: string): RegionInfo[] {
    return this.listRegions().filter(
      r => r.location.continent.toLowerCase() === continent.toLowerCase()
    );
  }

  /**
   * Get closest region by latency
   */
  public getClosestRegion(fromRegion: Region): Region | null {
    const region = this.regions.get(fromRegion);
    if (!region?.metadata?.latencyMs) {
      return null;
    }

    let closestRegion: Region | null = null;
    let minLatency = Infinity;

    for (const [targetRegion, latency] of Object.entries(region.metadata.latencyMs)) {
      if (latency < minLatency) {
        minLatency = latency;
        closestRegion = targetRegion as Region;
      }
    }

    return closestRegion;
  }

  /**
   * Initialize default regions
   */
  private initializeDefaultRegions(): void {
    const defaultRegions: RegionInfo[] = [
      {
        id: "us-east" as Region,
        name: "US East (N. Virginia)",
        location: { continent: "North America", country: "United States", city: "Virginia" },
        dataCenter: "us-east-1",
        endpoints: { api: "https://us-east.aibos.io", websocket: "wss://us-east.aibos.io" },
        status: "active",
        sovereigntyCompliance: ["CCPA"],
      },
      {
        id: "us-west" as Region,
        name: "US West (Oregon)",
        location: { continent: "North America", country: "United States", city: "Oregon" },
        dataCenter: "us-west-2",
        endpoints: { api: "https://us-west.aibos.io", websocket: "wss://us-west.aibos.io" },
        status: "active",
        sovereigntyCompliance: ["CCPA"],
      },
      {
        id: "eu-west" as Region,
        name: "EU West (Ireland)",
        location: { continent: "Europe", country: "Ireland", city: "Dublin" },
        dataCenter: "eu-west-1",
        endpoints: { api: "https://eu-west.aibos.io", websocket: "wss://eu-west.aibos.io" },
        status: "active",
        sovereigntyCompliance: ["GDPR"],
      },
      {
        id: "eu-central" as Region,
        name: "EU Central (Frankfurt)",
        location: { continent: "Europe", country: "Germany", city: "Frankfurt" },
        dataCenter: "eu-central-1",
        endpoints: { api: "https://eu-central.aibos.io", websocket: "wss://eu-central.aibos.io" },
        status: "active",
        sovereigntyCompliance: ["GDPR"],
      },
      {
        id: "apac-se" as Region,
        name: "Asia Pacific (Singapore)",
        location: { continent: "Asia", country: "Singapore", city: "Singapore" },
        dataCenter: "ap-southeast-1",
        endpoints: { api: "https://apac-se.aibos.io", websocket: "wss://apac-se.aibos.io" },
        status: "active",
        sovereigntyCompliance: [],
      },
      {
        id: "apac-ne" as Region,
        name: "Asia Pacific (Tokyo)",
        location: { continent: "Asia", country: "Japan", city: "Tokyo" },
        dataCenter: "ap-northeast-1",
        endpoints: { api: "https://apac-ne.aibos.io", websocket: "wss://apac-ne.aibos.io" },
        status: "active",
        sovereigntyCompliance: [],
      },
    ];

    defaultRegions.forEach(region => this.registerRegion(region));
  }
}

export const regionRegistry = RegionRegistry.getInstance();

