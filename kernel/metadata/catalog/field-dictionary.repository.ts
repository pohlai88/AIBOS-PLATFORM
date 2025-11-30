/**
 * Field Dictionary Repository
 *
 * CRUD operations for Field Dictionary entries.
 * GRCD v4.1.0 Compliant: Uses canonical_key and governance_tier
 * Phase 2: Integrated with Governance Tiers Service for tier validation and HITL approval
 */

import { getDB } from "../../storage/db";
import { createCanonicalSlugFromLabel, getNameVariants } from "../../naming";
import type { FieldDictionaryEntry, CreateFieldDictionaryEntry } from "./types";
import { ZFieldDictionaryEntry, ZCreateFieldDictionaryEntry } from "./types";
import { governanceTierService } from "../services";
import { KernelError } from "../../errors/kernel-error";
import { baseLogger } from "../../observability/logger";

const logger = baseLogger.child({ module: "metadata:field-dictionary-repository" });

export class FieldDictionaryRepository {
  /**
   * Create a new field dictionary entry.
   * Phase 2: Validates tier compliance and requests HITL approval for Tier 1/2 changes.
   * 
   * @param input - Field dictionary entry data
   * @param options - Optional: requester for HITL approval, skipValidation to bypass tier checks
   */
  async create(
    input: CreateFieldDictionaryEntry,
    options?: { requester?: string; skipValidation?: boolean }
  ): Promise<FieldDictionaryEntry> {
    const validated = ZCreateFieldDictionaryEntry.parse(input);
    const db = getDB().getClient();

    const canonicalKey = validated.canonicalKey || createCanonicalSlugFromLabel(validated.label);

    // Phase 2: Tier compliance validation
    // Phase 2.2: Integrated with lineage service for lineage coverage checks
    if (!options?.skipValidation) {
      const tier = validated.governanceTier || "tier_3";
      const urn = validated.entityUrn || `urn:metadata:field:${canonicalKey}`;
      const compliance = await governanceTierService.validateTierCompliance(tier, {
        hasLineage: !!validated.entityUrn, // Fallback boolean
        hasProfiling: false, // Profiling will be added in Phase 2.3
        hasStandardPack: !!validated.standardPackIdPrimary,
        hasOwner: !!validated.owner,
        hasSteward: !!validated.steward,
        urn, // Phase 2.2: Pass URN for lineage coverage check
        tenantId: validated.tenantId, // Phase 2.2: Pass tenantId for lineage check
      });

      if (!compliance.compliant) {
        logger.warn(
          { tier, violations: compliance.violations, canonicalKey },
          "Tier compliance validation failed"
        );
        throw new KernelError(
          `Tier compliance validation failed: ${compliance.violations.join(", ")}`,
          "TIER_COMPLIANCE_ERROR"
        );
      }

      // Phase 2: HITL approval for Tier 1/2 changes
      // Phase 2.3: Includes impact analysis
      if (options?.requester && governanceTierService.requiresHITLApproval(tier, "create")) {
        const urn = validated.entityUrn || `urn:metadata:field:${canonicalKey}`;
        const requestId = await governanceTierService.requestChangeApproval(
          tier,
          "create",
          {
            tenantId: validated.tenantId || "global",
            requester: options.requester,
            entityType: "field_dictionary",
            entityId: "new",
            entityKey: canonicalKey,
            description: `Create field dictionary entry: ${validated.label}`,
            justification: validated.description || "No justification provided",
            urn, // Phase 2.3: Pass URN for impact analysis
          }
        );

        if (!requestId.startsWith("auto-approved-")) {
          const approvalStatus = await governanceTierService.checkApprovalStatus(requestId);
          if (!approvalStatus.approved) {
            logger.info(
              { requestId, status: approvalStatus.status },
              "HITL approval pending for field dictionary entry creation"
            );
            throw new KernelError(
              `HITL approval required for Tier ${tier} field dictionary entry creation. Request ID: ${requestId}`,
              "HITL_APPROVAL_PENDING"
            );
          }
        }
      }
    }

    const res = await db.query<FieldDictionaryEntry>(
      `
      INSERT INTO kernel_field_dictionary (
        tenant_id, canonical_key, label, description, data_type, format, unit,
        business_term_id, data_contract_id, constraints, examples,
        governance_tier, standard_pack_id_primary, standard_pack_id_secondary,
        entity_urn, owner, steward
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        governance_tier AS "governanceTier",
        standard_pack_id_primary AS "standardPackIdPrimary",
        standard_pack_id_secondary AS "standardPackIdSecondary",
        entity_urn AS "entityUrn",
        owner,
        steward,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        validated.tenantId,
        canonicalKey,
        validated.label,
        validated.description,
        validated.dataType,
        validated.format,
        validated.unit,
        validated.businessTermId,
        validated.dataContractId,
        validated.constraints ? JSON.stringify(validated.constraints) : null,
        JSON.stringify(validated.examples),
        validated.governanceTier,
        validated.standardPackIdPrimary,
        validated.standardPackIdSecondary.length > 0 ? validated.standardPackIdSecondary : null,
        validated.entityUrn,
        validated.owner,
        validated.steward,
      ],
    );

    if (!res.rows || res.rows.length === 0 || !res.rows[0]) {
      throw new KernelError("Failed to create field dictionary: no row returned from database", "METADATA_CREATE_FAILED");
    }

    const row = res.rows[0];
    return ZFieldDictionaryEntry.parse({
      ...row,
      standardPackIdSecondary: row.standardPackIdSecondary || (Array.isArray(row.standardPackIdSecondary) ? row.standardPackIdSecondary : []),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  /**
   * Find by ID.
   */
  async findById(id: string): Promise<FieldDictionaryEntry | null> {
    const db = getDB().getClient();

    const res = await db.query<FieldDictionaryEntry>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        governance_tier AS "governanceTier",
        standard_pack_id_primary AS "standardPackIdPrimary",
        standard_pack_id_secondary AS "standardPackIdSecondary",
        entity_urn AS "entityUrn",
        owner,
        steward,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_field_dictionary
      WHERE id = $1
      `,
      [id],
    );

    if (res.rowCount === 0) return null;

    return ZFieldDictionaryEntry.parse({
      ...res.rows[0],
      standardPackIdSecondary: res.rows[0].standardPackIdSecondary || [],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Find by canonical_key (tenant-scoped).
   */
  async findByCanonicalKey(
    tenantId: string | null,
    canonicalKey: string,
  ): Promise<FieldDictionaryEntry | null> {
    const db = getDB().getClient();

    const res = await db.query<FieldDictionaryEntry>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        governance_tier AS "governanceTier",
        standard_pack_id_primary AS "standardPackIdPrimary",
        standard_pack_id_secondary AS "standardPackIdSecondary",
        entity_urn AS "entityUrn",
        owner,
        steward,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_field_dictionary
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND canonical_key = $2
      `,
      [tenantId, canonicalKey],
    );

    if (res.rowCount === 0) return null;

    return ZFieldDictionaryEntry.parse({
      ...res.rows[0],
      standardPackIdSecondary: res.rows[0].standardPackIdSecondary || [],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * List all field dictionary entries for a tenant.
   */
  async listByTenant(
    tenantId: string | null,
    options?: {
      governanceTier?: string;
      dataType?: string;
      businessTermId?: string;
      dataContractId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<FieldDictionaryEntry[]> {
    const db = getDB().getClient();
    const {
      governanceTier,
      dataType,
      businessTermId,
      dataContractId,
      limit = 100,
      offset = 0,
    } = options ?? {};

    let query = `
      SELECT
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        governance_tier AS "governanceTier",
        standard_pack_id_primary AS "standardPackIdPrimary",
        standard_pack_id_secondary AS "standardPackIdSecondary",
        entity_urn AS "entityUrn",
        owner,
        steward,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_field_dictionary
      WHERE tenant_id IS NOT DISTINCT FROM $1
    `;
    const params: any[] = [tenantId];

    if (governanceTier) {
      params.push(governanceTier);
      query += ` AND governance_tier = $${params.length}`;
    }

    if (dataType) {
      params.push(dataType);
      query += ` AND data_type = $${params.length}`;
    }

    if (businessTermId) {
      params.push(businessTermId);
      query += ` AND business_term_id = $${params.length}`;
    }

    if (dataContractId) {
      params.push(dataContractId);
      query += ` AND data_contract_id = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY label ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await db.query<FieldDictionaryEntry>(query, params);

    return res.rows.map((row) =>
      ZFieldDictionaryEntry.parse({
        ...row,
        standardPackIdSecondary: row.standardPackIdSecondary || [],
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );
  }

  /**
   * Update a field dictionary entry.
   * Phase 2: Validates tier compliance and requests HITL approval for Tier 1/2 changes.
   * 
   * @param id - Field dictionary entry ID
   * @param updates - Partial update data
   * @param options - Optional: requester for HITL approval, skipValidation to bypass tier checks
   */
  async update(
    id: string,
    updates: Partial<Omit<CreateFieldDictionaryEntry, "tenantId">>,
    options?: { requester?: string; skipValidation?: boolean }
  ): Promise<FieldDictionaryEntry | null> {
    const db = getDB().getClient();

    // Get existing entity to check tier changes
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    // Phase 2: Tier change validation
    if (!options?.skipValidation && updates.governanceTier && updates.governanceTier !== existing.governanceTier) {
      const tierChangeValidation = await governanceTierService.validateTierChange(
        existing.governanceTier,
        updates.governanceTier,
        {
          hasLineage: !!(updates.entityUrn || existing.entityUrn),
          hasProfiling: false, // Profiling will be added in Phase 2.2
          hasStandardPack: !!(updates.standardPackIdPrimary || existing.standardPackIdPrimary),
          hasOwner: !!(updates.owner || existing.owner),
        }
      );

      if (!tierChangeValidation.allowed) {
        logger.warn(
          { fromTier: existing.governanceTier, toTier: updates.governanceTier, reason: tierChangeValidation.reason },
          "Tier change validation failed"
        );
        throw new KernelError(
          tierChangeValidation.reason || "Tier change not allowed",
          "TIER_CHANGE_ERROR"
        );
      }

      // Tier changes always require HITL approval
      // Phase 2.3: Includes impact analysis
      if (options?.requester) {
        const urn = updates.entityUrn || existing.entityUrn || `urn:metadata:field:${existing.canonicalKey}`;
        const requestId = await governanceTierService.requestChangeApproval(
          updates.governanceTier,
          "tier_change",
          {
            tenantId: existing.tenantId || "global",
            requester: options.requester,
            entityType: "field_dictionary",
            entityId: id,
            entityKey: existing.canonicalKey,
            description: `Change governance tier from ${existing.governanceTier} to ${updates.governanceTier}`,
            justification: "Tier change requires approval",
            urn, // Phase 2.3: Pass URN for impact analysis
          }
        );

        if (!requestId.startsWith("auto-approved-")) {
          const approvalStatus = await governanceTierService.checkApprovalStatus(requestId);
          if (!approvalStatus.approved) {
            throw new KernelError(
              `HITL approval required for tier change. Request ID: ${requestId}`,
              "HITL_APPROVAL_PENDING"
            );
          }
        }
      }
    }

    // Phase 2: HITL approval for Tier 1/2 updates
    // Phase 2.3: Includes impact analysis
    const targetTier = updates.governanceTier || existing.governanceTier;
    if (!options?.skipValidation && options?.requester && governanceTierService.requiresHITLApproval(targetTier, "update")) {
      const urn = updates.entityUrn || existing.entityUrn || `urn:metadata:field:${existing.canonicalKey}`;
      const requestId = await governanceTierService.requestChangeApproval(
        targetTier,
        "update",
        {
          tenantId: existing.tenantId || "global",
          requester: options.requester,
          entityType: "field_dictionary",
          entityId: id,
          entityKey: existing.canonicalKey,
          description: `Update field dictionary entry: ${updates.label || existing.label}`,
          justification: "Tier 1/2 metadata update requires approval",
          urn, // Phase 2.3: Pass URN for impact analysis
        }
      );

      if (!requestId.startsWith("auto-approved-")) {
        const approvalStatus = await governanceTierService.checkApprovalStatus(requestId);
        if (!approvalStatus.approved) {
          throw new KernelError(
            `HITL approval required for Tier ${targetTier} update. Request ID: ${requestId}`,
            "HITL_APPROVAL_PENDING"
          );
        }
      }
    }

    const setClauses: string[] = [];
    const params: any[] = [id];

    if (updates.canonicalKey !== undefined) {
      params.push(updates.canonicalKey);
      setClauses.push(`canonical_key = $${params.length}`);
    }
    if (updates.label !== undefined) {
      params.push(updates.label);
      setClauses.push(`label = $${params.length}`);
    }
    if (updates.description !== undefined) {
      params.push(updates.description);
      setClauses.push(`description = $${params.length}`);
    }
    if (updates.dataType !== undefined) {
      params.push(updates.dataType);
      setClauses.push(`data_type = $${params.length}`);
    }
    if (updates.format !== undefined) {
      params.push(updates.format);
      setClauses.push(`format = $${params.length}`);
    }
    if (updates.unit !== undefined) {
      params.push(updates.unit);
      setClauses.push(`unit = $${params.length}`);
    }
    if (updates.businessTermId !== undefined) {
      params.push(updates.businessTermId);
      setClauses.push(`business_term_id = $${params.length}`);
    }
    if (updates.dataContractId !== undefined) {
      params.push(updates.dataContractId);
      setClauses.push(`data_contract_id = $${params.length}`);
    }
    if (updates.constraints !== undefined) {
      params.push(updates.constraints ? JSON.stringify(updates.constraints) : null);
      setClauses.push(`constraints = $${params.length}`);
    }
    if (updates.examples !== undefined) {
      params.push(JSON.stringify(updates.examples));
      setClauses.push(`examples = $${params.length}`);
    }
    if (updates.governanceTier !== undefined) {
      params.push(updates.governanceTier);
      setClauses.push(`governance_tier = $${params.length}`);
    }
    if (updates.standardPackIdPrimary !== undefined) {
      params.push(updates.standardPackIdPrimary);
      setClauses.push(`standard_pack_id_primary = $${params.length}`);
    }
    if (updates.standardPackIdSecondary !== undefined) {
      params.push(updates.standardPackIdSecondary.length > 0 ? updates.standardPackIdSecondary : null);
      setClauses.push(`standard_pack_id_secondary = $${params.length}`);
    }
    if (updates.entityUrn !== undefined) {
      params.push(updates.entityUrn);
      setClauses.push(`entity_urn = $${params.length}`);
    }
    if (updates.owner !== undefined) {
      params.push(updates.owner);
      setClauses.push(`owner = $${params.length}`);
    }
    if (updates.steward !== undefined) {
      params.push(updates.steward);
      setClauses.push(`steward = $${params.length}`);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push("updated_at = NOW()");

    const res = await db.query<FieldDictionaryEntry>(
      `
      UPDATE kernel_field_dictionary
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        governance_tier AS "governanceTier",
        standard_pack_id_primary AS "standardPackIdPrimary",
        standard_pack_id_secondary AS "standardPackIdSecondary",
        entity_urn AS "entityUrn",
        owner,
        steward,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      params,
    );

    if (res.rowCount === 0) return null;

    return ZFieldDictionaryEntry.parse({
      ...res.rows[0],
      standardPackIdSecondary: res.rows[0].standardPackIdSecondary || [],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Delete a field dictionary entry.
   */
  async delete(id: string): Promise<boolean> {
    const db = getDB().getClient();

    const res = await db.query(
      `DELETE FROM kernel_field_dictionary WHERE id = $1`,
      [id],
    );

    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Get name variants for a field by canonical_key.
   */
  getNameVariants(canonicalKey: string) {
    return getNameVariants(canonicalKey);
  }
}

export const fieldDictionaryRepository = new FieldDictionaryRepository();
