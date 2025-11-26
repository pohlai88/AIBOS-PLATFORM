/**
 * Tenant Theme Detection
 * Multi-tenant theme resolution for design validation.
 */

// Known tenant themes
const KNOWN_TENANTS = new Set(["default", "dlbb", "client-template"]);

/**
 * Detect tenant theme from various sources.
 */
export function detectTenantTheme(explicitTheme?: string): string {
  // 1. Explicit theme takes priority
  if (explicitTheme && KNOWN_TENANTS.has(explicitTheme)) {
    return explicitTheme;
  }

  // 2. Environment variable
  const envTheme = process.env.AIBOS_TENANT_THEME;
  if (envTheme && KNOWN_TENANTS.has(envTheme)) {
    return envTheme;
  }

  // 3. Check for tenant-specific config files
  // (In production, this would check for config files)

  // 4. Default fallback
  return "default";
}

/**
 * Get tenant-specific overrides.
 */
export function getTenantOverrides(tenant: string): TenantOverrides {
  switch (tenant) {
    case "dlbb":
      return {
        primaryColor: "emerald",
        allowedRadius: [4, 6, 8, 12],
        allowedSpacing: [4, 8, 12, 16, 24, 32, 48],
        brandTokens: ["emerald", "dlbb-green", "dlbb-accent"],
        strictMode: true,
      };
    case "client-template":
      return {
        primaryColor: "violet",
        allowedRadius: [2, 4, 6, 8, 12],
        allowedSpacing: [4, 8, 12, 16, 20, 24, 32, 40],
        brandTokens: [],
        strictMode: false,
      };
    default:
      return {
        primaryColor: "blue",
        allowedRadius: [2, 4, 6, 8, 12],
        allowedSpacing: [4, 8, 12, 16, 20, 24, 32, 40],
        brandTokens: [],
        strictMode: false,
      };
  }
}

/**
 * Check if a token is allowed for a tenant.
 */
export function isTokenAllowedForTenant(token: string, tenant: string): boolean {
  const overrides = getTenantOverrides(tenant);

  // Brand-specific tokens
  if (overrides.brandTokens.length > 0) {
    const isBrandToken = overrides.brandTokens.some((t) => token.includes(t));
    if (isBrandToken) return true;
  }

  // In strict mode, only allow defined tokens
  if (overrides.strictMode) {
    // Check against tenant's allowed values
    // This would be expanded with full token validation
    return true;
  }

  return true;
}

/**
 * Get list of all available tenants.
 */
export function getAvailableTenants(): string[] {
  return Array.from(KNOWN_TENANTS);
}

export interface TenantOverrides {
  primaryColor: string;
  allowedRadius: number[];
  allowedSpacing: number[];
  brandTokens: string[];
  strictMode: boolean;
}

