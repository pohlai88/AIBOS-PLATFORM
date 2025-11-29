/**
 * 📊 Admin Stale Users Monitor (Field Workforce Watchtower)
 * 
 * Real-time monitoring of offline field workers with risk assessment.
 * Backend API for admin dashboard.
 * 
 * Features:
 * - Track last online timestamp
 * - Monitor pending offline items
 * - Calculate behavior risk scores
 * - Detect schema mismatch attempts
 * - Track device fingerprints
 * - Monitor location patterns
 * - Alert on high-risk users
 * - Force logout stale devices
 */

import { eventBus } from "../../events/event-bus";
import { auditChain } from "../utils/audit.adapter";
import { offlineRiskCalculator } from "../risk-calculator/offline-risk.calculator";

export interface StaleUserRecord {
    userId: string;
    userName: string;
    deviceId: string;
    deviceName: string;
    tenantId: string;

    // Status
    lastSeenAt: string;
    lastSyncAt: string;
    lastLoginAt: string;
    hoursOffline: number;

    // Offline data
    pendingOfflineItems: number;
    lastOfflineAction?: string;

    // Risk assessment
    riskScore: number;
    riskLevel: "safe" | "warning" | "high" | "critical";
    riskReasons: string[];

    // Device info
    deviceFingerprint: string;
    deviceFingerprintChanged: boolean;
    appVersion: string;
    isAppOutdated: boolean;

    // Location
    lastKnownLocation?: {
        lat: number;
        lng: number;
        timestamp: string;
    };
    locationDriftKm?: number;

    // Schema & contract
    schemaVersion: string;
    isSchemaOutdated: boolean;
    schemaMismatchAttempts: number;
    contractVersion: string;
    isContractOutdated: boolean;

    // Admin actions
    status: "active" | "warning" | "blocked" | "forced_logout";
    blockedReason?: string;
    blockedAt?: string;

    // Historical
    totalSyncs: number;
    failedSyncs: number;
    successRate: number;
}

export interface StaleUsersQuery {
    tenantId: string;
    minHoursOffline?: number;
    maxRiskScore?: number;
    minRiskScore?: number;
    status?: StaleUserRecord["status"];
    limit?: number;
    offset?: number;
    sortBy?: "lastSeenAt" | "riskScore" | "hoursOffline" | "pendingOfflineItems";
    sortOrder?: "asc" | "desc";
}

export interface StaleUsersStats {
    totalUsers: number;
    onlineUsers: number;
    offlineUsers: number;
    staleUsers: number; // Offline > 24h
    criticalUsers: number; // Risk score > 80
    blockedUsers: number;
    averageRiskScore: number;
    averageHoursOffline: number;
    totalPendingItems: number;
}

export class StaleUsersMonitor {
    /**
     * Get list of stale/offline users with risk assessment
     */
    async getStaleUsers(query: StaleUsersQuery): Promise<{
        users: StaleUserRecord[];
        total: number;
        stats: StaleUsersStats;
    }> {
        // In production, query database for user sync/activity records
        const users = await this.fetchUsersFromDatabase(query);

        // Calculate risk scores for each user
        const enrichedUsers = await Promise.all(
            users.map(user => this.enrichUserWithRiskAssessment(user))
        );

        // Filter and sort
        let filteredUsers = enrichedUsers;

        if (query.minHoursOffline) {
            filteredUsers = filteredUsers.filter(u => u.hoursOffline >= query.minHoursOffline!);
        }

        if (query.maxRiskScore) {
            filteredUsers = filteredUsers.filter(u => u.riskScore <= query.maxRiskScore!);
        }

        if (query.minRiskScore) {
            filteredUsers = filteredUsers.filter(u => u.riskScore >= query.minRiskScore!);
        }

        if (query.status) {
            filteredUsers = filteredUsers.filter(u => u.status === query.status);
        }

        // Sort
        const sortBy = query.sortBy || "riskScore";
        const sortOrder = query.sortOrder || "desc";

        filteredUsers.sort((a, b) => {
            const aVal = a[sortBy] as number;
            const bVal = b[sortBy] as number;
            return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        });

        // Paginate
        const limit = query.limit || 50;
        const offset = query.offset || 0;
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);

        // Calculate stats
        const stats = this.calculateStats(enrichedUsers);

        return {
            users: paginatedUsers,
            total: filteredUsers.length,
            stats,
        };
    }

    /**
     * Get user details including sync history
     */
    async getUserDetails(
        tenantId: string,
        userId: string,
        deviceId?: string
    ): Promise<StaleUserRecord & {
        syncHistory: Array<{
            timestamp: string;
            status: "success" | "failed" | "blocked";
            recordssynced: number;
            errorMessage?: string;
        }>;
        riskHistory: Array<{
            timestamp: string;
            score: number;
            level: string;
        }>;
    }> {
        // Fetch user record
        const user = await this.fetchUserFromDatabase(tenantId, userId, deviceId);
        const enrichedUser = await this.enrichUserWithRiskAssessment(user);

        // Fetch sync history from audit chain
        const syncHistory = await this.fetchSyncHistory(tenantId, userId, deviceId);

        // Fetch risk history
        const riskHistory = await this.fetchRiskHistory(tenantId, userId, deviceId);

        return {
            ...enrichedUser,
            syncHistory,
            riskHistory,
        };
    }

    /**
     * Block user from syncing
     */
    async blockUser(
        tenantId: string,
        userId: string,
        deviceId: string,
        reason: string,
        adminId: string
    ): Promise<void> {
        // Update user status in database
        await this.updateUserStatus(tenantId, userId, deviceId, "blocked", reason);

        // Log admin action
        await auditChain.logEvent("user.blocked", {
            tenantId,
            userId,
            deviceId,
            reason,
            adminId,
            timestamp: new Date().toISOString(),
        });

        // Emit event for real-time updates
        await eventBus.publish("user.blocked", {
            type: "user.blocked",
            tenantId,
            userId,
            deviceId,
            reason,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Unblock user
     */
    async unblockUser(
        tenantId: string,
        userId: string,
        deviceId: string,
        adminId: string
    ): Promise<void> {
        await this.updateUserStatus(tenantId, userId, deviceId, "active", undefined);

        await auditChain.logEvent("user.unblocked", {
            tenantId,
            userId,
            deviceId,
            adminId,
            timestamp: new Date().toISOString(),
        });

        await eventBus.publish("user.unblocked", {
            type: "user.unblocked",
            tenantId,
            userId,
            deviceId,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Force logout user (invalidate all sessions)
     */
    async forceLogout(
        tenantId: string,
        userId: string,
        deviceId: string,
        adminId: string
    ): Promise<void> {
        await this.updateUserStatus(tenantId, userId, deviceId, "forced_logout", "Admin forced logout");

        // Invalidate sync matrix
        await this.invalidateSyncMatrix(tenantId, userId, deviceId);

        // Revoke device trust
        await this.revokeDeviceTrust(deviceId);

        await auditChain.logEvent("user.force_logout", {
            tenantId,
            userId,
            deviceId,
            adminId,
            timestamp: new Date().toISOString(),
        });

        await eventBus.publish("user.force_logout", {
            type: "user.force_logout",
            tenantId,
            userId,
            deviceId,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Get real-time stats (for dashboard widgets)
     */
    async getRealtimeStats(tenantId: string): Promise<StaleUsersStats> {
        const users = await this.fetchUsersFromDatabase({ tenantId });
        const enrichedUsers = await Promise.all(
            users.map(user => this.enrichUserWithRiskAssessment(user))
        );
        return this.calculateStats(enrichedUsers);
    }

    /**
     * Subscribe to real-time updates (WebSocket/SSE)
     */
    subscribeToUpdates(
        tenantId: string,
        callback: (event: {
            type: "user_offline" | "user_online" | "risk_alert" | "sync_blocked";
            user: Partial<StaleUserRecord>;
        }) => void
    ): () => void {
        // Set up event listeners
        const unsubscribers: Array<() => void> = [];

        unsubscribers.push(
            eventBus.subscribe("sync.completed", (event: any) => {
                if (event.tenantId === tenantId) {
                    callback({
                        type: "user_online",
                        user: { userId: event.userId, deviceId: event.deviceId },
                    });
                }
            })
        );

        unsubscribers.push(
            eventBus.subscribe("sync.risk.alert", (event: any) => {
                if (event.tenantId === tenantId) {
                    callback({
                        type: "risk_alert",
                        user: { userId: event.userId, deviceId: event.deviceId },
                    });
                }
            })
        );

        unsubscribers.push(
            eventBus.subscribe("sync.rejected", (event: any) => {
                if (event.tenantId === tenantId) {
                    callback({
                        type: "sync_blocked",
                        user: { userId: event.userId, deviceId: event.deviceId },
                    });
                }
            })
        );

        // Return cleanup function
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }

    // ═══════════════════════════════════════════════════════════
    // Private Helpers
    // ═══════════════════════════════════════════════════════════

    private async fetchUsersFromDatabase(query: StaleUsersQuery): Promise<StaleUserRecord[]> {
        // In production, query actual database
        // For now, return mock data
        return [
            {
                userId: "user-worker-a",
                userName: "Worker A",
                deviceId: "device-123",
                deviceName: "Samsung Galaxy A52",
                tenantId: query.tenantId,
                lastSeenAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                lastSyncAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                lastLoginAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                hoursOffline: 72,
                pendingOfflineItems: 52,
                lastOfflineAction: "Created inventory adjustment",
                riskScore: 0,
                riskLevel: "safe",
                riskReasons: [],
                deviceFingerprint: "abc123",
                deviceFingerprintChanged: false,
                appVersion: "1.2.0",
                isAppOutdated: true,
                schemaVersion: "v11",
                isSchemaOutdated: true,
                schemaMismatchAttempts: 2,
                contractVersion: "2025.01.10",
                isContractOutdated: true,
                status: "warning",
                totalSyncs: 150,
                failedSyncs: 5,
                successRate: 96.7,
            },
            {
                userId: "user-worker-b",
                userName: "Worker B",
                deviceId: "device-456",
                deviceName: "iPhone 13",
                tenantId: query.tenantId,
                lastSeenAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                hoursOffline: 2,
                pendingOfflineItems: 8,
                riskScore: 0,
                riskLevel: "safe",
                riskReasons: [],
                deviceFingerprint: "def456",
                deviceFingerprintChanged: false,
                appVersion: "1.3.0",
                isAppOutdated: false,
                schemaVersion: "v12",
                isSchemaOutdated: false,
                schemaMismatchAttempts: 0,
                contractVersion: "2025.01.17",
                isContractOutdated: false,
                status: "active",
                totalSyncs: 200,
                failedSyncs: 2,
                successRate: 99.0,
            },
        ];
    }

    private async fetchUserFromDatabase(
        tenantId: string,
        userId: string,
        deviceId?: string
    ): Promise<StaleUserRecord> {
        const users = await this.fetchUsersFromDatabase({ tenantId });
        return users[0]; // Placeholder
    }

    private async enrichUserWithRiskAssessment(user: StaleUserRecord): Promise<StaleUserRecord> {
        const riskAssessment = offlineRiskCalculator.calculateRiskScore({
            hoursOffline: user.hoursOffline,
            hoursSinceLastLogin: (Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60),
            daysSinceAppUpdate: user.isAppOutdated ? 30 : 0,
            offlineRecordsCollected: user.pendingOfflineItems,
            offlineChangesRate: user.pendingOfflineItems / Math.max(user.hoursOffline, 1),
            unsuccessfulSyncAttempts: user.failedSyncs,
            schemaMismatchCount: user.schemaMismatchAttempts,
            contractMismatchCount: user.isContractOutdated ? 1 : 0,
            unauthorizedActions: 0,
            deviceFingerprintChanged: user.deviceFingerprintChanged,
            deviceRooted: false,
            deviceEmulator: false,
            geoDriftKm: user.locationDriftKm || 0,
            suspiciousLocationJumps: 0,
            largeOfflineBatch: user.pendingOfflineItems,
            duplicateRecordAttempts: 0,
            previousSyncFailures: user.failedSyncs,
            previousRiskScore: user.riskScore,
        });

        return {
            ...user,
            riskScore: riskAssessment.score,
            riskLevel: riskAssessment.level,
            riskReasons: riskAssessment.reasons,
            status: riskAssessment.shouldBlock ? "blocked" : user.status,
        };
    }

    private calculateStats(users: StaleUserRecord[]): StaleUsersStats {
        const now = Date.now();

        return {
            totalUsers: users.length,
            onlineUsers: users.filter(u => u.hoursOffline < 1).length,
            offlineUsers: users.filter(u => u.hoursOffline >= 1).length,
            staleUsers: users.filter(u => u.hoursOffline >= 24).length,
            criticalUsers: users.filter(u => u.riskScore >= 80).length,
            blockedUsers: users.filter(u => u.status === "blocked").length,
            averageRiskScore: users.reduce((sum, u) => sum + u.riskScore, 0) / users.length,
            averageHoursOffline: users.reduce((sum, u) => sum + u.hoursOffline, 0) / users.length,
            totalPendingItems: users.reduce((sum, u) => sum + u.pendingOfflineItems, 0),
        };
    }

    private async fetchSyncHistory(tenantId: string, userId: string, deviceId?: string): Promise<any[]> {
        // Query audit chain for sync events
        return [];
    }

    private async fetchRiskHistory(tenantId: string, userId: string, deviceId?: string): Promise<any[]> {
        // Query audit chain for risk assessment events
        return [];
    }

    private async updateUserStatus(
        tenantId: string,
        userId: string,
        deviceId: string,
        status: StaleUserRecord["status"],
        reason?: string
    ): Promise<void> {
        // Update in database
        // Import logger dynamically to avoid circular dependency
        const { baseLogger } = await import("../../observability/logger");
        baseLogger.info({ userId, status }, "[Stale Users Monitor] Updated user status: %s -> %s", userId, status);
    }

    private async invalidateSyncMatrix(tenantId: string, userId: string, deviceId: string): Promise<void> {
        // Mark sync matrix as invalid in database
        // Import logger dynamically to avoid circular dependency
        const { baseLogger } = await import("../../observability/logger");
        baseLogger.info({ userId }, "[Stale Users Monitor] Invalidated sync matrix for %s", userId);
    }

    private async revokeDeviceTrust(deviceId: string): Promise<void> {
        // Revoke device trust in device registry
        // Import logger dynamically to avoid circular dependency
        const { baseLogger } = await import("../../observability/logger");
        baseLogger.info({ deviceId }, "[Stale Users Monitor] Revoked device trust: %s", deviceId);
    }
}

/**
 * Singleton instance
 */
export const staleUsersMonitor = new StaleUsersMonitor();

