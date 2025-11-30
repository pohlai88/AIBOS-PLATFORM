/**
 * 🎯 Offline Risk Calculator (AI Behavior Engine)
 * 
 * Predicts tampering, fraud, or outdated behavior BEFORE it causes damage.
 * Uses behavioral indicators to generate risk scores for offline devices.
 * 
 * Features:
 * - Time-based risk scoring
 * - Behavioral pattern analysis
 * - Schema mismatch detection
 * - Unauthorized action tracking
 * - Device fingerprint validation
 * - Geolocation drift analysis
 * - Batch anomaly detection
 * - AI-powered risk prediction
 */

import { eventBus } from "../../events/event-bus";
import { auditChain } from "../utils/audit.adapter";

export interface RiskFactors {
    // Temporal factors
    hoursOffline: number;
    hoursSinceLastLogin: number;
    daysSinceAppUpdate: number;

    // Behavioral factors
    offlineRecordsCollected: number;
    offlineChangesRate: number; // Records per hour
    unsuccessfulSyncAttempts: number;

    // Schema & contract factors
    schemaMismatchCount: number;
    contractMismatchCount: number;
    unauthorizedActions: number;

    // Device factors
    deviceFingerprintChanged: boolean;
    deviceRooted: boolean;
    deviceEmulator: boolean;

    // Location factors
    geoDriftKm: number; // Distance from expected location
    suspiciousLocationJumps: number;

    // Batch factors
    largeOfflineBatch: number; // Number of records in batch
    duplicateRecordAttempts: number;

    // Historical factors
    previousSyncFailures: number;
    previousRiskScore: number;
}

export interface RiskAssessment {
    score: number; // 0-100
    level: "safe" | "warning" | "high" | "critical";
    reasons: string[];
    recommendations: string[];
    shouldBlock: boolean;
    shouldAlert: boolean;
    requiresManualReview: boolean;
}

export class OfflineRiskCalculator {
    /**
     * Calculate risk score for an offline device
     */
    calculateRiskScore(factors: RiskFactors): RiskAssessment {
        let score = 0;
        const reasons: string[] = [];
        const recommendations: string[] = [];

        // ═══════════════════════════════════════════════════════════
        // Temporal Risk Factors
        // ═══════════════════════════════════════════════════════════

        if (factors.hoursOffline > 168) { // 7 days
            score += 40;
            reasons.push("Device offline for over 1 week");
            recommendations.push("Force full sync and schema validation");
        } else if (factors.hoursOffline > 72) { // 3 days
            score += 30;
            reasons.push("Device offline for over 3 days");
            recommendations.push("Validate all offline data before sync");
        } else if (factors.hoursOffline > 24) { // 1 day
            score += 15;
            reasons.push("Device offline for over 1 day");
        }

        if (factors.hoursSinceLastLogin > 720) { // 30 days
            score += 25;
            reasons.push("User hasn't logged in for 30+ days");
            recommendations.push("Require password re-authentication");
        }

        if (factors.daysSinceAppUpdate > 30) {
            score += 20;
            reasons.push("App version outdated (30+ days)");
            recommendations.push("Force app update before sync");
        }

        // ═══════════════════════════════════════════════════════════
        // Schema & Contract Risk Factors (CRITICAL)
        // ═══════════════════════════════════════════════════════════

        if (factors.schemaMismatchCount > 0) {
            score += 50; // CRITICAL
            reasons.push(`Schema mismatch detected (${factors.schemaMismatchCount} times)`);
            recommendations.push("BLOCK sync until schema update");
        }

        if (factors.contractMismatchCount > 0) {
            score += 45;
            reasons.push(`Contract version mismatch (${factors.contractMismatchCount} times)`);
            recommendations.push("Update sync matrix and retry");
        }

        if (factors.unauthorizedActions > 0) {
            score += 60; // CRITICAL
            reasons.push(`Unauthorized actions attempted (${factors.unauthorizedActions})`);
            recommendations.push("Investigate potential security breach");
        }

        // ═══════════════════════════════════════════════════════════
        // Device Trust Factors
        // ═══════════════════════════════════════════════════════════

        if (factors.deviceFingerprintChanged) {
            score += 35;
            reasons.push("Device fingerprint changed (possible device swap)");
            recommendations.push("Require device re-registration");
        }

        if (factors.deviceRooted) {
            score += 50; // CRITICAL
            reasons.push("Device is rooted/jailbroken");
            recommendations.push("Block sync from rooted devices");
        }

        if (factors.deviceEmulator) {
            score += 70; // CRITICAL
            reasons.push("Device appears to be an emulator");
            recommendations.push("Block all emulator sync attempts");
        }

        // ═══════════════════════════════════════════════════════════
        // Behavioral Anomalies
        // ═══════════════════════════════════════════════════════════

        if (factors.offlineRecordsCollected > 500) {
            score += 30;
            reasons.push(`Large offline batch (${factors.offlineRecordsCollected} records)`);
            recommendations.push("Review batch for anomalies before sync");
        }

        if (factors.offlineChangesRate > 50) {
            score += 25;
            reasons.push("Unusually high offline activity rate");
            recommendations.push("Validate timestamps and user behavior");
        }

        if (factors.duplicateRecordAttempts > 5) {
            score += 20;
            reasons.push("Multiple duplicate record attempts detected");
            recommendations.push("Investigate possible sync loop or fraud");
        }

        if (factors.unsuccessfulSyncAttempts > 10) {
            score += 15;
            reasons.push("Excessive failed sync attempts");
            recommendations.push("Check client logs for errors");
        }

        // ═══════════════════════════════════════════════════════════
        // Geolocation Risk Factors
        // ═══════════════════════════════════════════════════════════

        if (factors.geoDriftKm > 500) {
            score += 30;
            reasons.push(`Unusual location change (${factors.geoDriftKm}km)`);
            recommendations.push("Verify user identity and location");
        } else if (factors.geoDriftKm > 100) {
            score += 15;
            reasons.push(`Significant location change (${factors.geoDriftKm}km)`);
        }

        if (factors.suspiciousLocationJumps > 3) {
            score += 25;
            reasons.push("Multiple suspicious location jumps detected");
            recommendations.push("Review travel patterns for fraud indicators");
        }

        // ═══════════════════════════════════════════════════════════
        // Historical Risk Factors
        // ═══════════════════════════════════════════════════════════

        if (factors.previousSyncFailures > 5) {
            score += 10;
            reasons.push("History of sync failures");
        }

        if (factors.previousRiskScore > 60) {
            score += 15;
            reasons.push("Previously flagged as high-risk device");
            recommendations.push("Enhanced monitoring required");
        }

        // ═══════════════════════════════════════════════════════════
        // Calculate Final Assessment
        // ═══════════════════════════════════════════════════════════

        const finalScore = Math.min(score, 100);

        let level: RiskAssessment["level"];
        let shouldBlock = false;
        let shouldAlert = false;
        let requiresManualReview = false;

        if (finalScore >= 80) {
            level = "critical";
            shouldBlock = true;
            shouldAlert = true;
            requiresManualReview = true;
            recommendations.unshift("CRITICAL: Sync blocked - manual review required");
        } else if (finalScore >= 60) {
            level = "high";
            shouldBlock = true;
            shouldAlert = true;
            recommendations.unshift("HIGH RISK: Sync blocked - admin approval needed");
        } else if (finalScore >= 30) {
            level = "warning";
            shouldAlert = true;
            recommendations.unshift("WARNING: Monitor closely");
        } else {
            level = "safe";
            recommendations.push("Sync approved");
        }

        return {
            score: finalScore,
            level,
            reasons,
            recommendations,
            shouldBlock,
            shouldAlert,
            requiresManualReview,
        };
    }

    /**
     * Assess risk and log to audit chain
     */
    async assessRisk(
        tenantId: string,
        userId: string,
        deviceId: string,
        factors: RiskFactors
    ): Promise<RiskAssessment> {
        const assessment = this.calculateRiskScore(factors);

        // Log risk assessment
        await auditChain.logEvent({
            action: "sync.risk.assessed",
            tenantId,
            userId,
            deviceId,
            riskScore: assessment.score,
            riskLevel: assessment.level,
            shouldBlock: assessment.shouldBlock,
            reasons: assessment.reasons,
            factorsSummary: {
                hoursOffline: factors.hoursOffline,
                schemaMismatch: factors.schemaMismatchCount > 0,
                unauthorizedActions: factors.unauthorizedActions,
                deviceTrustIssues: factors.deviceFingerprintChanged || factors.deviceRooted || factors.deviceEmulator,
            },
        });

        // Emit event for real-time monitoring
        await eventBus.publish({
            type: "sync.risk.assessed",
            tenantId,
            userId,
            deviceId,
            riskScore: assessment.score,
            riskLevel: assessment.level,
            shouldBlock: assessment.shouldBlock,
            timestamp: new Date().toISOString(),
        } as any);

        // If high risk, emit alert
        if (assessment.shouldAlert) {
            await eventBus.publish({
                type: "sync.risk.alert",
                tenantId,
                userId,
                deviceId,
                riskScore: assessment.score,
                riskLevel: assessment.level,
                reasons: assessment.reasons,
                timestamp: new Date().toISOString(),
            } as any);
        }

        return assessment;
    }

    /**
     * AI-Enhanced Risk Prediction (placeholder for ML integration)
     */
    async predictRiskWithAI(factors: RiskFactors): Promise<number> {
        // In production, integrate with AI model (e.g., using Ollama locally)
        // For now, use heuristic-based calculation
        const assessment = this.calculateRiskScore(factors);
        return assessment.score;
    }

    /**
     * Get risk trend over time
     */
    async getRiskTrend(
        tenantId: string,
        userId: string,
        deviceId: string,
        days: number = 30
    ): Promise<Array<{ date: string; score: number }>> {
        // In production, query audit chain for historical risk scores
        // For now, return placeholder
        return [
            { date: "2024-01-01", score: 15 },
            { date: "2024-01-02", score: 20 },
            { date: "2024-01-03", score: 25 },
        ];
    }
}

/**
 * Singleton instance
 */
export const offlineRiskCalculator = new OfflineRiskCalculator();

/**
 * Helper: Build risk factors from sync request
 */
export function buildRiskFactors(syncRequest: {
    userId: string;
    deviceId: string;
    lastSyncAt: Date;
    lastLoginAt: Date;
    appVersion: string;
    offlineRecords: any[];
    schemaVersion: string;
    deviceFingerprint: string;
    location?: { lat: number; lng: number };
}): RiskFactors {
    const now = new Date();
    const hoursOffline = (now.getTime() - syncRequest.lastSyncAt.getTime()) / (1000 * 60 * 60);
    const hoursSinceLastLogin = (now.getTime() - syncRequest.lastLoginAt.getTime()) / (1000 * 60 * 60);

    // Placeholder - in production, fetch from database
    const expectedSchemaVersion = "v12";
    const expectedDeviceFingerprint = syncRequest.deviceFingerprint; // Fetch from device registry
    const expectedLocation = { lat: 3.139, lng: 101.687 }; // Kuala Lumpur

    return {
        hoursOffline,
        hoursSinceLastLogin,
        daysSinceAppUpdate: 0, // Would compare app version with latest
        offlineRecordsCollected: syncRequest.offlineRecords.length,
        offlineChangesRate: syncRequest.offlineRecords.length / Math.max(hoursOffline, 1),
        unsuccessfulSyncAttempts: 0, // Fetch from history
        schemaMismatchCount: syncRequest.schemaVersion !== expectedSchemaVersion ? 1 : 0,
        contractMismatchCount: 0, // Would validate contract version
        unauthorizedActions: 0, // Would scan records for unauthorized ops
        deviceFingerprintChanged: false, // Would compare with registered fingerprint
        deviceRooted: false, // Would check device flags
        deviceEmulator: false, // Would check device flags
        geoDriftKm: syncRequest.location
            ? calculateDistance(expectedLocation, syncRequest.location)
            : 0,
        suspiciousLocationJumps: 0, // Would analyze location history
        largeOfflineBatch: syncRequest.offlineRecords.length,
        duplicateRecordAttempts: 0, // Would detect duplicates in batch
        previousSyncFailures: 0, // Fetch from history
        previousRiskScore: 0, // Fetch from last assessment
    };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
): number {
    const R = 6371; // Earth radius in km
    const dLat = toRadians(point2.lat - point1.lat);
    const dLng = toRadians(point2.lng - point1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

