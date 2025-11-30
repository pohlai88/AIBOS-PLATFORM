/**
 * UI Types
 * 
 * Type definitions for UI components.
 */

export interface UIComponent {
  id: string;
  name: string;
  type: 'primitive' | 'composition' | 'functional' | 'layout';
  category: string;
  props: UIComponentProps;
  variants?: UIVariant[];
}

export interface UIComponentProps {
  [key: string]: UIPropDefinition;
}

export interface UIPropDefinition {
  type: string;
  required?: boolean;
  default?: unknown;
  description?: string;
}

export interface UIVariant {
  name: string;
  props: Record<string, unknown>;
}

export interface UILayout {
  id: string;
  name: string;
  regions: UIRegion[];
}

export interface UIRegion {
  id: string;
  name: string;
  components: string[];
}

