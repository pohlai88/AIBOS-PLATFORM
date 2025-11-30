// metadata/adaptive-migration.engine.ts
import { z } from "zod";
import { appendAuditEntry } from "../audit/hash-chain.store";
import { kernelContainer } from "../core/container";

export interface MigrationPlan {
  strategy: "direct" | "dual-write";
  downtime: number; // seconds
  steps: Array<{
    phase: number;
    action: string;
    sql?: string;
    duration: string;
    rollbackSupported: boolean;
  }>;
  breakingChanges: string[];
}

export class AdaptiveMigrationEngine {
  /**
   * Analyze schema change and generate migration plan
   */
  async analyze(
    entityName: string,
    oldSchema: z.ZodTypeAny,
    newSchema: z.ZodTypeAny
  ): Promise<MigrationPlan> {
    const breaks = this.detectBreakingChanges(oldSchema, newSchema);

    if (breaks.length === 0) {
      return {
        strategy: "direct",
        downtime: 0,
        breakingChanges: [],
        steps: [
          {
            phase: 1,
            action: "Apply non-breaking schema changes",
            duration: "instant",
            rollbackSupported: true,
          },
        ],
      };
    }

    // Breaking changes: use dual-write strategy
    return {
      strategy: "dual-write",
      downtime: 0,
      breakingChanges: breaks.map((b) => b.details),
      steps: [
        {
          phase: 1,
          action: "Add new fields as nullable",
          sql: this.generateAddColumnsSQL(entityName, breaks),
          duration: "instant",
          rollbackSupported: true,
        },
        {
          phase: 2,
          action: "Enable dual-write mode (write to old + new fields)",
          duration: "7 days (grace period)",
          rollbackSupported: true,
        },
        {
          phase: 3,
          action: "Backfill old data to new fields (background job)",
          duration: "background (depends on data volume)",
          rollbackSupported: false,
        },
        {
          phase: 4,
          action: "Switch reads to new fields",
          duration: "instant",
          rollbackSupported: true,
        },
        {
          phase: 5,
          action: "Drop old fields (after 30-day safety window)",
          sql: this.generateDropColumnsSQL(entityName, breaks),
          duration: "instant",
          rollbackSupported: false,
        },
      ],
    };
  }

  /**
   * Detect breaking changes between schemas
   */
  private detectBreakingChanges(
    oldSchema: any,
    newSchema: any
  ): Array<{ type: string; field: string; details: string }> {
    const breaking: Array<{ type: string; field: string; details: string }> =
      [];

    const oldShape = oldSchema.shape || {};
    const newShape = newSchema.shape || {};

    // Check for removed fields
    for (const field of Object.keys(oldShape)) {
      if (!newShape[field]) {
        breaking.push({
          type: "field_removed",
          field,
          details: `Field '${field}' removed from schema`,
        });
      }
    }

    // Check for type changes
    for (const field of Object.keys(newShape)) {
      if (oldShape[field]) {
        const oldType = oldShape[field]._def?.typeName;
        const newType = newShape[field]._def?.typeName;

        if (oldType && newType && oldType !== newType) {
          breaking.push({
            type: "type_changed",
            field,
            details: `Type changed: ${field} (${oldType} → ${newType})`,
          });
        }
      }
    }

    // Check for new required fields
    for (const field of Object.keys(newShape)) {
      const isRequired = !newShape[field].isOptional();
      const wasOptional = oldShape[field]?.isOptional();
      const didNotExist = !oldShape[field];

      if (isRequired && (wasOptional || didNotExist)) {
        breaking.push({
          type: "new_required_field",
          field,
          details: `New required field '${field}' added`,
        });
      }
    }

    return breaking;
  }

  /**
   * Generate SQL to add new columns
   */
  private generateAddColumnsSQL(
    entityName: string,
    changes: Array<{ type: string; field: string }>
  ): string {
    const additions = changes.filter((c) => c.type === "new_required_field");

    if (additions.length === 0) return "";

    const alterStatements = additions.map(
      (c) => `ADD COLUMN ${c.field}_new TEXT NULL`
    );

    return `ALTER TABLE ${entityName}\n  ${alterStatements.join(",\n  ")};`;
  }

  /**
   * Generate SQL to drop old columns
   */
  private generateDropColumnsSQL(
    entityName: string,
    changes: Array<{ type: string; field: string }>
  ): string {
    const removals = changes.filter((c) => c.type === "field_removed");

    if (removals.length === 0) return "";

    const dropStatements = removals.map((c) => `DROP COLUMN ${c.field}`);

    return `ALTER TABLE ${entityName}\n  ${dropStatements.join(",\n  ")};`;
  }

  /**
   * Execute dual-write migration
   */
  async executeDualWriteMigration(
    entityName: string,
    plan: MigrationPlan
  ): Promise<void> {
    if (plan.strategy !== "dual-write") {
      throw new Error("Invalid migration strategy");
    }

    const db = await kernelContainer.getDatabase();

    for (const step of plan.steps) {
      console.info(`[Migration] Phase ${step.phase}: ${step.action}`);

      // Execute SQL if provided
      if (step.sql) {
        await db.execute(step.sql);
      }

      // Audit the migration step
      await appendAuditEntry({
        tenantId: "system",
        actorId: "adaptive-migration-engine",
        actionId: "metadata.migration.step",
        payload: {
          entityName,
          phase: step.phase,
          action: step.action,
          sql: step.sql || null,
        },
      });

      console.info(
        `[Migration] Phase ${step.phase} completed (${step.duration})`
      );
    }
  }
}

export const adaptiveMigrationEngine = new AdaptiveMigrationEngine();

