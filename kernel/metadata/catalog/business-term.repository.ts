/**
 * Business Term Repository
 *
 * CRUD operations for Business Terms.
 * GRCD v4.1.0 Compliant: Uses canonical_key and governance_tier
 * Phase 2: Integrated with Governance Tiers Service for tier validation and HITL approval
 */

import { getDB } from "../../storage/db";
import { createCanonicalSlugFromLabel, getNameVariants } from "../../naming";
import type { BusinessTerm, CreateBusinessTerm } from "./types";
import { ZBusinessTerm, ZCreateBusinessTerm } from "./types";
import { governanceTierService } from "../services";
import { KernelError } from "../../errors/kernel-error";
import { baseLogger } from "../../observability/logger";

const logger = baseLogger.child({ module: "metadata:business-term-repository" });

export class BusinessTermRepository {
  /**
   * Create a new business term.
   * Automatically generates canonical_key from label if not provided.
   * Phase 2: Validates tier compliance and requests HITL approval for Tier 1/2 changes.
   * 
   * @param input - Business term data
   * @param options - Optional: requester for HITL approval, skipValidation to bypass tier checks
   */
  async create(
    input: CreateBusinessTerm,
    options?: { requester?: string; skipValidation?: boolean }
  ): Promise<BusinessTerm> {
    const validated = ZCreateBusinessTerm.parse(input);
    const db = getDB().getClient();

    // Generate canonical_key from label if not provided or empty
    const canonicalKey = validated.canonicalKey || createCanonicalSlugFromLabel(validated.label);

    // Phase 2: Tier compliance validation
    // Phase 2.2: Integrated with lineage service for lineage coverage checks
    if (!options?.skipValidation) {
      const tier = validated.governanceTier || "tier_3";
      const urn = validated.entityUrn || `urn:metadata:business_term:${canonicalKey}`;
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
        const urn = validated.entityUrn || `urn:metadata:business_term:${canonicalKey}`;
        const requestId = await governanceTierService.requestChangeApproval(
          tier,
          "create",
          {
            tenantId: validated.tenantId || "global",
            requester: options.requester,
            entityType: "business_term",
            entityId: "new", // Will be updated after creation
            entityKey: canonicalKey,
            description: `Create business term: ${validated.label}`,
            justification: validated.description || "No justification provided",
            urn, // Phase 2.3: Pass URN for impact analysis
          }
        );

        // Check if approval is required (not auto-approved)
        if (!requestId.startsWith("auto-approved-")) {
          const approvalStatus = await governanceTierService.checkApprovalStatus(requestId);
          if (!approvalStatus.approved) {
            logger.info(
              { requestId, status: approvalStatus.status },
              "HITL approval pending for business term creation"
            );
            throw new KernelError(
              `HITL approval required for Tier ${tier} business term creation. Request ID: ${requestId}`,
              "HITL_APPROVAL_PENDING"
            );
          }
        }
      }
    }

    const res = await db.query<BusinessTerm>(
      `
      INSERT INTO kernel_business_terms (
        tenant_id, canonical_key, label, description, domain, module, synonyms,
        governance_tier, standard_pack_id_primary, standard_pack_id_secondary,
        entity_urn, owner, steward
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        domain,
        module,
        synonyms,
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
        validated.domain,
        validated.module,
        JSON.stringify(validated.synonyms),
        validated.governanceTier,
        validated.standardPackIdPrimary,
        validated.standardPackIdSecondary.length > 0 ? validated.standardPackIdSecondary : null,
        validated.entityUrn,
        validated.owner,
        validated.steward,
      ],
    );

    if (!res.rows || res.rows.length === 0 || !res.rows[0]) {
      throw new KernelError("Failed to create business term: no row returned from database", "METADATA_CREATE_FAILED");
    }

    const row = res.rows[0];
    return ZBusinessTerm.parse({
      ...row,
      standardPackIdSecondary: row.standardPackIdSecondary || (Array.isArray(row.standardPackIdSecondary) ? row.standardPackIdSecondary : []),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  /**
   * Find by ID.
   */
  async findById(id: string): Promise<BusinessTerm | null> {
    const db = getDB().getClient();

    const res = await db.query<BusinessTerm>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        domain,
        module,
        synonyms,
        governance_tier AS "governanceTier",
        standard_pack_id_primary AS "standardPackIdPrimary",
        standard_pack_id_secondary AS "standardPackIdSecondary",
        entity_urn AS "entityUrn",
        owner,
        steward,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_business_terms
      WHERE id = $1
      `,
      [id],
    );

    if (res.rowCount === 0) return null;

    return ZBusinessTerm.parse({
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
  ): Promise<BusinessTerm | null> {
    const db = getDB().getClient();

    const res = await db.query<BusinessTerm>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        domain,
        module,
        synonyms,
        governance_tier AS "governanceTier",
        standard_pack_id_primary AS "standardPackIdPrimary",
        standard_pack_id_secondary AS "standardPackIdSecondary",
        entity_urn AS "entityUrn",
        owner,
        steward,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_business_terms
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND canonical_key = $2
      `,
      [tenantId, canonicalKey],
    );

    if (res.rowCount === 0) return null;

    return ZBusinessTerm.parse({
      ...res.rows[0],
      standardPackIdSecondary: res.rows[0].standardPackIdSecondary || [],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * List all business terms for a tenant.
   */
  async listByTenant(
    tenantId: string | null,
    options?: { governanceTier?: string; domain?: string; limit?: number; offset?: number },
  ): Promise<BusinessTerm[]> {
    const db = getDB().getClient();
    const { governanceTier, domain, limit = 100, offset = 0 } = options ?? {};

    let query = `
      SELECT
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        domain,
        module,
        synonyms,
        governance_tier AS "governanceTier",
        standard_pack_id_primary AS "standardPackIdPrimary",
        standard_pack_id_secondary AS "standardPackIdSecondary",
        entity_urn AS "entityUrn",
        owner,
        steward,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_business_terms
      WHERE tenant_id IS NOT DISTINCT FROM $1
    `;
    const params: any[] = [tenantId];

    if (governanceTier) {
      params.push(governanceTier);
      query += ` AND governance_tier = $${params.length}`;
    }

    if (domain) {
      params.push(domain);
      query += ` AND domain = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY label ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await db.query<BusinessTerm>(query, params);

    return res.rows.map((row) =>
      ZBusinessTerm.parse({
        ...row,
        standardPackIdSecondary: row.standardPackIdSecondary || [],
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );
  }

  /**
   * Update a business term.
   * Phase 2: Validates tier compliance and requests HITL approval for Tier 1/2 changes.
   * 
   * @param id - Business term ID
   * @param updates - Partial update data
   * @param options - Optional: requester for HITL approval, skipValidation to bypass tier checks
   */
  async update(
    id: string,
    updates: Partial<Omit<CreateBusinessTerm, "tenantId">>,
    options?: { requester?: string; skipValidation?: boolean }
  ): Promise<BusinessTerm | null> {
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
        const urn = updates.entityUrn || existing.entityUrn || `urn:metadata:business_term:${existing.canonicalKey}`;
        const requestId = await governanceTierService.requestChangeApproval(
          updates.governanceTier,
          "tier_change",
          {
            tenantId: existing.tenantId || "global",
            requester: options.requester,
            entityType: "business_term",
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
      const urn = updates.entityUrn || existing.entityUrn || `urn:metadata:business_term:${existing.canonicalKey}`;
      const requestId = await governanceTierService.requestChangeApproval(
        targetTier,
        "update",
        {
          tenantId: existing.tenantId || "global",
          requester: options.requester,
          entityType: "business_term",
          entityId: id,
          entityKey: existing.canonicalKey,
          description: `Update business term: ${updates.label || existing.label}`,
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
    if (updates.domain !== undefined) {
      params.push(updates.domain);
      setClauses.push(`domain = $${params.length}`);
    }
    if (updates.module !== undefined) {
      params.push(updates.module);
      setClauses.push(`module = $${params.length}`);
    }
    if (updates.synonyms !== undefined) {
      params.push(JSON.stringify(updates.synonyms));
      setClauses.push(`synonyms = $${params.length}`);
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

    const res = await db.query<BusinessTerm>(
      `
      UPDATE kernel_business_terms
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        canonical_key AS "canonicalKey",
        label,
        description,
        domain,
        module,
        synonyms,
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

    return ZBusinessTerm.parse({
      ...res.rows[0],
      standardPackIdSecondary: res.rows[0].standardPackIdSecondary || [],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Delete a business term.
   */
  async delete(id: string): Promise<boolean> {
    const db = getDB().getClient();

    const res = await db.query(
      `DELETE FROM kernel_business_terms WHERE id = $1`,
      [id],
    );

    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Get name variants for a business term by canonical_key.
   */
  getNameVariants(canonicalKey: string) {
    return getNameVariants(canonicalKey);
  }
}

export const businessTermRepository = new BusinessTermRepository();
