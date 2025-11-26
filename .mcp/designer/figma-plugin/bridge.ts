/**
 * Figma → MCP Node Converter
 * Exports Figma nodes to Designer MCP format for validation.
 */

export interface MCPDesignNode {
  id: string;
  name: string;
  type: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  parentId?: string;
  // Typography
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  // Spacing
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  gap?: number;
  // Geometry
  cornerRadius?: number;
  // Visual
  surfaceRole?: string;
  effects?: string[];
  // Children
  children?: MCPDesignNode[];
}

export function exportNodesToMCP(
  nodes: readonly SceneNode[]
): MCPDesignNode[] {
  return nodes.map(convert);
}

function convert(node: SceneNode): MCPDesignNode {
  const result: MCPDesignNode = {
    id: node.id,
    name: node.name,
    type: detectNodeType(node),
    x: node.x,
    y: node.y,
    parentId: node.parent?.id,
  };

  // Dimensions
  if ("width" in node) {
    result.width = node.width;
  }
  if ("height" in node) {
    result.height = node.height;
  }

  // Typography (TextNode)
  if (node.type === "TEXT") {
    const textNode = node as TextNode;

    // fontSize can be mixed, get first segment or symbol
    if (typeof textNode.fontSize === "number") {
      result.fontSize = textNode.fontSize;
    }

    // fontWeight from fontName
    if (
      typeof textNode.fontName !== "symbol" &&
      textNode.fontName?.style
    ) {
      result.fontWeight = getFontWeight(textNode.fontName.style);
    }

    // lineHeight
    if (
      typeof textNode.lineHeight !== "symbol" &&
      textNode.lineHeight?.unit === "PIXELS"
    ) {
      result.lineHeight =
        textNode.lineHeight.value / (result.fontSize || 16);
    }
  }

  // Padding + AutoLayout (FrameNode, ComponentNode)
  if ("paddingTop" in node) {
    const frameNode = node as FrameNode;
    result.padding = {
      top: frameNode.paddingTop,
      right: frameNode.paddingRight,
      bottom: frameNode.paddingBottom,
      left: frameNode.paddingLeft,
    };
  }

  if ("itemSpacing" in node) {
    result.gap = (node as FrameNode).itemSpacing;
  }

  // Corner radius
  if ("cornerRadius" in node) {
    const radius = (node as FrameNode).cornerRadius;
    if (typeof radius === "number") {
      result.cornerRadius = radius;
    }
  }

  // Surface role from plugin data
  if ("getPluginData" in node) {
    const surfaceRole = node.getPluginData("surfaceRole");
    if (surfaceRole) {
      result.surfaceRole = surfaceRole;
    }
  }

  // Effects
  if ("effects" in node && Array.isArray(node.effects)) {
    result.effects = node.effects.map((e) => e.type);
  }

  // Children (recursive)
  if ("children" in node && Array.isArray(node.children)) {
    result.children = node.children.map(convert);
  }

  return result;
}

function detectNodeType(node: SceneNode): string {
  switch (node.type) {
    case "TEXT":
      return "text";
    case "FRAME":
    case "COMPONENT":
      return "frame";
    case "COMPONENT_SET":
    case "INSTANCE":
      return "component";
    case "GROUP":
      return "container";
    case "VECTOR":
    case "STAR":
    case "LINE":
    case "ELLIPSE":
    case "POLYGON":
      return "icon";
    default:
      return "unknown";
  }
}

function getFontWeight(style: string): number {
  const styleMap: Record<string, number> = {
    Thin: 100,
    "Extra Light": 200,
    ExtraLight: 200,
    Light: 300,
    Regular: 400,
    Medium: 500,
    "Semi Bold": 600,
    SemiBold: 600,
    Bold: 700,
    "Extra Bold": 800,
    ExtraBold: 800,
    Black: 900,
  };

  // Try exact match
  if (styleMap[style]) return styleMap[style];

  // Try partial match
  for (const [key, value] of Object.entries(styleMap)) {
    if (style.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return 400; // Default to regular
}

