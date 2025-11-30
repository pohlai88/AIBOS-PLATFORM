import { NextRequest, NextResponse } from "next/server";

/**
 * Designer MCP API Route
 * Validates design nodes against AI-BOS design system rules.
 *
 * POST /api/mcp/designer
 * Body: { nodes: DesignNode[], theme?: string }
 */

interface DesignNode {
  id: string;
  name?: string;
  type: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  gap?: number;
  width?: number;
  height?: number;
  cornerRadius?: number;
  surfaceRole?: string;
  effects?: string[];
  x?: number;
  y?: number;
  children?: DesignNode[];
}

interface ValidationError {
  code: string;
  message: string;
  severity: "error" | "warning" | "info";
  nodeId: string;
  nodeType: string;
  parentId?: string;
}

// Default rules (can be loaded from config files in production)
const defaultRules = {
  typography: {
    minFontSize: 12,
    allowedWeights: [400, 500, 600, 700],
    lineHeightRange: { min: 1.2, max: 1.6 },
  },
  spacing: {
    gridStep: 4,
    allowedSpacing: [4, 8, 12, 16, 20, 24, 32, 40],
  },
  layout: {
    maxFrameWidth: 1440,
    minFrameWidth: 240,
    alignmentTolerance: 2,
  },
  geometry: {
    minButtonPaddingY: 8,
    minButtonPaddingX: 12,
    allowedIconSizes: [14, 16, 20, 24, 32],
    allowedRadius: [2, 4, 6, 8, 12],
  },
  visual: {
    allowedSurfaceRoles: ["primary", "secondary", "muted", "elevated"],
    forbiddenEffects: ["innerShadow", "hardShadow"],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodes, theme = "default" } = body as {
      nodes: DesignNode[];
      theme?: string;
    };

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: "Invalid request: nodes array required" },
        { status: 400 }
      );
    }

    const errors: ValidationError[] = [];

    // Validate all nodes recursively
    function validateNode(node: DesignNode, parentId?: string) {
      // Typography validation
      if (node.type === "text") {
        if (node.fontSize && node.fontSize < defaultRules.typography.minFontSize) {
          errors.push({
            code: "TYP-001",
            message: `Font size ${node.fontSize}px < minimum ${defaultRules.typography.minFontSize}px`,
            severity: "error",
            nodeId: node.id,
            nodeType: node.type,
            parentId,
          });
        }

        if (node.fontWeight && !defaultRules.typography.allowedWeights.includes(node.fontWeight)) {
          errors.push({
            code: "TYP-002",
            message: `Font weight ${node.fontWeight} is not allowed`,
            severity: "warning",
            nodeId: node.id,
            nodeType: node.type,
            parentId,
          });
        }

        if (node.lineHeight) {
          const { min, max } = defaultRules.typography.lineHeightRange;
          if (node.lineHeight < min || node.lineHeight > max) {
            errors.push({
              code: "TYP-003",
              message: `Line height ${node.lineHeight} outside range ${min}-${max}`,
              severity: "warning",
              nodeId: node.id,
              nodeType: node.type,
              parentId,
            });
          }
        }
      }

      // Spacing validation
      if (node.padding) {
        const paddings = Object.values(node.padding).filter((v): v is number => v !== undefined);
        for (const pad of paddings) {
          if (!defaultRules.spacing.allowedSpacing.includes(pad)) {
            errors.push({
              code: "SPC-002",
              message: `Padding ${pad}px not in allowed spacing set`,
              severity: "warning",
              nodeId: node.id,
              nodeType: node.type,
              parentId,
            });
          }
        }
      }

      if (node.gap !== undefined && !defaultRules.spacing.allowedSpacing.includes(node.gap)) {
        errors.push({
          code: "SPC-001",
          message: `Gap ${node.gap}px does not follow spacing grid`,
          severity: "warning",
          nodeId: node.id,
          nodeType: node.type,
          parentId,
        });
      }

      // Layout validation
      if (node.width) {
        if (node.width > defaultRules.layout.maxFrameWidth) {
          errors.push({
            code: "LAY-003",
            message: `Frame width ${node.width}px exceeds max ${defaultRules.layout.maxFrameWidth}px`,
            severity: "warning",
            nodeId: node.id,
            nodeType: node.type,
            parentId,
          });
        }
        if (node.width < defaultRules.layout.minFrameWidth) {
          errors.push({
            code: "LAY-004",
            message: `Frame width ${node.width}px below min ${defaultRules.layout.minFrameWidth}px`,
            severity: "warning",
            nodeId: node.id,
            nodeType: node.type,
            parentId,
          });
        }
      }

      // Geometry validation
      if (node.type === "icon" && node.width && !defaultRules.geometry.allowedIconSizes.includes(node.width)) {
        errors.push({
          code: "GEO-001",
          message: `Icon size ${node.width}px not in allowed set`,
          severity: "warning",
          nodeId: node.id,
          nodeType: node.type,
          parentId,
        });
      }

      if (node.cornerRadius !== undefined && !defaultRules.geometry.allowedRadius.includes(node.cornerRadius)) {
        errors.push({
          code: "GEO-003",
          message: `Corner radius ${node.cornerRadius}px not in allowed set`,
          severity: "warning",
          nodeId: node.id,
          nodeType: node.type,
          parentId,
        });
      }

      // Visual validation
      if (node.surfaceRole && !defaultRules.visual.allowedSurfaceRoles.includes(node.surfaceRole)) {
        errors.push({
          code: "VIS-001",
          message: `Surface role '${node.surfaceRole}' is not allowed`,
          severity: "warning",
          nodeId: node.id,
          nodeType: node.type,
          parentId,
        });
      }

      if (node.effects) {
        for (const effect of node.effects) {
          if (defaultRules.visual.forbiddenEffects.includes(effect)) {
            errors.push({
              code: "VIS-002",
              message: `Effect '${effect}' is forbidden`,
              severity: "error",
              nodeId: node.id,
              nodeType: node.type,
              parentId,
            });
          }
        }
      }

      // Validate children
      if (node.children) {
        for (const child of node.children) {
          validateNode(child, node.id);
        }
      }
    }

    // Run validation
    for (const node of nodes) {
      validateNode(node);
    }

    // Calculate summary
    const errorCount = errors.filter((e) => e.severity === "error").length;
    const warningCount = errors.filter((e) => e.severity === "warning").length;
    const infoCount = errors.filter((e) => e.severity === "info").length;

    return NextResponse.json({
      theme,
      nodeCount: nodes.length,
      valid: errorCount === 0,
      errorCount,
      warningCount,
      infoCount,
      errors,
    });
  } catch (error) {
    console.error("[Designer MCP API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

