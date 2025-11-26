// AI-BOS Kernel – Security & Policy v2 Implementation
// This document contains reference implementations for:
// 1) security/permissions.ts
// 2) security/rbac.ts
// 3) security/policies/default.policy.ts
//
// Copy each section into its respective file in the `kernel/security` directory.

// ────────────────────────────────────────────────────────────────────────────────
// 1) security/permissions.ts
// ────────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────────
// 2) security/rbac.ts
// ────────────────────────────────────────────────────────────────────────────────

import type { PermissionId } from './permissions';
import { getPermissionDefinition } from './permissions';
import type { Principal } from '../auth/types';

export type RoleId =
  | 'kernel.super_admin'
  | 'kernel.readonly_observer'
  | 'tenant.owner'
  | 'tenant.admin'
  | 'tenant.accountant'
  | 'tenant.auditor'
  | 'tenant.viewer';

export interface RoleDefinition {
  id: RoleId;
  description: string;
  /** Permissions granted by this role */
  permissions: PermissionId[];
}

export const ROLES: Record<RoleId, RoleDefinition> = {
  'kernel.super_admin': {
    id: 'kernel.super_admin',
    description: 'Kernel-level super admin with full permissions',
    permissions: [
      'kernel.admin',
      'kernel.read_diagnostics',
      'kernel.read_audit',
      'kernel.read_metrics',
      'engine.install',
      'engine.uninstall',
      'engine.configure',
      'engine.execute_action',
      'engine.read_metadata',
      'engine.read_ui_schema',
      'data.read_financial',
      'data.write_financial',
      'data.read_sensitive',
      'data.write_sensitive',
      'tenant.manage',
      'policy.manage',
    ],
  },
  'kernel.readonly_observer': {
    id: 'kernel.readonly_observer',
    description: 'Kernel-level observer with read-only access',
    permissions: [
      'kernel.read_diagnostics',
      'kernel.read_audit',
      'kernel.read_metrics',
      'engine.read_metadata',
      'engine.read_ui_schema',
      'data.read_financial',
    ],
  },
  'tenant.owner': {
    id: 'tenant.owner',
    description: 'Tenant owner with full control within the tenant',
    permissions: [
      'engine.install',
      'engine.uninstall',
      'engine.configure',
      'engine.execute_action',
      'engine.read_metadata',
      'engine.read_ui_schema',
      'data.read_financial',
      'data.write_financial',
      'data.read_sensitive',
      'data.write_sensitive',
      'tenant.manage',
    ],
  },
  'tenant.admin': {
    id: 'tenant.admin',
    description: 'Tenant admin with operational control',
    permissions: [
      'engine.configure',
      'engine.execute_action',
      'engine.read_metadata',
      'engine.read_ui_schema',
      'data.read_financial',
      'data.write_financial',
      'data.read_sensitive',
    ],
  },
  'tenant.accountant': {
    id: 'tenant.accountant',
    description: 'Tenant financial user (accountant/controller)',
    permissions: [
      'engine.execute_action',
      'engine.read_metadata',
      'engine.read_ui_schema',
      'data.read_financial',
      'data.write_financial',
    ],
  },
  'tenant.auditor': {
    id: 'tenant.auditor',
    description: 'Read-only financial and audit access',
    permissions: [
      'engine.read_metadata',
      'engine.read_ui_schema',
      'data.read_financial',
      'kernel.read_audit',
    ],
  },
  'tenant.viewer': {
    id: 'tenant.viewer',
    description: 'Read-only viewer within a tenant',
    permissions: [
      'engine.read_metadata',
      'engine.read_ui_schema',
      'data.read_financial',
    ],
  },
};

/**
 * Build a set of permissions from a list of role ids.
 */
export function getPermissionsForRoles(roleIds: string[]): Set<PermissionId> {
  const set = new Set<PermissionId>();

  for (const id of roleIds) {
    const role = ROLES[id as RoleId];
    if (!role) continue;
    for (const perm of role.permissions) {
      set.add(perm);
    }
  }

  return set;
}

/**
 * Simple permission check: does the principal have the given permission
 * either directly via scopes or via roles.
 */
export function hasPermission(
  principal: Principal,
  permission: PermissionId,
): boolean {
  // 1) Kernel superuser shortcut
  if (principal.authMethod === 'internal' && principal.id === 'kernel') {
    return true;
  }

  // 2) From roles → permissions
  const rolePerms = getPermissionsForRoles(principal.roles);
  if (rolePerms.has(permission)) return true;

  // 3) From scopes → permissions (scopes may be of form "perm:engine.execute_action")
  for (const scope of principal.scopes) {
    if (scope === `perm:${permission}`) return true;
    // optionally allow wildcard scopes
    if (scope === 'perm:*') return true;

    // allow domain wildcards like perm:data.*
    const def = getPermissionDefinition(permission);
    if (scope === `perm:${def.domain}.*`) return true;
  }

  return false;
}

/**
 * Throws an error if permission is not present. Intended for use in
 * critical kernel paths.
 */
export class PermissionDeniedError extends Error {
  readonly permission: PermissionId;

  constructor(permission: PermissionId, message?: string) {
    super(message ?? `Missing required permission: ${permission}`);
    this.name = 'PermissionDeniedError';
    this.permission = permission;
  }
}

export function assertPermission(
  principal: Principal,
  permission: PermissionId,
): void {
  if (!hasPermission(principal, permission)) {
    throw new PermissionDeniedError(permission);
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// 3) security/policies/default.policy.ts
// ────────────────────────────────────────────────────────────────────────────────

import type { Principal } from '../auth/types';
import type { PermissionId } from './permissions';
import { hasPermission } from './rbac';

export type PolicyDecisionOutcome = 'allow' | 'deny';

export interface PolicyDecision {
  outcome: PolicyDecisionOutcome;
  reason: string;
  /** Permissions that were required for this decision */
  requiredPermissions: PermissionId[];
}

export interface PolicyContext {
  principal: Principal;
  tenantId: string | null;
  actionId: string;
  /**
   * Data contract reference, if the action is tied to a specific data contract.
   * Example: 'dlbb.finance.journal_entries'
   */
  dataContractRef?: string;
  /**
   * Access type: read/write/admin – used as a hint for policy choice.
   */
  accessType?: 'read' | 'write' | 'admin';
}

/**
 * Default policy mapping for action prefixes.
 * For more advanced setups, this can be moved to DB-backed configuration.
 */
const ACTION_PREFIX_POLICY: {
  prefix: string;
  accessType: 'read' | 'write' | 'admin';
  requiredPermissions: PermissionId[];
}[] = [
  {
    prefix: 'kernel.',
    accessType: 'admin',
    requiredPermissions: ['kernel.admin'],
  },
  {
    prefix: 'accounting.read.',
    accessType: 'read',
    requiredPermissions: ['data.read_financial'],
  },
  {
    prefix: 'accounting.create.',
    accessType: 'write',
    requiredPermissions: ['data.write_financial'],
  },
  {
    prefix: 'accounting.update.',
    accessType: 'write',
    requiredPermissions: ['data.write_financial'],
  },
  {
    prefix: 'accounting.delete.',
    accessType: 'write',
    requiredPermissions: ['data.write_financial'],
  },
];

function resolveRequiredPermissions(
  ctx: PolicyContext,
): {
  accessType: 'read' | 'write' | 'admin';
  requiredPermissions: PermissionId[];
} {
  // Explicit accessType wins
  if (ctx.accessType) {
    if (ctx.accessType === 'read') {
      return {
        accessType: 'read',
        requiredPermissions: ['data.read_financial'],
      };
    }
    if (ctx.accessType === 'write') {
      return {
        accessType: 'write',
        requiredPermissions: ['data.write_financial'],
      };
    }
    if (ctx.accessType === 'admin') {
      return {
        accessType: 'admin',
        requiredPermissions: ['kernel.admin'],
      };
    }
  }

  // Otherwise, infer from action prefix
  const match = ACTION_PREFIX_POLICY.find((p) =>
    ctx.actionId.startsWith(p.prefix),
  );

  if (match) {
    return {
      accessType: match.accessType,
      requiredPermissions: match.requiredPermissions,
    };
  }

  // Fallback: require engine.execute_action for unknown actions
  return {
    accessType: 'write',
    requiredPermissions: ['engine.execute_action'],
  };
}

/**
 * Default policy evaluation: checks required permissions for the principal,
 * based on action id and optional access type / data contract.
 */
export function evaluateDefaultPolicy(ctx: PolicyContext): PolicyDecision {
  const { principal } = ctx;
  const { requiredPermissions, accessType } = resolveRequiredPermissions(ctx);

  const missing = requiredPermissions.filter(
    (perm) => !hasPermission(principal, perm),
  );

  if (missing.length === 0) {
    return {
      outcome: 'allow',
      reason: `allow_${accessType}_action`,
      requiredPermissions,
    };
  }

  return {
    outcome: 'deny',
    reason: `missing_permissions:${missing.join(',')}`,
    requiredPermissions,
  };
}
