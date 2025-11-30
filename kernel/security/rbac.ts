/**
 * Role-Based Access Control (RBAC)
 *
 * Implements role definitions, permission aggregation, and access checks.
 */

import type { PermissionId } from './permissions';
import { getPermissionDefinition } from './permissions';
import type { Principal } from '../auth/types';

// ─────────────────────────────────────────────────────────────
// Role Definitions
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Permission Aggregation
// ─────────────────────────────────────────────────────────────

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
 * Get role definition by ID.
 */
export function getRoleDefinition(id: RoleId): RoleDefinition | undefined {
  return ROLES[id];
}

// ─────────────────────────────────────────────────────────────
// Permission Checks
// ─────────────────────────────────────────────────────────────

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
 * Check if principal has ALL of the given permissions.
 */
export function hasAllPermissions(
  principal: Principal,
  permissions: PermissionId[],
): boolean {
  return permissions.every((p) => hasPermission(principal, p));
}

/**
 * Check if principal has ANY of the given permissions.
 */
export function hasAnyPermission(
  principal: Principal,
  permissions: PermissionId[],
): boolean {
  return permissions.some((p) => hasPermission(principal, p));
}

// ─────────────────────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────────────────────

/**
 * Thrown when a required permission is missing.
 */
export class PermissionDeniedError extends Error {
  readonly permission: PermissionId;

  constructor(permission: PermissionId, message?: string) {
    super(message ?? `Missing required permission: ${permission}`);
    this.name = 'PermissionDeniedError';
    this.permission = permission;
  }
}

/**
 * Assert that principal has the given permission, throw if not.
 */
export function assertPermission(
  principal: Principal,
  permission: PermissionId,
): void {
  if (!hasPermission(principal, permission)) {
    throw new PermissionDeniedError(permission);
  }
}

/**
 * Assert that principal has all given permissions, throw if any missing.
 */
export function assertAllPermissions(
  principal: Principal,
  permissions: PermissionId[],
): void {
  for (const perm of permissions) {
    if (!hasPermission(principal, perm)) {
      throw new PermissionDeniedError(perm);
    }
  }
}
