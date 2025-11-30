/**
 * NetworkGraph Types - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

export interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight?: number;
}

export interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number | string;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  testId?: string;
  className?: string;
}

