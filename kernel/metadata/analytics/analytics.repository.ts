/**
 * Analytics Repository
 *
 * GRCD v4.1.0 Compliant: Usage analytics repository
 * Phase 3.3: Usage Analytics Service
 */

import { getDB } from "../../storage/db";
import type { UsageLog, CreateUsageLog } from "./types";
import { ZUsageLog, ZCreateUsageLog } from "./types";
import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";

const logger = baseLogger.child({ module: "analytics-repository" });

export class AnalyticsRepository {
  /**
   * Log usage activity.
   */
  async logUsage(input: CreateUsageLog): Promise<UsageLog> {
    const validated = ZCreateUsageLog.parse(input);
    const db = getDB().getClient();

    try {
      const res = await db.query<UsageLog>(
        `
        INSERT INTO mdm_usage_log (
          tenant_id, asset_urn, asset_type, action, user_id, user_name, user_email,
          context, ip_address, user_agent, duration_ms, success, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING
          id,
          tenant_id AS "tenantId",
          asset_urn AS "assetUrn",
          asset_type AS "assetType",
          action,
          user_id AS "userId",
          user_name AS "userName",
          user_email AS "userEmail",
          context,
          ip_address AS "ipAddress",
          user_agent AS "userAgent",
          duration_ms AS "durationMs",
          success,
          error_message AS "errorMessage",
          created_at AS "createdAt"
        `,
        [
          validated.tenantId,
          validated.assetUrn,
          validated.assetType,
          validated.action,
          validated.userId,
          validated.userName,
          validated.userEmail,
          JSON.stringify(validated.context || {}),
          validated.ipAddress,
          validated.userAgent,
          validated.durationMs,
          validated.success,
          validated.errorMessage,
        ],
      );

      return ZUsageLog.parse({
        ...res.rows[0],
        context: res.rows[0].context || {},
        createdAt: new Date(res.rows[0].createdAt),
      });
    } catch (error) {
      logger.error({ error, input }, "Failed to log usage");
      throw new KernelError("Failed to log usage", "USAGE_LOG_CREATE_FAILED", error);
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
    const db = getDB().getClient();

    const res = await db.query<UsageLog>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        asset_urn AS "assetUrn",
        asset_type AS "assetType",
        action,
        user_id AS "userId",
        user_name AS "userName",
        user_email AS "userEmail",
        context,
        ip_address AS "ipAddress",
        user_agent AS "userAgent",
        duration_ms AS "durationMs",
        success,
        error_message AS "errorMessage",
        created_at AS "createdAt"
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND asset_urn = $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
      `,
      [tenantId, assetUrn, limit, offset],
    );

    return res.rows.map((row) => ZUsageLog.parse({
      ...row,
      context: row.context || {},
      createdAt: new Date(row.createdAt),
    }));
  }

  /**
   * Get usage statistics for an asset.
   */
  async getUsageStats(
    tenantId: string | null,
    assetUrn: string,
    days: number = 30
  ): Promise<any> {
    const db = getDB().getClient();

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get basic statistics
    const statsRes = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE action = 'view')::BIGINT as total_views,
        COUNT(*) FILTER (WHERE action = 'query')::BIGINT as total_queries,
        COUNT(*) FILTER (WHERE action = 'export')::BIGINT as total_exports,
        COUNT(*) FILTER (WHERE action = 'update')::BIGINT as total_updates,
        COUNT(DISTINCT user_id)::BIGINT as total_users,
        MAX(created_at) FILTER (WHERE action = 'view') as last_viewed_at,
        MAX(created_at) FILTER (WHERE action = 'query') as last_queried_at,
        MAX(created_at) FILTER (WHERE action = 'update') as last_updated_at,
        AVG(duration_ms) FILTER (WHERE action = 'query' AND duration_ms IS NOT NULL)::NUMERIC as avg_query_duration_ms,
        (COUNT(*) FILTER (WHERE success = TRUE)::NUMERIC / NULLIF(COUNT(*), 0) * 100)::NUMERIC as success_rate
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND asset_urn = $2 AND created_at >= $3
    `, [tenantId, assetUrn, since]);

    const stats = statsRes.rows[0];

    // Get unique users
    const usersRes = await db.query(`
      SELECT DISTINCT user_id, user_name, user_email
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND asset_urn = $2 AND created_at >= $3
    `, [tenantId, assetUrn, since]);

    // Get most active users
    const activeUsersRes = await db.query(`
      SELECT
        user_id,
        user_name,
        user_email,
        COUNT(*)::BIGINT as action_count
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND asset_urn = $2 AND created_at >= $3
      GROUP BY user_id, user_name, user_email
      ORDER BY action_count DESC
      LIMIT 10
    `, [tenantId, assetUrn, since]);

    // Get usage trend (daily)
    const trendRes = await db.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) FILTER (WHERE action = 'view')::BIGINT as views,
        COUNT(*) FILTER (WHERE action = 'query')::BIGINT as queries,
        COUNT(*) FILTER (WHERE action = 'export')::BIGINT as exports,
        COUNT(*) FILTER (WHERE action = 'update')::BIGINT as updates
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND asset_urn = $2 AND created_at >= $3
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [tenantId, assetUrn, since]);

    // Get peak usage hour
    const peakHourRes = await db.query(`
      SELECT
        EXTRACT(HOUR FROM created_at)::INTEGER as hour,
        COUNT(*)::BIGINT as usage_count
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND asset_urn = $2 AND created_at >= $3
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY usage_count DESC
      LIMIT 1
    `, [tenantId, assetUrn, since]);

    // Get peak usage day
    const peakDayRes = await db.query(`
      SELECT
        TO_CHAR(created_at, 'Day') as day,
        COUNT(*)::BIGINT as usage_count
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND asset_urn = $2 AND created_at >= $3
      GROUP BY TO_CHAR(created_at, 'Day')
      ORDER BY usage_count DESC
      LIMIT 1
    `, [tenantId, assetUrn, since]);

    return {
      totalViews: Number(stats.total_views || 0),
      totalQueries: Number(stats.total_queries || 0),
      totalExports: Number(stats.total_exports || 0),
      totalUpdates: Number(stats.total_updates || 0),
      totalUsers: Number(stats.total_users || 0),
      uniqueUsers: usersRes.rows.map((row) => row.user_id),
      mostActiveUsers: activeUsersRes.rows.map((row) => ({
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        actionCount: Number(row.action_count),
      })),
      lastViewedAt: stats.last_viewed_at ? new Date(stats.last_viewed_at) : null,
      lastQueriedAt: stats.last_queried_at ? new Date(stats.last_queried_at) : null,
      lastUpdatedAt: stats.last_updated_at ? new Date(stats.last_updated_at) : null,
      averageQueryDurationMs: stats.avg_query_duration_ms ? Number(stats.avg_query_duration_ms) : null,
      successRate: stats.success_rate ? Number(stats.success_rate) : 100,
      usageTrend: trendRes.rows.map((row) => ({
        date: row.date.toISOString().split('T')[0],
        views: Number(row.views),
        queries: Number(row.queries),
        exports: Number(row.exports),
        updates: Number(row.updates),
      })),
      peakUsageHour: peakHourRes.rows[0] ? Number(peakHourRes.rows[0].hour) : null,
      peakUsageDay: peakDayRes.rows[0] ? peakDayRes.rows[0].day.trim() : null,
    };
  }

  /**
   * Get popular assets.
   */
  async getPopularAssets(
    tenantId: string | null,
    limit: number = 10,
    days: number = 30
  ): Promise<any[]> {
    const db = getDB().getClient();

    const since = new Date();
    since.setDate(since.getDate() - days);

    const res = await db.query(`
      SELECT
        asset_urn,
        asset_type,
        COUNT(*)::BIGINT as total_usage,
        COUNT(DISTINCT user_id)::BIGINT as unique_users,
        MAX(created_at) as last_used_at
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND created_at >= $2
      GROUP BY asset_urn, asset_type
      ORDER BY total_usage DESC
      LIMIT $3
    `, [tenantId, since, limit]);

    return res.rows.map((row) => ({
      assetUrn: row.asset_urn,
      assetType: row.asset_type,
      totalUsage: Number(row.total_usage),
      uniqueUsers: Number(row.unique_users),
      lastUsedAt: new Date(row.last_used_at),
      usageGrowth: 0,  // Would need previous period comparison
    }));
  }

  /**
   * Get user activity.
   */
  async getUserActivity(
    tenantId: string | null,
    userId: string,
    days: number = 30
  ): Promise<any> {
    const db = getDB().getClient();

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get user info
    const userRes = await db.query(`
      SELECT DISTINCT user_id, user_name, user_email
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND user_id = $2
      LIMIT 1
    `, [tenantId, userId]);

    if (userRes.rowCount === 0) {
      return null;
    }

    const user = userRes.rows[0];

    // Get activity stats
    const statsRes = await db.query(`
      SELECT
        COUNT(*)::BIGINT as total_actions,
        COUNT(DISTINCT asset_urn)::BIGINT as assets_accessed,
        MAX(created_at) as last_activity_at
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND user_id = $2 AND created_at >= $3
    `, [tenantId, userId, since]);

    const stats = statsRes.rows[0];

    // Get most used assets
    const assetsRes = await db.query(`
      SELECT
        asset_urn,
        asset_type,
        COUNT(*)::BIGINT as action_count
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND user_id = $2 AND created_at >= $3
      GROUP BY asset_urn, asset_type
      ORDER BY action_count DESC
      LIMIT 10
    `, [tenantId, userId, since]);

    // Get activity trend (daily)
    const trendRes = await db.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*)::BIGINT as action_count
      FROM mdm_usage_log
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND user_id = $2 AND created_at >= $3
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [tenantId, userId, since]);

    return {
      userId: user.user_id,
      userName: user.user_name,
      userEmail: user.user_email,
      totalActions: Number(stats.total_actions || 0),
      assetsAccessed: Number(stats.assets_accessed || 0),
      mostUsedAssets: assetsRes.rows.map((row) => ({
        assetUrn: row.asset_urn,
        assetType: row.asset_type,
        actionCount: Number(row.action_count),
      })),
      lastActivityAt: stats.last_activity_at ? new Date(stats.last_activity_at) : null,
      activityTrend: trendRes.rows.map((row) => ({
        date: row.date.toISOString().split('T')[0],
        actionCount: Number(row.action_count),
      })),
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();

