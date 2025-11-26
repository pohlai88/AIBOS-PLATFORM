import type { DesignNode } from "../types/DesignNode.js";
import { detectComponentLayer, type ComponentLayer } from "./detectComponentLayer.js";
import { detectDesignMode, type DesignMode } from "./detectDesignMode.js";
import { detectTenantTheme } from "./detectTenantTheme.js";
import type { RSCBoundary } from "./detectRSC.js";

/**
 * Design context metadata attached to each node.
 */
export interface DesignContext {
  rscBoundary: RSCBoundary;
  componentLayer: ComponentLayer;
  designMode: DesignMode;
  tenant: string;
  allowedOverrides: string[];
  filePath?: string;
  componentName?: string;
}

/**
 * Design node enriched with context information.
 */
export interface EnrichedDesignNode extends DesignNode {
  context: DesignContext;
}

/**
 * Enrich a design node with context information.
 */
export function enrichNode(
  node: DesignNode,
  options: {
    source?: string;
    componentName?: string;
    rscBoundary?: RSCBoundary;
    tenant?: string;
    filePath?: string;
  } = {}
): EnrichedDesignNode {
  const {
    componentName = node.name || "Unknown",
    rscBoundary = "server",
    tenant,
    filePath,
  } = options;

  const componentLayer = detectComponentLayer(componentName);
  const designMode = detectDesignMode();
  const resolvedTenant = detectTenantTheme(tenant);

  return {
    ...node,
    context: {
      rscBoundary,
      componentLayer,
      designMode,
      tenant: resolvedTenant,
      allowedOverrides: getAllowedOverrides(componentLayer, rscBoundary),
      filePath,
      componentName,
    },
  };
}

/**
 * Enrich multiple nodes with shared context.
 */
export function enrichNodes(
  nodes: DesignNode[],
  options: {
    source?: string;
    componentName?: string;
    rscBoundary?: RSCBoundary;
    tenant?: string;
    filePath?: string;
  } = {}
): EnrichedDesignNode[] {
  return nodes.map((node) => enrichNode(node, options));
}

/**
 * Get allowed overrides based on layer and RSC boundary.
 */
function getAllowedOverrides(layer: ComponentLayer, rscBoundary: RSCBoundary): string[] {
  const overrides: string[] = [];

  // L1 primitives have minimal overrides
  if (layer === "L1") {
    overrides.push("size", "variant", "colorScheme");
  }

  // L2 composed components can override layout
  if (layer === "L2") {
    overrides.push("size", "variant", "colorScheme", "spacing", "layout");
  }

  // L3 widgets can override almost everything
  if (layer === "L3") {
    overrides.push("size", "variant", "colorScheme", "spacing", "layout", "theme");
  }

  // Client components can use dynamic styles
  if (rscBoundary === "client") {
    overrides.push("animation", "transition", "hover", "focus");
  }

  return overrides;
}

/**
 * Check if an override is allowed for a node.
 */
export function isOverrideAllowed(node: EnrichedDesignNode, override: string): boolean {
  return node.context.allowedOverrides.includes(override);
}

/**
 * Get validation strictness level based on context.
 */
export function getValidationStrictness(context: DesignContext): "strict" | "normal" | "relaxed" {
  // L1 primitives are always strict
  if (context.componentLayer === "L1") return "strict";

  // AAA mode is always strict
  if (context.designMode === "aaa") return "strict";

  // Safe mode is normal strictness
  if (context.designMode === "safe") return "normal";

  // L3 widgets are more relaxed
  if (context.componentLayer === "L3") return "relaxed";

  return "normal";
}

