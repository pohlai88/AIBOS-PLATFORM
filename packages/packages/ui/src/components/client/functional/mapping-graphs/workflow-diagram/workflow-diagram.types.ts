/**
 * WorkflowDiagram Types - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

export type WorkflowNodeType = "start" | "end" | "action" | "decision" | "subprocess";

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  data?: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowDiagramProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodeClick?: (node: WorkflowNode) => void;
  testId?: string;
  className?: string;
}

