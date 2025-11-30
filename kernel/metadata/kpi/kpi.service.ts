/**
 * Composite KPI Service
 *
 * GRCD v4.1.0 Compliant: Composite KPI Modeling (MS-F-18)
 * Option 2: Composite KPI Modeling
 *
 * Provides business logic for composite KPIs with SoT enforcement.
 */

import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";
import { compositeKpiRepository } from "./kpi.repository";
import type {
  CompositeKPI,
  CreateCompositeKPI,
  UpdateCompositeKPI,
  KPIValidationResult,
} from "./types";
import { governanceTierService } from "../services";
import { lineageService } from "../lineage";
import { metadataService } from "../services";

const logger = baseLogger.child({ module: "metadata:kpi-service" });

/**
 * Composite KPI Service
 */
export class CompositeKpiService {
  /**
   * Validate KPI compliance with GRCD requirements
   */
  async validateKPI(
    tenantId: string | null,
    kpi: CreateCompositeKPI | CompositeKPI
  ): Promise<KPIValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Validate numerator
    const numeratorField = await metadataService.getFieldDictionary(
      tenantId,
      kpi.numerator.fieldId
    );
    const numeratorHasField = !!numeratorField;
    const numeratorHasStandardPack = !!kpi.numerator.standardPackId;
    let numeratorHasLineage = false;

    if (!numeratorHasField) {
      violations.push("Numerator field not found");
    }

    if (!numeratorHasStandardPack) {
      violations.push("Numerator must have a standard pack (SoT requirement)");
    }

    if (numeratorField?.entityUrn) {
      numeratorHasLineage = await lineageService.hasLineageCoverage(
        tenantId,
        numeratorField.entityUrn
      );
      if (kpi.governanceTier === "tier_1" && !numeratorHasLineage) {
        violations.push(
          "Numerator must have lineage coverage for Tier 1 KPIs"
        );
      }
    }

    // Validate denominator
    const denominatorField = await metadataService.getFieldDictionary(
      tenantId,
      kpi.denominator.fieldId
    );
    const denominatorHasField = !!denominatorField;
    const denominatorHasStandardPack = !!kpi.denominator.standardPackId;
    let denominatorHasLineage = false;

    if (!denominatorHasField) {
      violations.push("Denominator field not found");
    }

    if (!denominatorHasStandardPack) {
      violations.push("Denominator must have a standard pack (SoT requirement)");
    }

    if (denominatorField?.entityUrn) {
      denominatorHasLineage = await lineageService.hasLineageCoverage(
        tenantId,
        denominatorField.entityUrn
      );
      if (kpi.governanceTier === "tier_1" && !denominatorHasLineage) {
        violations.push(
          "Denominator must have lineage coverage for Tier 1 KPIs"
        );
      }
    }

    // Validate governance tier requirements
    if (kpi.governanceTier === "tier_1" || kpi.governanceTier === "tier_2") {
      if (!kpi.owner) {
        violations.push("Tier 1/2 KPIs must have an owner");
      }
      if (!kpi.steward) {
        violations.push("Tier 1/2 KPIs must have a steward");
      }
    }

    // Warnings
    if (kpi.governanceTier === "tier_1" && !numeratorHasLineage) {
      warnings.push("Numerator lineage coverage recommended for Tier 1");
    }
    if (kpi.governanceTier === "tier_1" && !denominatorHasLineage) {
      warnings.push("Denominator lineage coverage recommended for Tier 1");
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      numeratorValidation: {
        hasField: numeratorHasField,
        hasStandardPack: numeratorHasStandardPack,
        hasLineage: numeratorHasLineage,
      },
      denominatorValidation: {
        hasField: denominatorHasField,
        hasStandardPack: denominatorHasStandardPack,
        hasLineage: denominatorHasLineage,
      },
    };
  }

  /**
   * Create KPI with validation
   */
  async createKPI(
    tenantId: string | null,
    data: CreateCompositeKPI
  ): Promise<CompositeKPI> {
    try {
      // Validate KPI
      const validation = await this.validateKPI(tenantId, data);
      if (!validation.isValid) {
        throw new KernelError(
          `KPI validation failed: ${validation.violations.join(", ")}`,
          "KPI_VALIDATION_FAILED",
          { validation }
        );
      }

      // Generate entity URN if not provided
      const entityUrn = data.entityUrn || `urn:metadata:kpi:${data.canonicalKey}`;

      // Create KPI
      const kpi = await compositeKpiRepository.create({
        ...data,
        tenantId,
        entityUrn,
      });

      // Create lineage nodes for numerator and denominator
      if (kpi.entityUrn) {
        const numeratorField = await metadataService.getFieldDictionary(
          tenantId,
          kpi.numerator.fieldId
        );
        const denominatorField = await metadataService.getFieldDictionary(
          tenantId,
          kpi.denominator.fieldId
        );

        if (numeratorField?.entityUrn) {
          await lineageService.createEdge(tenantId, {
            sourceUrn: numeratorField.entityUrn,
            targetUrn: kpi.entityUrn,
            edgeType: "produces",
            description: `Numerator for ${kpi.name}`,
          });
        }

        if (denominatorField?.entityUrn) {
          await lineageService.createEdge(tenantId, {
            sourceUrn: denominatorField.entityUrn,
            targetUrn: kpi.entityUrn,
            edgeType: "produces",
            description: `Denominator for ${kpi.name}`,
          });
        }
      }

      logger.info({ kpiId: kpi.id, canonicalKey: kpi.canonicalKey }, "KPI created");

      return kpi;
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, data }, "Failed to create KPI");
      throw new KernelError("Failed to create KPI", "KPI_CREATE_FAILED", error);
    }
  }

  /**
   * Update KPI with validation
   */
  async updateKPI(
    tenantId: string | null,
    id: string,
    data: UpdateCompositeKPI
  ): Promise<CompositeKPI> {
    try {
      // Get existing KPI
      const existing = await compositeKpiRepository.findById(tenantId, id);
      if (!existing) {
        throw new KernelError("KPI not found", "KPI_NOT_FOUND");
      }

      // Merge with existing data for validation
      const mergedData: CreateCompositeKPI = {
        ...existing,
        ...data,
        numerator: data.numerator || existing.numerator,
        denominator: data.denominator || existing.denominator,
      };

      // Validate KPI if numerator/denominator or tier changed
      if (
        data.numerator ||
        data.denominator ||
        data.governanceTier ||
        data.governanceTier !== existing.governanceTier
      ) {
        const validation = await this.validateKPI(tenantId, mergedData);
        if (!validation.isValid) {
          throw new KernelError(
            `KPI validation failed: ${validation.violations.join(", ")}`,
            "KPI_VALIDATION_FAILED",
            { validation }
          );
        }
      }

      // Update KPI
      const updated = await compositeKpiRepository.update(tenantId, id, data);

      logger.info({ kpiId: updated.id }, "KPI updated");

      return updated;
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, id, data }, "Failed to update KPI");
      throw new KernelError("Failed to update KPI", "KPI_UPDATE_FAILED", error);
    }
  }

  /**
   * Get KPI by ID
   */
  async getKPI(
    tenantId: string | null,
    id: string
  ): Promise<CompositeKPI | null> {
    try {
      return await compositeKpiRepository.findById(tenantId, id);
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to get KPI");
      throw new KernelError("Failed to get KPI", "KPI_GET_FAILED", error);
    }
  }

  /**
   * Get KPI by canonical key
   */
  async getKPIByCanonicalKey(
    tenantId: string | null,
    canonicalKey: string
  ): Promise<CompositeKPI | null> {
    try {
      return await compositeKpiRepository.findByCanonicalKey(tenantId, canonicalKey);
    } catch (error) {
      logger.error({ error, tenantId, canonicalKey }, "Failed to get KPI by canonical key");
      throw new KernelError("Failed to get KPI", "KPI_GET_FAILED", error);
    }
  }

  /**
   * List KPIs
   */
  async listKPIs(
    tenantId: string | null,
    filters?: {
      governanceTier?: string;
      domain?: string;
      isActive?: boolean;
    }
  ): Promise<CompositeKPI[]> {
    try {
      return await compositeKpiRepository.listByTenant(tenantId, filters);
    } catch (error) {
      logger.error({ error, tenantId, filters }, "Failed to list KPIs");
      throw new KernelError("Failed to list KPIs", "KPI_LIST_FAILED", error);
    }
  }

  /**
   * Delete KPI
   */
  async deleteKPI(tenantId: string | null, id: string): Promise<void> {
    try {
      await compositeKpiRepository.delete(tenantId, id);
      logger.info({ kpiId: id }, "KPI deleted");
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to delete KPI");
      throw new KernelError("Failed to delete KPI", "KPI_DELETE_FAILED", error);
    }
  }
}

export const compositeKpiService = new CompositeKpiService();

