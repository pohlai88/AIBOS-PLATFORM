/**
 * Default Policy
 *
 * Implements the default action-to-permission mapping for the kernel.
 * For more advanced setups, this can be moved to DB-backed configuration.
 */

import type { Principal } from '../../auth/types';
import type { PermissionId } from '../permissions';
import { hasPermission } from '../rbac';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Action Prefix Policy Table
// ─────────────────────────────────────────────────────────────

/**
 * Default policy mapping for action prefixes.
 * Extend this table as new domains/verbs are added.
 */
const ACTION_PREFIX_POLICY: {
  prefix: string;
  accessType: 'read' | 'write' | 'admin';
  requiredPermissions: PermissionId[];
}[] = [
  // Kernel actions
  {
    prefix: 'kernel.',
    accessType: 'admin',
    requiredPermissions: ['kernel.admin'],
  },
  // Accounting read actions
  {
    prefix: 'accounting.read.',
    accessType: 'read',
    requiredPermissions: ['data.read_financial'],
  },
  {
    prefix: 'accounting.get.',
    accessType: 'read',
    requiredPermissions: ['data.read_financial'],
  },
  {
    prefix: 'accounting.list.',
    accessType: 'read',
    requiredPermissions: ['data.read_financial'],
  },
  // Accounting write actions
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
  // Accounting domain-specific verbs
  {
    prefix: 'accounting.post.',
    accessType: 'write',
    requiredPermissions: ['data.write_financial'],
  },
  {
    prefix: 'accounting.approve.',
    accessType: 'write',
    requiredPermissions: ['data.write_financial'],
  },
  {
    prefix: 'accounting.void.',
    accessType: 'write',
    requiredPermissions: ['data.write_financial'],
  },
  {
    prefix: 'accounting.reconcile.',
    accessType: 'write',
    requiredPermissions: ['data.write_financial'],
  },
  {
    prefix: 'accounting.close.',
    accessType: 'write',
    requiredPermissions: ['data.write_financial'],
  },
  // Engine management
  {
    prefix: 'engine.install',
    accessType: 'admin',
    requiredPermissions: ['engine.install'],
  },
  {
    prefix: 'engine.uninstall',
    accessType: 'admin',
    requiredPermissions: ['engine.uninstall'],
  },
  {
    prefix: 'engine.configure',
    accessType: 'admin',
    requiredPermissions: ['engine.configure'],
  },
  // Tenant management
  {
    prefix: 'tenant.',
    accessType: 'admin',
    requiredPermissions: ['tenant.manage'],
  },
  // Policy management
  {
    prefix: 'policy.',
    accessType: 'admin',
    requiredPermissions: ['policy.manage'],
  },
];

// ─────────────────────────────────────────────────────────────
// Policy Resolution
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Policy Evaluation
// ─────────────────────────────────────────────────────────────

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

/**
 * Convenience function to check if an action is allowed.
 */
export function isActionAllowed(ctx: PolicyContext): boolean {
  return evaluateDefaultPolicy(ctx).outcome === 'allow';
}
