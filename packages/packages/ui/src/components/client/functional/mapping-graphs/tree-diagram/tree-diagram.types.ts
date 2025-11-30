/**
 * TreeDiagram Types - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  expanded?: boolean;
}

export interface TreeDiagramProps {
  data: TreeNode[];
  onNodeClick?: (node: TreeNode) => void;
  onNodeToggle?: (nodeId: string, expanded: boolean) => void;
  defaultExpandAll?: boolean;
  selectable?: boolean;
  selectedId?: string;
  testId?: string;
  className?: string;
}

