export type DesignNodeType =
  | "text"
  | "frame"
  | "icon"
  | "button"
  | "component"
  | "container";

export interface DesignNode {
  id: string;
  name?: string;
  type: DesignNodeType;

  // Typography
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;

  // Spacing
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  gap?: number;

  // Geometry / Size
  width?: number;
  height?: number;
  cornerRadius?: number | { tl?: number; tr?: number; br?: number; bl?: number };

  // Visual
  surfaceRole?: string;
  effects?: string[];

  // Layout
  x?: number;
  y?: number;
  alignment?: "left" | "center" | "right";

  // Structure
  parentId?: string;
  children?: DesignNode[];
}

