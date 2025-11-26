/**
 * Mindmap Types - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

export interface MindmapNode {
  id: string;
  label: string;
  children?: MindmapNode[];
  color?: string;
}

export interface MindmapProps {
  data: MindmapNode;
  onNodeClick?: (node: MindmapNode) => void;
  testId?: string;
  className?: string;
}

