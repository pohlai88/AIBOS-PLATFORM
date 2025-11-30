/**
 * Permissions Registry
 *
 * Typed permission IDs with domain grouping and tags.
 * This is the Single Source of Truth for kernel permissions.
 */

export type PermissionId =
  | 'kernel.admin'
  | 'kernel.read_diagnostics'
  | 'kernel.read_audit'
  | 'kernel.read_metrics'
  | 'engine.install'
  | 'engine.uninstall'
  | 'engine.configure'
  | 'engine.execute_action'
  | 'engine.read_metadata'
  | 'engine.read_ui_schema'
  | 'data.read_financial'
  | 'data.write_financial'
  | 'data.read_sensitive'
  | 'data.write_sensitive'
  | 'tenant.manage'
  | 'policy.manage';

export interface PermissionDefinition {
  id: PermissionId;
  description: string;
  /**
   * High-level domain for grouping in UI / audit views.
   * Example: 'kernel' | 'engine' | 'data' | 'tenant' | 'policy'
   */
  domain: string;
  /**
   * Optional tags to drive policy logic or UI.
   * Example: ['financial', 'sensitive', 'read']
   */
  tags?: string[];
}

export const PERMISSIONS: Record<PermissionId, PermissionDefinition> = {
  'kernel.admin': {
    id: 'kernel.admin',
    domain: 'kernel',
    description: 'Full kernel administration capabilities',
    tags: ['admin'],
  },
  'kernel.read_diagnostics': {
    id: 'kernel.read_diagnostics',
    domain: 'kernel',
    description: 'Read diagnostic and health information',
    tags: ['read', 'observability'],
  },
  'kernel.read_audit': {
    id: 'kernel.read_audit',
    domain: 'kernel',
    description: 'Read audit events for one or more tenants',
    tags: ['read', 'audit'],
  },
  'kernel.read_metrics': {
    id: 'kernel.read_metrics',
    domain: 'kernel',
    description: 'Read metrics endpoint and performance statistics',
    tags: ['read', 'observability'],
  },
  'engine.install': {
    id: 'engine.install',
    domain: 'engine',
    description: 'Install engines for a tenant',
    tags: ['write', 'engine', 'dangerous'],
  },
  'engine.uninstall': {
    id: 'engine.uninstall',
    domain: 'engine',
    description: 'Uninstall or disable engines for a tenant',
    tags: ['write', 'engine', 'dangerous'],
  },
  'engine.configure': {
    id: 'engine.configure',
    domain: 'engine',
    description: 'Configure engine-level settings for a tenant',
    tags: ['write', 'engine'],
  },
  'engine.execute_action': {
    id: 'engine.execute_action',
    domain: 'engine',
    description: 'Execute registered actions for installed engines',
    tags: ['execute', 'engine'],
  },
  'engine.read_metadata': {
    id: 'engine.read_metadata',
    domain: 'engine',
    description: 'Read engine metadata and data contracts',
    tags: ['read', 'engine'],
  },
  'engine.read_ui_schema': {
    id: 'engine.read_ui_schema',
    domain: 'engine',
    description: 'Read UI schemas for engine-generated screens',
    tags: ['read', 'ui'],
  },
  'data.read_financial': {
    id: 'data.read_financial',
    domain: 'data',
    description: 'Read financial data (journal entries, ledgers, etc.)',
    tags: ['read', 'financial'],
  },
  'data.write_financial': {
    id: 'data.write_financial',
    domain: 'data',
    description: 'Create or modify financial data',
    tags: ['write', 'financial', 'dangerous'],
  },
  'data.read_sensitive': {
    id: 'data.read_sensitive',
    domain: 'data',
    description: 'Read sensitive or PII-classified data',
    tags: ['read', 'sensitive', 'pii'],
  },
  'data.write_sensitive': {
    id: 'data.write_sensitive',
    domain: 'data',
    description: 'Create or modify sensitive or PII-classified data',
    tags: ['write', 'sensitive', 'pii', 'dangerous'],
  },
  'tenant.manage': {
    id: 'tenant.manage',
    domain: 'tenant',
    description: 'Create, update, or deactivate tenants',
    tags: ['write', 'tenant', 'dangerous'],
  },
  'policy.manage': {
    id: 'policy.manage',
    domain: 'policy',
    description: 'Modify policy rules and role-to-permission mappings',
    tags: ['write', 'policy', 'dangerous'],
  },
};

export function getPermissionDefinition(id: PermissionId): PermissionDefinition {
  return PERMISSIONS[id];
}

/**
 * Get all permissions in a specific domain.
 */
export function getPermissionsByDomain(domain: string): PermissionDefinition[] {
  return Object.values(PERMISSIONS).filter((p) => p.domain === domain);
}

/**
 * Get all permissions with a specific tag.
 */
export function getPermissionsByTag(tag: string): PermissionDefinition[] {
  return Object.values(PERMISSIONS).filter((p) => p.tags?.includes(tag));
}
