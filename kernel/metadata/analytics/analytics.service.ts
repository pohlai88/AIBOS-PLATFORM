/**
 * Analytics Service
 *
 * GRCD v4.1.0 Compliant: Usage analytics for metadata assets
 * Phase 3.3: Usage Analytics Service
 *
 * Leverages patterns from apps/web/DATA_NEXUS_ARCHITECTURE.md
 */

import { analyticsRepository } from "./analytics.repository";
import type {
  UsageLog,
  CreateUsageLog,
  UsageStats,
  UsageTrend,
  PopularAsset,
  UserActivity,
} from "./types";
import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";

const logger = baseLogger.child({ module: "metadata:analytics-service" });

/**
 * Analytics Service
 *
 * Provides usage analytics capabilities for metadata assets.
 */
export class AnalyticsService {
  /**
   * Log usage activity.
   */
  async logUsage(input: CreateUsageLog): Promise<UsageLog> {
    try {
      const log = await analyticsRepository.logUsage(input);

      logger.debug(
        { assetUrn: input.assetUrn, action: input.action, userId: input.userId },
        "Usage logged"
      );

      return log;
    } catch (error) {
      logger.error({ error, input }, "Failed to log usage");
      throw new KernelError("Failed to log usage", "USAGE_LOG_FAILED", error);
    }
  }

  /**
   * Get usage statistics for an asset.
   */
  async getUsageStats(
    tenantId: string | null,
    assetUrn: string,
    days: number = 30
  ): Promise<UsageStats> {
    try {
      const stats = await analyticsRepository.getUsageStats(tenantId, assetUrn, days);

      return {
        assetUrn,
        assetType: "",  // Would need to fetch from asset
        totalViews: stats.totalViews,
        totalQueries: stats.totalQueries,
        totalExports: stats.totalExports,
        totalUpdates: stats.totalUpdates,
        totalUsers: stats.totalUsers,
        uniqueUsers: stats.uniqueUsers,
        mostActiveUsers: stats.mostActiveUsers,
        lastViewedAt: stats.lastViewedAt,
        lastQueriedAt: stats.lastQueriedAt,
        lastUpdatedAt: stats.lastUpdatedAt,
        averageQueryDurationMs: stats.averageQueryDurationMs,
        successRate: stats.successRate,
        usageTrend: stats.usageTrend,
        peakUsageHour: stats.peakUsageHour,
        peakUsageDay: stats.peakUsageDay,
      };
    } catch (error) {
      logger.error({ error, assetUrn }, "Failed to get usage statistics");
      throw new KernelError("Failed to get usage statistics", "USAGE_STATS_FAILED", error);
    }
  }

  /**
   * Get usage logs for an asset.
   */
  async getUsageLogs(
    tenantId: string | null,
    assetUrn: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<UsageLog[]> {
    try {
      return await analyticsRepository.getUsageLogs(tenantId, assetUrn, limit, offset);
    } catch (error) {
      logger.error({ error, assetUrn }, "Failed to get usage logs");
      throw new KernelError("Failed to get usage logs", "USAGE_LOGS_FAILED", error);
    }
  }

  /**
   * Get usage trend for an asset.
   */
  async getUsageTrend(
    tenantId: string | null,
    assetUrn: string,
    period: "daily" | "weekly" | "monthly" = "daily",
    days: number = 30
  ): Promise<UsageTrend> {
    try {
      const stats = await analyticsRepository.getUsageStats(tenantId, assetUrn, days);

      // Group by period
      let groupedData: any[] = [];
      if (period === "daily") {
        groupedData = stats.usageTrend;
      } else if (period === "weekly") {
        // Group by week
        const weeklyMap = new Map<string, any>();
        for (const point of stats.usageTrend) {
          const date = new Date(point.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];

          if (!weeklyMap.has(weekKey)) {
            weeklyMap.set(weekKey, {
              date: weekKey,
              views: 0,
              queries: 0,
              exports: 0,
              updates: 0,
              uniqueUsers: new Set(),
              totalActions: 0,
            });
          }

          const week = weeklyMap.get(weekKey);
          week.views += point.views;
          week.queries += point.queries;
          week.exports += point.exports;
          week.updates += point.updates;
          week.totalActions += point.views + point.queries + point.exports + point.updates;
        }

        groupedData = Array.from(weeklyMap.values()).map((week) => ({
          ...week,
          uniqueUsers: week.uniqueUsers.size,
        }));
      } else if (period === "monthly") {
        // Group by month
        const monthlyMap = new Map<string, any>();
        for (const point of stats.usageTrend) {
          const date = new Date(point.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
              date: monthKey,
              views: 0,
              queries: 0,
              exports: 0,
              updates: 0,
              uniqueUsers: new Set(),
              totalActions: 0,
            });
          }

          const month = monthlyMap.get(monthKey);
          month.views += point.views;
          month.queries += point.queries;
          month.exports += point.exports;
          month.updates += point.updates;
          month.totalActions += point.views + point.queries + point.exports + point.updates;
        }

        groupedData = Array.from(monthlyMap.values()).map((month) => ({
          ...month,
          uniqueUsers: month.uniqueUsers.size,
        }));
      }

      // Calculate growth rate
      let growthRate: number | null = null;
      if (groupedData.length >= 2) {
        const current = groupedData[groupedData.length - 1].totalActions;
        const previous = groupedData[groupedData.length - 2].totalActions;
        if (previous > 0) {
          growthRate = ((current - previous) / previous) * 100;
        }
      }

      // Determine trend
      let trend: "increasing" | "decreasing" | "stable" = "stable";
      if (groupedData.length >= 2) {
        const first = groupedData[0].totalActions;
        const last = groupedData[groupedData.length - 1].totalActions;
        if (last > first * 1.1) {
          trend = "increasing";
        } else if (last < first * 0.9) {
          trend = "decreasing";
        }
      }

      const startDate = groupedData.length > 0 ? new Date(groupedData[0].date) : new Date();
      const endDate = groupedData.length > 0
        ? new Date(groupedData[groupedData.length - 1].date)
        : new Date();

      return {
        assetUrn,
        period,
        startDate,
        endDate,
        dataPoints: groupedData,
        growthRate,
        trend,
      };
    } catch (error) {
      logger.error({ error, assetUrn, period }, "Failed to get usage trend");
      throw new KernelError("Failed to get usage trend", "USAGE_TREND_FAILED", error);
    }
  }

  /**
   * Get popular assets.
   */
  async getPopularAssets(
    tenantId: string | null,
    limit: number = 10,
    days: number = 30
  ): Promise<PopularAsset[]> {
    try {
      const assets = await analyticsRepository.getPopularAssets(tenantId, limit, days);

      return assets.map((asset) => ({
        assetUrn: asset.assetUrn,
        assetType: asset.assetType,
        assetName: asset.assetUrn.split(':').pop() || asset.assetUrn,
        totalUsage: asset.totalUsage,
        uniqueUsers: asset.uniqueUsers,
        lastUsedAt: asset.lastUsedAt,
        usageGrowth: asset.usageGrowth,
      }));
    } catch (error) {
      logger.error({ error }, "Failed to get popular assets");
      throw new KernelError("Failed to get popular assets", "POPULAR_ASSETS_FAILED", error);
    }
  }

  /**
   * Get user activity.
   */
  async getUserActivity(
    tenantId: string | null,
    userId: string,
    days: number = 30
  ): Promise<UserActivity | null> {
    try {
      const activity = await analyticsRepository.getUserActivity(tenantId, userId, days);

      if (!activity) {
        return null;
      }

      return {
        userId: activity.userId,
        userName: activity.userName,
        userEmail: activity.userEmail,
        totalActions: activity.totalActions,
        assetsAccessed: activity.assetsAccessed,
        mostUsedAssets: activity.mostUsedAssets,
        lastActivityAt: activity.lastActivityAt,
        activityTrend: activity.activityTrend,
      };
    } catch (error) {
      logger.error({ error, userId }, "Failed to get user activity");
      throw new KernelError("Failed to get user activity", "USER_ACTIVITY_FAILED", error);
    }
  }
}

export const analyticsService = new AnalyticsService();

