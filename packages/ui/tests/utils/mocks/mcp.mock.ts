/**
 * MCP mocks for testing
 * 
 * Provides mock implementations of MCP providers and hooks for isolated testing
 */

import { vi } from "vitest";

/**
 * Mock MCP validation result
 */
export const mockMcpValidation = {
  isValid: true,
  violations: [],
  constitutionVersion: "1.0.0",
  validated: true,
};

/**
 * Mock MCP theme hook
 */
export const mockUseMcpTheme = vi.fn(() => ({
  overrides: null,
  tenant: undefined,
  safeMode: false,
  loading: false,
  error: null,
  retry: vi.fn(),
  recovered: false,
  governance: mockMcpValidation,
  metadata: {
    themeVersion: "1.0.0",
    contrastMode: "normal" as const,
    darkMode: false,
    appliedTokens: [],
    removedTokens: [],
    tenantOverrides: [],
    safeModeFiltered: [],
  },
  telemetry: {
    updateCount: 0,
    lastUpdateTime: 0,
    performanceMetrics: {
      diffTime: 0,
      applyTime: 0,
      validationTime: 0,
    },
  },
}));

