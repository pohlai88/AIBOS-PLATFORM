/**
 * 🔐 Device Trust Manager & Legacy System Blocker
 * 
 * Zero-trust device validation and legacy system prevention.
 * Blocks outdated apps, cracked APKs, rooted devices, and emulators.
 * 
 * Features:
 * - Device fingerprinting
 * - Trust score calculation
 * - Legacy version blocking
 * - Rooted/jailbroken detection
 * - Emulator detection
 * - APK signature verification
 * - Device registration & revocation
 * - Automatic trust expiry
 */

import crypto from "node:crypto";
import { eventBus } from "../../events/event-bus";
import { auditChain } from "../utils/audit.adapter";

export interface DeviceRegistration {
    deviceId: string;
    tenantId: string;
    userId: string;
    deviceInfo: {
        fingerprint: string;
        manufacturer: string;
        model: string;
        osType: "ios" | "android" | "windows" | "macos" | "linux";
        osVersion: string;
        appVersion: string;
        buildNumber: string;
        apkSignature?: string; // For Android
        bundleId?: string; // For iOS
    };
    trustStatus: "trusted" | "untrusted" | "revoked" | "expired";
    trustScore: number; // 0-100
    registeredAt: string;
    lastVerifiedAt: string;
    expiresAt: string; // Trust expires after N days
    revokedAt?: string;
    revokedReason?: string;
}

export interface DeviceTrustValidation {
    valid: boolean;
    trusted: boolean;
    errors: string[];
    warnings: string[];
    trustScore: number;
    deviceStatus: DeviceRegistration["trustStatus"];
    recommendedAction: "allow" | "warn" | "block" | "force_re_register";
}

export class DeviceTrustManager {
    private readonly MIN_TRUST_SCORE = 60;
    private readonly TRUST_EXPIRY_DAYS = 90;
    private readonly LEGACY_BLOCK_VERSIONS: Record<string, string[]> = {
        android: ["1.0.0", "1.1.0", "1.2.0"], // Block versions before 1.3.0
        ios: ["1.0.0", "1.1.0"],
    };

    /**
     * Register new device
     */
    async registerDevice(
        tenantId: string,
        userId: string,
        deviceInfo: DeviceRegistration["deviceInfo"]
    ): Promise<DeviceRegistration> {
        // Generate device ID from fingerprint
        const deviceId = this.generateDeviceId(deviceInfo.fingerprint);

        // Check if device already registered
        const existing = await this.getDeviceRegistration(deviceId);
        if (existing && existing.trustStatus !== "revoked") {
            throw new Error("Device already registered");
        }

        // Validate device is not legacy/banned
        const validation = await this.validateDevice(deviceInfo);
        if (validation.errors.length > 0) {
            throw new Error(`Device validation failed: ${validation.errors.join(", ")}`);
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.TRUST_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        const registration: DeviceRegistration = {
            deviceId,
            tenantId,
            userId,
            deviceInfo,
            trustStatus: "trusted",
            trustScore: validation.trustScore,
            registeredAt: now.toISOString(),
            lastVerifiedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
        };

        // Save to database
        await this.saveDeviceRegistration(registration);

        // Log registration
        await auditChain.logEvent({
            action: "device.registered",
            deviceId,
            tenantId,
            userId,
            osType: deviceInfo.osType,
            appVersion: deviceInfo.appVersion,
            trustScore: validation.trustScore,
        });

        await eventBus.publish({
            type: "device.registered",
            deviceId,
            tenantId,
            userId,
            timestamp: now.toISOString(),
        } as any);

        return registration;
    }

    /**
     * Validate device trust before sync
     */
    async validateDeviceTrust(
        deviceId: string,
        currentDeviceInfo: DeviceRegistration["deviceInfo"]
    ): Promise<DeviceTrustValidation> {
        const registration = await this.getDeviceRegistration(deviceId);

        if (!registration) {
            return {
                valid: false,
                trusted: false,
                errors: ["Device not registered"],
                warnings: [],
                trustScore: 0,
                deviceStatus: "untrusted",
                recommendedAction: "force_re_register",
            };
        }

        const errors: string[] = [];
        const warnings: string[] = [];

        // Check if revoked
        if (registration.trustStatus === "revoked") {
            errors.push(`Device revoked: ${registration.revokedReason || "Unknown reason"}`);
            return {
                valid: false,
                trusted: false,
                errors,
                warnings,
                trustScore: 0,
                deviceStatus: "revoked",
                recommendedAction: "block",
            };
        }

        // Check if expired
        if (new Date() > new Date(registration.expiresAt)) {
            errors.push("Device trust expired - re-registration required");
            return {
                valid: false,
                trusted: false,
                errors,
                warnings,
                trustScore: registration.trustScore,
                deviceStatus: "expired",
                recommendedAction: "force_re_register",
            };
        }

        // Validate current device info matches registered info
        if (currentDeviceInfo.fingerprint !== registration.deviceInfo.fingerprint) {
            errors.push("Device fingerprint mismatch - possible device swap");
            return {
                valid: false,
                trusted: false,
                errors,
                warnings,
                trustScore: 0,
                deviceStatus: "untrusted",
                recommendedAction: "block",
            };
        }

        // Validate device integrity (rooted, emulator, etc.)
        const deviceValidation = await this.validateDevice(currentDeviceInfo);
        if (deviceValidation.errors.length > 0) {
            errors.push(...deviceValidation.errors);
        }
        warnings.push(...deviceValidation.warnings);

        // Check if app version is legacy (blocked)
        if (this.isLegacyVersion(currentDeviceInfo.osType, currentDeviceInfo.appVersion)) {
            errors.push(`App version ${currentDeviceInfo.appVersion} is no longer supported - update required`);
        }

        // Calculate final trust score
        const trustScore = Math.min(registration.trustScore, deviceValidation.trustScore);

        // Determine action
        let recommendedAction: DeviceTrustValidation["recommendedAction"];
        if (errors.length > 0) {
            recommendedAction = "block";
        } else if (trustScore < this.MIN_TRUST_SCORE) {
            recommendedAction = "warn";
        } else {
            recommendedAction = "allow";
        }

        return {
            valid: errors.length === 0,
            trusted: trustScore >= this.MIN_TRUST_SCORE,
            errors,
            warnings,
            trustScore,
            deviceStatus: registration.trustStatus,
            recommendedAction,
        };
    }

    /**
     * Revoke device trust
     */
    async revokeDevice(deviceId: string, reason: string, adminId: string): Promise<void> {
        const registration = await this.getDeviceRegistration(deviceId);
        if (!registration) {
            throw new Error("Device not found");
        }

        registration.trustStatus = "revoked";
        registration.revokedAt = new Date().toISOString();
        registration.revokedReason = reason;

        await this.saveDeviceRegistration(registration);

        await auditChain.logEvent({
            action: "device.revoked",
            deviceId,
            tenantId: registration.tenantId,
            userId: registration.userId,
            reason,
            adminId,
        });

        await eventBus.publish({
            type: "device.revoked",
            deviceId,
            tenantId: registration.tenantId,
            reason,
            timestamp: new Date().toISOString(),
        } as any);
    }

    /**
     * Validate device integrity (detect rooting, emulators, tampering)
     */
    private async validateDevice(
        deviceInfo: DeviceRegistration["deviceInfo"]
    ): Promise<Omit<DeviceTrustValidation, "valid" | "deviceStatus" | "recommendedAction">> {
        const errors: string[] = [];
        const warnings: string[] = [];
        let trustScore = 100;

        // Check for emulator indicators
        if (this.isEmulator(deviceInfo)) {
            errors.push("Emulator detected - real devices only");
            trustScore = 0;
        }

        // Check for rooted/jailbroken devices
        if (this.isRooted(deviceInfo)) {
            errors.push("Rooted/jailbroken device detected - compromised security");
            trustScore = Math.min(trustScore, 30);
        }

        // Check APK signature (Android)
        if (deviceInfo.osType === "android" && deviceInfo.apkSignature) {
            if (!this.isValidApkSignature(deviceInfo.apkSignature)) {
                errors.push("Invalid APK signature - possible cracked app");
                trustScore = 0;
            }
        }

        // Check bundle ID (iOS)
        if (deviceInfo.osType === "ios" && deviceInfo.bundleId) {
            if (!this.isValidBundleId(deviceInfo.bundleId)) {
                errors.push("Invalid bundle ID - unauthorized build");
                trustScore = 0;
            }
        }

        // Check OS version
        if (this.isUnsupportedOsVersion(deviceInfo.osType, deviceInfo.osVersion)) {
            warnings.push(`OS version ${deviceInfo.osVersion} may not be fully supported`);
            trustScore = Math.min(trustScore, 70);
        }

        return {
            trusted: trustScore >= this.MIN_TRUST_SCORE,
            errors,
            warnings,
            trustScore,
        };
    }

    /**
     * Check if device is an emulator
     */
    private isEmulator(deviceInfo: DeviceRegistration["deviceInfo"]): boolean {
        // Emulator indicators
        const emulatorIndicators = [
            "generic",
            "emulator",
            "simulator",
            "sdk",
            "genymotion",
            "bluestacks",
        ];

        const model = deviceInfo.model.toLowerCase();
        const manufacturer = deviceInfo.manufacturer.toLowerCase();

        return emulatorIndicators.some(
            indicator => model.includes(indicator) || manufacturer.includes(indicator)
        );
    }

    /**
     * Check if device is rooted/jailbroken
     */
    private isRooted(deviceInfo: DeviceRegistration["deviceInfo"]): boolean {
        // In production, check device-provided flags
        // For Android: check for su binary, Magisk, etc.
        // For iOS: check for Cydia, jailbreak files, etc.
        return false; // Placeholder
    }

    /**
     * Validate APK signature
     */
    private isValidApkSignature(signature: string): boolean {
        // In production, compare against known valid signatures
        const validSignatures = [
            "sha256:abc123...", // Production signature
            "sha256:def456...", // Staging signature
        ];
        return true; // Placeholder
    }

    /**
     * Validate iOS bundle ID
     */
    private isValidBundleId(bundleId: string): boolean {
        const validBundleIds = [
            "com.aibos.app",
            "com.aibos.app.staging",
        ];
        return validBundleIds.includes(bundleId);
    }

    /**
     * Check if app version is legacy (blocked)
     */
    private isLegacyVersion(osType: string, appVersion: string): boolean {
        const blockedVersions = this.LEGACY_BLOCK_VERSIONS[osType] || [];
        return blockedVersions.includes(appVersion);
    }

    /**
     * Check if OS version is unsupported
     */
    private isUnsupportedOsVersion(osType: string, osVersion: string): boolean {
        const minVersions: Record<string, string> = {
            android: "8.0", // Android 8.0 Oreo minimum
            ios: "13.0", // iOS 13 minimum
        };

        const minVersion = minVersions[osType];
        if (!minVersion) return false;

        return this.compareVersions(osVersion, minVersion) < 0;
    }

    /**
     * Compare version strings (returns -1, 0, or 1)
     */
    private compareVersions(v1: string, v2: string): number {
        const parts1 = v1.split(".").map(Number);
        const parts2 = v2.split(".").map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;

            if (part1 < part2) return -1;
            if (part1 > part2) return 1;
        }

        return 0;
    }

    /**
     * Generate device ID from fingerprint
     */
    private generateDeviceId(fingerprint: string): string {
        return crypto.createHash("sha256").update(fingerprint).digest("hex");
    }

    /**
     * Get device registration from database
     */
    private async getDeviceRegistration(deviceId: string): Promise<DeviceRegistration | null> {
        // In production, query database
        return null; // Placeholder
    }

    /**
     * Save device registration to database
     */
    private async saveDeviceRegistration(registration: DeviceRegistration): Promise<void> {
        // In production, save to database
        console.log(`[Device Trust] Saved registration for ${registration.deviceId}`);
    }
}

/**
 * Singleton instance
 */
export const deviceTrustManager = new DeviceTrustManager();

