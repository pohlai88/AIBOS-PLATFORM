/**
 * OrgChart Types - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

export interface OrgNode {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  children?: OrgNode[];
}

export interface OrgChartProps {
  data: OrgNode;
  onNodeClick?: (node: OrgNode) => void;
  horizontal?: boolean;
  testId?: string;
  className?: string;
}

