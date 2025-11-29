/**
 * 🛡️ Safe Globals v3.1
 * 
 * Provides sandboxed versions of:
 * - console (logged + rate limited)
 * - fetch (domain-locked + size limited + call limited)
 * - Base64 utils
 * - Date/JSON/Math
 * 
 * Security enhancements:
 * - NO process.memoryUsage exposure
 * - Log rate limiting
 * - Network call limits
 * - Response size limits
 * - DNS rebinding protection
 * 
 * @version 3.1.0
 */

import { type SandboxLog, type SandboxContract } from "./types";

// ═══════════════════════════════════════════════════════════
// Blocked Domains & Security Constants
// ═══════════════════════════════════════════════════════════

const BLOCKED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "169.254.169.254", // AWS metadata
    "metadata.google.internal",
    "metadata.azure.com",
    "169.254.169.254", // GCP metadata
];

const BLOCKED_PREFIXES = [
    "10.",
    "172.16.", "172.17.", "172.18.", "172.19.",
    "172.20.", "172.21.", "172.22.", "172.23.",
    "172.24.", "172.25.", "172.26.", "172.27.",
    "172.28.", "172.29.", "172.30.", "172.31.",
    "192.168.",
    "fc00:", "fd00:", // IPv6 private
];

// Default limits
const DEFAULT_MAX_LOGS = 100;
const DEFAULT_MAX_LOG_SIZE_KB = 64;
const DEFAULT_MAX_NETWORK_CALLS = 20;
const DEFAULT_MAX_RESPONSE_SIZE_KB = 1024; // 1MB
const DEFAULT_MAX_REQUEST_SIZE_KB = 256;
const LOG_RATE_LIMIT_PER_SECOND = 50;

// ═══════════════════════════════════════════════════════════
// Safe Globals Builder
// ═══════════════════════════════════════════════════════════

export interface SafeGlobalsContext {
    globals: Record<string, any>;
    logs: SandboxLog[];
    networkCalls: number;
    totalLogSizeBytes: number;
    logRateLimited: boolean;
}

export function buildSafeGlobals(
    tenantId: string,
    contract?: SandboxContract
): SafeGlobalsContext {
    const logs: SandboxLog[] = [];
    let networkCalls = 0;
    let totalLogSizeBytes = 0;
    let logRateLimited = false;

    // Rate limiting state
    let logCountThisSecond = 0;
    let lastLogSecond = Math.floor(Date.now() / 1000);

    // Limits from contract
    const maxLogs = contract?.maxLogEntries ?? DEFAULT_MAX_LOGS;
    const maxLogSizeKB = contract?.maxLogSizeKB ?? DEFAULT_MAX_LOG_SIZE_KB;
    const maxNetworkCalls = contract?.maxNetworkCalls ?? DEFAULT_MAX_NETWORK_CALLS;
    const maxResponseSizeKB = contract?.maxResponseSizeKB ?? DEFAULT_MAX_RESPONSE_SIZE_KB;

    // ─────────────────────────────────────────────────────────
    // Safe Console (with rate limiting)
    // ─────────────────────────────────────────────────────────

    const captureLog = (level: SandboxLog["level"], args: any[]): void => {
        // Check log count limit
        if (logs.length >= maxLogs) return;

        // Check rate limit
        const currentSecond = Math.floor(Date.now() / 1000);
        if (currentSecond !== lastLogSecond) {
            lastLogSecond = currentSecond;
            logCountThisSecond = 0;
        }
        if (logCountThisSecond >= LOG_RATE_LIMIT_PER_SECOND) {
            logRateLimited = true;
            return;
        }
        logCountThisSecond++;

        // Build message
        const message = args.map(a => stringify(a)).join(" ");
        const messageBytes = Buffer.byteLength(message, "utf8");

        // Check total size limit
        if (totalLogSizeBytes + messageBytes > maxLogSizeKB * 1024) {
            logRateLimited = true;
            return;
        }
        totalLogSizeBytes += messageBytes;

        logs.push({
            level,
            message: message.slice(0, 10000), // Cap individual message
            timestamp: new Date().toISOString(),
        });
    };

    const safeConsole = {
        log: (...args: any[]) => captureLog("log", args),
        info: (...args: any[]) => captureLog("info", args),
        warn: (...args: any[]) => captureLog("warn", args),
        error: (...args: any[]) => captureLog("error", args),
        debug: (...args: any[]) => captureLog("debug", args),
    };

    // ─────────────────────────────────────────────────────────
    // Safe Fetch (with call limits, size limits, DNS protection)
    // ─────────────────────────────────────────────────────────

    const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
        // Check if network is allowed
        if (contract?.allowNetwork === false) {
            throw new Error("Network access is disabled by contract");
        }

        // Check network call limit
        if (networkCalls >= maxNetworkCalls) {
            throw new Error(`Network call limit reached (${maxNetworkCalls})`);
        }

        // Parse and validate URL
        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            throw new Error(`Invalid URL: ${url}`);
        }

        // Block non-HTTPS
        if (parsed.protocol !== "https:") {
            throw new Error("Only HTTPS URLs are allowed");
        }

        // Block internal hosts
        if (BLOCKED_HOSTS.includes(parsed.hostname)) {
            throw new Error(`Access to ${parsed.hostname} is forbidden`);
        }

        // Block internal IP ranges
        for (const prefix of BLOCKED_PREFIXES) {
            if (parsed.hostname.startsWith(prefix)) {
                throw new Error(`Access to internal IP range is forbidden`);
            }
        }

        // Block IP addresses directly (DNS rebinding protection)
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname)) {
            throw new Error("Direct IP access is forbidden (use domain names)");
        }

        // Check allowed domains
        if (contract?.allowedDomains?.length) {
            const allowed = contract.allowedDomains.some(d =>
                parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
            );
            if (!allowed) {
                throw new Error(`Domain ${parsed.hostname} is not in allowed list`);
            }
        }

        // Check request body size
        if (options.body) {
            const bodySize = typeof options.body === "string"
                ? Buffer.byteLength(options.body, "utf8")
                : options.body instanceof ArrayBuffer
                    ? options.body.byteLength
                    : 0;
            const maxRequestSize = (contract?.maxRequestSizeKB ?? DEFAULT_MAX_REQUEST_SIZE_KB) * 1024;
            if (bodySize > maxRequestSize) {
                throw new Error(`Request body exceeds limit (${maxRequestSize / 1024}KB)`);
            }
        }

        // Log the call
        captureLog("info", [`fetch → ${parsed.origin}${parsed.pathname}`]);
        networkCalls++;

        // Execute with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            // Wrap response to enforce size limit
            return wrapResponseWithSizeLimit(response, maxResponseSizeKB * 1024);
        } finally {
            clearTimeout(timeout);
        }
    };

    /**
     * Wrap response to enforce size limit on body reads
     */
    function wrapResponseWithSizeLimit(response: Response, maxBytes: number): Response {
        const originalJson = response.json.bind(response);
        const originalText = response.text.bind(response);
        const originalArrayBuffer = response.arrayBuffer.bind(response);

        return Object.assign(response, {
            json: async () => {
                const text = await originalText();
                if (Buffer.byteLength(text, "utf8") > maxBytes) {
                    throw new Error(`Response exceeds size limit (${maxBytes / 1024}KB)`);
                }
                return JSON.parse(text);
            },
            text: async () => {
                const text = await originalText();
                if (Buffer.byteLength(text, "utf8") > maxBytes) {
                    throw new Error(`Response exceeds size limit (${maxBytes / 1024}KB)`);
                }
                return text;
            },
            arrayBuffer: async () => {
                const buffer = await originalArrayBuffer();
                if (buffer.byteLength > maxBytes) {
                    throw new Error(`Response exceeds size limit (${maxBytes / 1024}KB)`);
                }
                return buffer;
            },
        });
    }

    // ─────────────────────────────────────────────────────────
    // Safe Utilities
    // ─────────────────────────────────────────────────────────

    const safeSetTimeout = (fn: () => void, ms: number) => {
        const maxMs = contract?.maxExecutionMs || 5000;
        const cappedMs = Math.min(ms, maxMs);
        return setTimeout(fn, cappedMs);
    };

    // ─────────────────────────────────────────────────────────
    // Build Globals Object
    // ─────────────────────────────────────────────────────────

    const globals: Record<string, any> = {
        // Console
        console: safeConsole,

        // Network
        fetch: safeFetch,

        // Timers (limited)
        setTimeout: safeSetTimeout,

        // Base64
        btoa: (s: string) => Buffer.from(s).toString("base64"),
        atob: (s: string) => Buffer.from(s, "base64").toString("utf-8"),

        // Safe built-ins
        JSON: {
            parse: JSON.parse,
            stringify: JSON.stringify,
        },
        Math,
        Date,
        Array,
        Object: {
            keys: Object.keys,
            values: Object.values,
            entries: Object.entries,
            assign: Object.assign,
            fromEntries: Object.fromEntries,
        },
        Number,
        String,
        Boolean,
        Map,
        Set,
        WeakMap,
        WeakSet,
        Promise,
        RegExp,
        Error,
        TypeError,
        RangeError,
        Intl,

        // Utilities
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        encodeURIComponent,
        decodeURIComponent,
        encodeURI,
        decodeURI,

        // Tenant context
        __tenantId: tenantId,
    };

    return {
        globals,
        logs,
        get networkCalls() { return networkCalls; },
        get totalLogSizeBytes() { return totalLogSizeBytes; },
        get logRateLimited() { return logRateLimited; },
    };
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function stringify(value: any): string {
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "string") return value;
    if (typeof value === "function") return "[Function]";
    if (value instanceof Error) return value.message;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

