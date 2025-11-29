/**
 * Multi-Region Types
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.3: Multi-Region Support
 * Enables global deployment with data sovereignty
 */

/**
 * Supported Regions
 */
export enum Region {
  US_EAST = "us-east",
  US_WEST = "us-west",
  EU_WEST = "eu-west",
  EU_CENTRAL = "eu-central",
  APAC_SE = "apac-se",
  APAC_NE = "apac-ne",
}

/**
 * Data Sovereignty Rules
 */
export enum DataSovereigntyRule {
  EU_ONLY = "eu_only",           // Data must stay in EU
  US_ONLY = "us_only",           // Data must stay in US
  APAC_ONLY = "apac_only",       // Data must stay in APAC
  NO_US = "no_us",               // Data cannot go to US
  NO_CHINA = "no_china",         // Data cannot go to China
  ANY = "any",                   // No restrictions
}

/**
 * Region Info
 */
export interface RegionInfo {
  id: Region;
  name: string;
  location: {
    continent: string;
    country: string;
    city: string;
  };
  dataCenter: string;
  endpoints: {
    api: string;
    websocket?: string;
  };
  status: "active" | "readonly" | "maintenance" | "offline";
  sovereigntyCompliance: string[]; // e.g., ["GDPR", "CCPA"]
  metadata?: {
    latencyMs?: Record<Region, number>; // Latency to other regions
    capacity?: number;
  };
}

/**
 * Tenant Region Affinity
 */
export interface TenantRegionAffinity {
  tenantId: string;
  primaryRegion: Region;
  allowedRegions: Region[];
  sovereigntyRule: DataSovereigntyRule;
  dataResidencyRequired: boolean;
}

/**
 * Cross-Region Replication Config
 */
export interface CrossRegionReplicationConfig {
  enabled: boolean;
  sourcesRegion: Region;
  targetRegions: Region[];
  replicationMode: "async" | "sync";
  batchSizeKb: number;
  intervalMs: number;
}

/**
 * Region Routing Decision
 */
export interface RegionRoutingDecision {
  targetRegion: Region;
  reason: string;
  latencyMs?: number;
  fallbackRegions?: Region[];
  dataResidencyCompliant: boolean;
}

