/**
 * Usage Analytics Types
 * 
 * GRCD v4.1.0 Compliant: Usage analytics for metadata assets
 * Phase 3.3: Usage Analytics Service
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Usage Action Types
// ─────────────────────────────────────────────────────────────

export const UsageActionEnum = z.enum([
  "view",      // View metadata asset
  "query",     // Query data using asset
  "export",    // Export data
  "update",    // Update metadata
  "create",    // Create metadata
  "delete",    // Delete metadata
  "download",  // Download data
  "share",     // Share asset
]);

export type UsageAction = z.infer<typeof UsageActionEnum>;

// ─────────────────────────────────────────────────────────────
// Usage Log Entry
// ─────────────────────────────────────────────────────────────

export const ZUsageLog = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  assetUrn: z.string().min(1),  // URN of the metadata asset
  assetType: z.enum(["business_term", "data_contract", "field_dictionary", "kpi", "report", "transformation"]),
  action: UsageActionEnum,
  userId: z.string().min(1),
  userName: z.string().nullable(),
  userEmail: z.string().nullable(),
  
  // Context
  context: z.record(z.any()).nullable(),  // JSONB: Additional context (query params, filters, etc.)
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  
  // Duration (for queries/exports)
  durationMs: z.number().int().min(0).nullable(),
  
  // Result
  success: z.boolean().default(true),
  errorMessage: z.string().nullable(),
  
  // Metadata
  createdAt: z.date(),
});

export type UsageLog = z.infer<typeof ZUsageLog>;

export const ZCreateUsageLog = ZUsageLog.omit({
  id: true,
  createdAt: true,
});

export type CreateUsageLog = z.infer<typeof ZCreateUsageLog>;

// ─────────────────────────────────────────────────────────────
// Usage Statistics
// ─────────────────────────────────────────────────────────────

export interface UsageStats {
  assetUrn: string;
  assetType: string;
  totalViews: number;
  totalQueries: number;
  totalExports: number;
  totalUpdates: number;
  totalUsers: number;
  uniqueUsers: string[];  // Array of user IDs
  mostActiveUsers: Array<{
    userId: string;
    userName: string | null;
    userEmail: string | null;
    actionCount: number;
  }>;
  lastViewedAt: Date | null;
  lastQueriedAt: Date | null;
  lastUpdatedAt: Date | null;
  averageQueryDurationMs: number | null;
  successRate: number;  // 0-100
  usageTrend: Array<{
    date: string;  // YYYY-MM-DD
    views: number;
    queries: number;
    exports: number;
    updates: number;
  }>;
  peakUsageHour: number | null;  // 0-23
  peakUsageDay: string | null;  // Monday, Tuesday, etc.
}

// ─────────────────────────────────────────────────────────────
// Usage Trends
// ─────────────────────────────────────────────────────────────

export interface UsageTrend {
  assetUrn: string;
  period: "daily" | "weekly" | "monthly";
  startDate: Date;
  endDate: Date;
  dataPoints: Array<{
    date: string;  // YYYY-MM-DD
    views: number;
    queries: number;
    exports: number;
    updates: number;
    uniqueUsers: number;
    totalActions: number;
  }>;
  growthRate: number | null;  // Percentage growth compared to previous period
  trend: "increasing" | "decreasing" | "stable";
}

// ─────────────────────────────────────────────────────────────
// Popular Assets
// ─────────────────────────────────────────────────────────────

export interface PopularAsset {
  assetUrn: string;
  assetType: string;
  assetName: string;
  totalUsage: number;
  uniqueUsers: number;
  lastUsedAt: Date;
  usageGrowth: number;  // Percentage growth
}

// ─────────────────────────────────────────────────────────────
// User Activity
// ─────────────────────────────────────────────────────────────

export interface UserActivity {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  totalActions: number;
  assetsAccessed: number;
  mostUsedAssets: Array<{
    assetUrn: string;
    assetType: string;
    actionCount: number;
  }>;
  lastActivityAt: Date | null;
  activityTrend: Array<{
    date: string;
    actionCount: number;
  }>;
}

// ─────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────

export type { UsageLog, CreateUsageLog };

