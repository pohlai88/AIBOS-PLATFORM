/**
 * Metadata Types
 * 
 * Type definitions for metadata system.
 */

export interface MetadataDefinition {
  id: string;
  name: string;
  description?: string;
  schema: MetadataSchema;
  tenantId?: string;
}

export interface MetadataSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, MetadataProperty>;
  items?: MetadataProperty;
  required?: string[];
}

export interface MetadataProperty {
  type: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  format?: string;
}

export interface MetadataValue {
  definitionId: string;
  entityId: string;
  entityType: string;
  value: unknown;
  tenantId: string;
}

