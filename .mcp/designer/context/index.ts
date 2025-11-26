/**
 * Context Engine
 * RSC-aware, layer-aware, tenant-aware design intelligence.
 */

import type { DesignNode } from "../types/DesignNode.js";
import { enrichNodes, type EnrichedDesignNode, type DesignContext } from "./enrichNode.js";
import { detectRSC, detectRSCFromSource } from "./detectRSC.js";

export interface BuildContextOptions {
  componentName?: string;
  tenant?: string;
  filePath?: string;
}

/**
 * Build context-aware design nodes from source code.
 */
export function buildContextAwareNodes(
  source: string,
  nodes: DesignNode[],
  options: BuildContextOptions = {}
): EnrichedDesignNode[] {
  const { componentName = "Unknown", tenant, filePath } = options;

  // Detect RSC boundary from source
  const rscBoundary = detectRSCFromSource(source);

  // Enrich all nodes with context
  return enrichNodes(nodes, {
    source,
    componentName,
    rscBoundary,
    tenant,
    filePath,
  });
}

/**
 * Build context-aware nodes with AST (more accurate RSC detection).
 */
export function buildContextAwareNodesWithAST(
  ast: any,
  nodes: DesignNode[],
  options: BuildContextOptions = {}
): EnrichedDesignNode[] {
  const { componentName = "Unknown", tenant, filePath } = options;

  // Detect RSC boundary from AST
  const rscBoundary = detectRSC(ast);

  // Enrich all nodes with context
  return enrichNodes(nodes, {
    componentName,
    rscBoundary,
    tenant,
    filePath,
  });
}

// Re-export all context utilities
export { detectRSC, detectRSCFromSource, getRSCRules, type RSCBoundary } from "./detectRSC.js";
export {
  detectComponentLayer,
  getLayerRules,
  canUseLayer,
  type ComponentLayer,
} from "./detectComponentLayer.js";
export {
  detectDesignMode,
  detectDesignModeFromProps,
  getModeRules,
  type DesignMode,
  type DesignModeRules,
} from "./detectDesignMode.js";
export {
  detectTenantTheme,
  getTenantOverrides,
  isTokenAllowedForTenant,
  getAvailableTenants,
  type TenantOverrides,
} from "./detectTenantTheme.js";
export {
  enrichNode,
  enrichNodes,
  isOverrideAllowed,
  getValidationStrictness,
  type DesignContext,
  type EnrichedDesignNode,
} from "./enrichNode.js";

