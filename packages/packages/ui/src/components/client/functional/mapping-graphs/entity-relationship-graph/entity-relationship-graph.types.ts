/**
 * EntityRelationshipGraph Types - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

export interface ERDEntity {
  id: string;
  name: string;
  attributes: { name: string; type: string; isPrimaryKey?: boolean; isForeignKey?: boolean }[];
  position: { x: number; y: number };
}

export interface ERDRelationship {
  id: string;
  source: string;
  target: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
  label?: string;
}

export interface EntityRelationshipGraphProps {
  entities: ERDEntity[];
  relationships: ERDRelationship[];
  onEntityClick?: (entity: ERDEntity) => void;
  onRelationshipClick?: (relationship: ERDRelationship) => void;
  testId?: string;
  className?: string;
}

