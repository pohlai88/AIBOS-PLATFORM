// ai/guardians/schema.guardian.ts
/**
 * Schema Guardian — DB Integrity Guardian
 * 
 * Prevents AI from:
 * - Breaking DB schema
 * - Deleting required fields
 * - Creating invalid foreign keys
 * - Violating data integrity constraints
 * 
 * Validates against metadata registry
 */

import { metadataRegistry } from "../../registry/metadata.registry";
import type { GuardianDecision, GovernanceContext } from "../governance.engine";

export interface SchemaChangeProposal {
  entity: string;
  deleteField?: string;
  addField?: {
    name: string;
    type: string;
    required: boolean;
  };
  modifyField?: {
    name: string;
    from: string;
    to: string;
  };
  addForeignKey?: {
    from: { entity: string; field: string };
    to: { entity: string; field: string };
  };
  dropForeignKey?: {
    from: { entity: string; field: string };
    to: { entity: string; field: string };
  };
}

export const schemaGuardian = {
  /**
   * Inspect schema change proposal
   * 
   * @param action - Action ID
   * @param payload - Payload containing schema change proposal
   * @param context - Governance context
   * @returns Guardian decision
   */
  async inspect(
    action: string,
    payload: unknown,
    context?: GovernanceContext
  ): Promise<GuardianDecision> {
    // Only inspect schema-related actions
    if (!action.startsWith("schema.") && !(payload as any)?.schemaChange) {
      return {
        guardian: "schema",
        status: "ALLOW",
        reason: "No schema changes detected",
        timestamp: new Date(),
      };
    }

    const proposed = (payload as any)?.schemaChange as SchemaChangeProposal;

    if (!proposed) {
      return {
        guardian: "schema",
        status: "ALLOW",
        reason: "No schema change proposal found",
        timestamp: new Date(),
      };
    }

    // --- Check 1: Entity existence ---
    const entity = metadataRegistry.getModel(proposed.entity);

    if (!entity) {
      return {
        guardian: "schema",
        status: "DENY",
        reason: `Entity '${proposed.entity}' does not exist in metadata registry`,
        details: { entity: proposed.entity },
        timestamp: new Date(),
      };
    }

    // --- Check 2: Field deletion safety ---
    if (proposed.deleteField) {
      const field = entity.fields?.[proposed.deleteField];

      if (!field) {
        return {
          guardian: "schema",
          status: "WARN",
          reason: `Field '${proposed.deleteField}' does not exist on entity '${proposed.entity}'`,
          details: { field: proposed.deleteField, entity: proposed.entity },
          timestamp: new Date(),
        };
      }

      if (field.required) {
        return {
          guardian: "schema",
          status: "DENY",
          reason: `Field '${proposed.deleteField}' is required and cannot be deleted`,
          details: { field: proposed.deleteField, entity: proposed.entity },
          timestamp: new Date(),
        };
      }

      // Check for foreign key dependencies
      if (field.foreignKey) {
        return {
          guardian: "schema",
          status: "DENY",
          reason: `Field '${proposed.deleteField}' has foreign key constraint and cannot be deleted`,
          details: { field: proposed.deleteField, foreignKey: field.foreignKey },
          timestamp: new Date(),
        };
      }
    }

    // --- Check 3: Add field validation ---
    if (proposed.addField) {
      const { name, type, required } = proposed.addField;

      // Check for duplicate field
      if (entity.fields?.[name]) {
        return {
          guardian: "schema",
          status: "DENY",
          reason: `Field '${name}' already exists on entity '${proposed.entity}'`,
          details: { field: name, entity: proposed.entity },
          timestamp: new Date(),
        };
      }

      // Validate field type
      const validTypes = ["string", "number", "boolean", "date", "json", "uuid"];
      if (!validTypes.includes(type.toLowerCase())) {
        return {
          guardian: "schema",
          status: "WARN",
          reason: `Field type '${type}' is not a standard type. Consider: ${validTypes.join(", ")}`,
          details: { field: name, type },
          timestamp: new Date(),
        };
      }

      // Adding required field to existing entity is risky
      if (required) {
        return {
          guardian: "schema",
          status: "WARN",
          reason: `Adding required field '${name}' to existing entity may break existing data`,
          details: { field: name, required: true },
          timestamp: new Date(),
        };
      }
    }

    // --- Check 4: Field modification (type change) ---
    if (proposed.modifyField) {
      const { name, from, to } = proposed.modifyField;

      const field = entity.fields?.[name];
      if (!field) {
        return {
          guardian: "schema",
          status: "DENY",
          reason: `Field '${name}' does not exist on entity '${proposed.entity}'`,
          details: { field: name, entity: proposed.entity },
          timestamp: new Date(),
        };
      }

      // Type change is always risky
      if (from !== to) {
        return {
          guardian: "schema",
          status: "WARN",
          reason: `Changing field type from '${from}' to '${to}' may cause data loss`,
          details: { field: name, from, to },
          timestamp: new Date(),
        };
      }
    }

    // --- Check 5: Foreign key validation ---
    if (proposed.addForeignKey) {
      const { from, to } = proposed.addForeignKey;

      // Check source entity exists
      const sourceEntity = metadataRegistry.getModel(from.entity);
      if (!sourceEntity) {
        return {
          guardian: "schema",
          status: "DENY",
          reason: `Source entity '${from.entity}' does not exist`,
          details: { from },
          timestamp: new Date(),
        };
      }

      // Check target entity exists
      const targetEntity = metadataRegistry.getModel(to.entity);
      if (!targetEntity) {
        return {
          guardian: "schema",
          status: "DENY",
          reason: `Target entity '${to.entity}' does not exist`,
          details: { to },
          timestamp: new Date(),
        };
      }

      // Check source field exists
      if (!sourceEntity.fields?.[from.field]) {
        return {
          guardian: "schema",
          status: "DENY",
          reason: `Source field '${from.field}' does not exist on entity '${from.entity}'`,
          details: { from },
          timestamp: new Date(),
        };
      }

      // Check target field exists
      if (!targetEntity.fields?.[to.field]) {
        return {
          guardian: "schema",
          status: "DENY",
          reason: `Target field '${to.field}' does not exist on entity '${to.entity}'`,
          details: { to },
          timestamp: new Date(),
        };
      }
    }

    // --- Check 6: Multi-tenant isolation ---
    if (context?.tenantId) {
      // Ensure schema changes are scoped to tenant
      if (entity.global) {
        return {
          guardian: "schema",
          status: "DENY",
          reason: `Cannot modify global entity '${proposed.entity}' from tenant context`,
          details: { entity: proposed.entity, tenantId: context.tenantId },
          timestamp: new Date(),
        };
      }
    }

    // All checks passed
    return {
      guardian: "schema",
      status: "ALLOW",
      reason: "Schema change proposal validated successfully",
      details: proposed,
      timestamp: new Date(),
    };
  },
};

