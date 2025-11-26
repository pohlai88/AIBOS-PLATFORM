/**
 * FlowBuilder Types - Layer 3 Functional Component
 * @module FlowBuilderTypes
 * @layer 3
 * @category mapping-graphs
 */

export interface FlowNode {
  id: string;
  type: "start" | "end" | "action" | "decision" | "process";
  label: string;
  x: number;
  y: number;
  data?: Record<string, unknown>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface FlowBuilderProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodeClick?: (node: FlowNode) => void;
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
  onEdgeClick?: (edge: FlowEdge) => void;
  onAddNode?: (type: FlowNode["type"], x: number, y: number) => void;
  onConnect?: (sourceId: string, targetId: string) => void;
  readonly?: boolean;
  testId?: string;
  className?: string;
}

