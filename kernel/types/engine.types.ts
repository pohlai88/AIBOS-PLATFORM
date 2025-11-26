/**
 * Engine Types
 * 
 * Type definitions for business engines.
 */

export interface Engine {
  id: string;
  name: string;
  version: string;
  description?: string;
  manifest: EngineManifest;
  status: 'active' | 'inactive' | 'error';
}

export interface EngineManifest {
  name: string;
  version: string;
  description?: string;
  actions: ActionDefinition[];
  metadata?: MetadataReference[];
  dependencies?: string[];
}

export interface ActionDefinition {
  id: string;
  name: string;
  description?: string;
  input: SchemaDefinition;
  output: SchemaDefinition;
}

export interface MetadataReference {
  id: string;
  required: boolean;
}

export interface SchemaDefinition {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
}

