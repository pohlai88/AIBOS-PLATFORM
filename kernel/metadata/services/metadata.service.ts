/**
 * Unified Metadata Service
 *
 * GRCD v4.1.0 Compliant: Unified facade for all metadata operations
 * Option 3: Service Layer Consolidation
 *
 * Provides a single entry point for:
 * - CRUD operations (business terms, data contracts, field dictionary)
 * - Search and lookup operations
 * - Standard pack operations
 * - Unified error handling
 * - Consistent API
 */

import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";
import {
  businessTermRepository,
  dataContractRepository,
  fieldDictionaryRepository,
  fieldAliasRepository,
  standardPackRepository,
  type BusinessTerm,
  type CreateBusinessTerm,
  type DataContract,
  type CreateDataContract,
  type FieldDictionary,
  type CreateFieldDictionary,
  type FieldAlias,
  type CreateFieldAlias,
  type StandardPack,
  type CreateStandardPack,
} from "../catalog";
import { metadataSearchService, type SearchFilters, type SearchOptions, type SearchResults } from "../search";
import { governanceTierService } from "./governance-tier.service";

const logger = baseLogger.child({ module: "metadata:metadata-service" });

/**
 * Unified Metadata Service
 *
 * Single entry point for all metadata operations.
 */
export class MetadataService {
  /**
   * Business Terms Operations
   */

  async getBusinessTerm(
    tenantId: string | null,
    id: string
  ): Promise<BusinessTerm | null> {
    try {
      return await businessTermRepository.findById(tenantId, id);
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to get business term");
      throw new KernelError("Failed to get business term", "METADATA_GET_FAILED", error);
    }
  }

  async getBusinessTermByCanonicalKey(
    tenantId: string | null,
    canonicalKey: string
  ): Promise<BusinessTerm | null> {
    try {
      return await businessTermRepository.findByCanonicalKey(tenantId, canonicalKey);
    } catch (error) {
      logger.error({ error, tenantId, canonicalKey }, "Failed to get business term by canonical key");
      throw new KernelError("Failed to get business term", "METADATA_GET_FAILED", error);
    }
  }

  async listBusinessTerms(
    tenantId: string | null,
    filters?: {
      domain?: string;
      governanceTier?: string;
      standardPackId?: string;
    }
  ): Promise<BusinessTerm[]> {
    try {
      return await businessTermRepository.listByTenant(tenantId, filters);
    } catch (error) {
      logger.error({ error, tenantId, filters }, "Failed to list business terms");
      throw new KernelError("Failed to list business terms", "METADATA_LIST_FAILED", error);
    }
  }

  async createBusinessTerm(
    tenantId: string | null,
    data: CreateBusinessTerm
  ): Promise<BusinessTerm> {
    try {
      // Validate governance tier compliance
      if (data.governanceTier) {
        const compliance = await governanceTierService.validateTierCompliance(
          data.governanceTier,
          {
            ...data,
            urn: data.entityUrn || undefined,
            tenantId: tenantId,
            fieldId: undefined,
          }
        );
        if (!compliance.compliant) {
          throw new KernelError(
            `Governance tier violations: ${compliance.violations.join(", ")}`,
            "GOVERNANCE_TIER_VIOLATION",
            { violations: compliance.violations }
          );
        }
      }

      return await businessTermRepository.create({ ...data, tenantId });
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, data }, "Failed to create business term");
      throw new KernelError("Failed to create business term", "METADATA_CREATE_FAILED", error);
    }
  }

  async updateBusinessTerm(
    tenantId: string | null,
    id: string,
    data: Partial<CreateBusinessTerm>
  ): Promise<BusinessTerm> {
    try {
      // Validate governance tier compliance if tier is being updated
      if (data.governanceTier) {
        const existing = await businessTermRepository.findById(tenantId, id);
        if (!existing) {
          throw new KernelError("Business term not found", "METADATA_NOT_FOUND");
        }

        const compliance = await governanceTierService.validateTierCompliance(
          data.governanceTier,
          {
            ...existing,
            ...data,
            urn: data.entityUrn || existing.entityUrn || undefined,
            tenantId: tenantId,
            fieldId: undefined,
          }
        );
        if (!compliance.compliant) {
          throw new KernelError(
            `Governance tier violations: ${compliance.violations.join(", ")}`,
            "GOVERNANCE_TIER_VIOLATION",
            { violations: compliance.violations }
          );
        }
      }

      return await businessTermRepository.update(tenantId, id, data);
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, id, data }, "Failed to update business term");
      throw new KernelError("Failed to update business term", "METADATA_UPDATE_FAILED", error);
    }
  }

  async deleteBusinessTerm(
    tenantId: string | null,
    id: string
  ): Promise<void> {
    try {
      await businessTermRepository.delete(tenantId, id);
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to delete business term");
      throw new KernelError("Failed to delete business term", "METADATA_DELETE_FAILED", error);
    }
  }

  /**
   * Data Contracts Operations
   */

  async getDataContract(
    tenantId: string | null,
    id: string
  ): Promise<DataContract | null> {
    try {
      return await dataContractRepository.findById(tenantId, id);
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to get data contract");
      throw new KernelError("Failed to get data contract", "METADATA_GET_FAILED", error);
    }
  }

  async getDataContractByCanonicalKey(
    tenantId: string | null,
    canonicalKey: string
  ): Promise<DataContract | null> {
    try {
      return await dataContractRepository.findByCanonicalKey(tenantId, canonicalKey);
    } catch (error) {
      logger.error({ error, tenantId, canonicalKey }, "Failed to get data contract by canonical key");
      throw new KernelError("Failed to get data contract", "METADATA_GET_FAILED", error);
    }
  }

  async listDataContracts(
    tenantId: string | null,
    filters?: {
      governanceTier?: string;
      standardPackId?: string;
    }
  ): Promise<DataContract[]> {
    try {
      return await dataContractRepository.listByTenant(tenantId, filters);
    } catch (error) {
      logger.error({ error, tenantId, filters }, "Failed to list data contracts");
      throw new KernelError("Failed to list data contracts", "METADATA_LIST_FAILED", error);
    }
  }

  async createDataContract(
    tenantId: string | null,
    data: CreateDataContract
  ): Promise<DataContract> {
    try {
      // Validate governance tier compliance
      if (data.governanceTier) {
        const compliance = await governanceTierService.validateTierCompliance(
          data.governanceTier,
          {
            ...data,
            urn: data.entityUrn || undefined,
            tenantId: tenantId,
            fieldId: undefined,
          }
        );
        if (!compliance.compliant) {
          throw new KernelError(
            `Governance tier violations: ${compliance.violations.join(", ")}`,
            "GOVERNANCE_TIER_VIOLATION",
            { violations: compliance.violations }
          );
        }
      }

      return await dataContractRepository.create({ ...data, tenantId });
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, data }, "Failed to create data contract");
      throw new KernelError("Failed to create data contract", "METADATA_CREATE_FAILED", error);
    }
  }

  async updateDataContract(
    tenantId: string | null,
    id: string,
    data: Partial<CreateDataContract>
  ): Promise<DataContract> {
    try {
      // Validate governance tier compliance if tier is being updated
      if (data.governanceTier) {
        const existing = await dataContractRepository.findById(tenantId, id);
        if (!existing) {
          throw new KernelError("Data contract not found", "METADATA_NOT_FOUND");
        }

        const compliance = await governanceTierService.validateTierCompliance(
          data.governanceTier,
          {
            ...existing,
            ...data,
            urn: data.entityUrn || existing.entityUrn || undefined,
            tenantId: tenantId,
            fieldId: undefined,
          }
        );
        if (!compliance.compliant) {
          throw new KernelError(
            `Governance tier violations: ${compliance.violations.join(", ")}`,
            "GOVERNANCE_TIER_VIOLATION",
            { violations: compliance.violations }
          );
        }
      }

      return await dataContractRepository.update(tenantId, id, data);
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, id, data }, "Failed to update data contract");
      throw new KernelError("Failed to update data contract", "METADATA_UPDATE_FAILED", error);
    }
  }

  async deleteDataContract(
    tenantId: string | null,
    id: string
  ): Promise<void> {
    try {
      await dataContractRepository.delete(tenantId, id);
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to delete data contract");
      throw new KernelError("Failed to delete data contract", "METADATA_DELETE_FAILED", error);
    }
  }

  /**
   * Field Dictionary Operations
   */

  async getFieldDictionary(
    tenantId: string | null,
    id: string
  ): Promise<FieldDictionary | null> {
    try {
      return await fieldDictionaryRepository.findById(id);
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to get field dictionary");
      throw new KernelError("Failed to get field dictionary", "METADATA_GET_FAILED", error);
    }
  }

  async getFieldDictionaryByCanonicalKey(
    tenantId: string | null,
    canonicalKey: string
  ): Promise<FieldDictionary | null> {
    try {
      return await fieldDictionaryRepository.findByCanonicalKey(tenantId, canonicalKey);
    } catch (error) {
      logger.error({ error, tenantId, canonicalKey }, "Failed to get field dictionary by canonical key");
      throw new KernelError("Failed to get field dictionary", "METADATA_GET_FAILED", error);
    }
  }

  async listFieldDictionaries(
    tenantId: string | null,
    filters?: {
      governanceTier?: string;
      standardPackId?: string;
    }
  ): Promise<FieldDictionary[]> {
    try {
      return await fieldDictionaryRepository.listByTenant(tenantId, filters);
    } catch (error) {
      logger.error({ error, tenantId, filters }, "Failed to list field dictionaries");
      throw new KernelError("Failed to list field dictionaries", "METADATA_LIST_FAILED", error);
    }
  }

  async createFieldDictionary(
    tenantId: string | null,
    data: CreateFieldDictionary
  ): Promise<FieldDictionary> {
    try {
      // Validate governance tier compliance
      if (data.governanceTier) {
        const compliance = await governanceTierService.validateTierCompliance(
          data.governanceTier,
          {
            ...data,
            urn: data.entityUrn || undefined,
            tenantId: tenantId,
            fieldId: data.id || undefined,
          }
        );
        if (!compliance.compliant) {
          throw new KernelError(
            `Governance tier violations: ${compliance.violations.join(", ")}`,
            "GOVERNANCE_TIER_VIOLATION",
            { violations: compliance.violations }
          );
        }
      }

      return await fieldDictionaryRepository.create({ ...data, tenantId });
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, data }, "Failed to create field dictionary");
      throw new KernelError("Failed to create field dictionary", "METADATA_CREATE_FAILED", error);
    }
  }

  async updateFieldDictionary(
    tenantId: string | null,
    id: string,
    data: Partial<CreateFieldDictionary>
  ): Promise<FieldDictionary> {
    try {
      // Validate governance tier compliance if tier is being updated
      if (data.governanceTier) {
        const existing = await fieldDictionaryRepository.findById(id);
        if (!existing) {
          throw new KernelError("Field dictionary not found", "METADATA_NOT_FOUND");
        }

        const compliance = await governanceTierService.validateTierCompliance(
          data.governanceTier,
          {
            ...existing,
            ...data,
            urn: data.entityUrn || existing.entityUrn || undefined,
            tenantId: tenantId,
            fieldId: id,
          }
        );
        if (!compliance.compliant) {
          throw new KernelError(
            `Governance tier violations: ${compliance.violations.join(", ")}`,
            "GOVERNANCE_TIER_VIOLATION",
            { violations: compliance.violations }
          );
        }
      }

      return await fieldDictionaryRepository.update(tenantId, id, data);
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, id, data }, "Failed to update field dictionary");
      throw new KernelError("Failed to update field dictionary", "METADATA_UPDATE_FAILED", error);
    }
  }

  async deleteFieldDictionary(
    tenantId: string | null,
    id: string
  ): Promise<void> {
    try {
      await fieldDictionaryRepository.delete(tenantId, id);
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to delete field dictionary");
      throw new KernelError("Failed to delete field dictionary", "METADATA_DELETE_FAILED", error);
    }
  }

  /**
   * Standard Pack Operations
   */

  async getStandardPack(
    tenantId: string | null,
    id: string
  ): Promise<StandardPack | null> {
    try {
      return await standardPackRepository.findById(tenantId, id);
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to get standard pack");
      throw new KernelError("Failed to get standard pack", "METADATA_GET_FAILED", error);
    }
  }

  async listStandardPacks(
    tenantId: string | null,
    filters?: {
      standardType?: string;
      isDeprecated?: boolean;
    }
  ): Promise<StandardPack[]> {
    try {
      return await standardPackRepository.listByTenant(tenantId, filters);
    } catch (error) {
      logger.error({ error, tenantId, filters }, "Failed to list standard packs");
      throw new KernelError("Failed to list standard packs", "METADATA_LIST_FAILED", error);
    }
  }

  async createStandardPack(
    tenantId: string | null,
    data: CreateStandardPack
  ): Promise<StandardPack> {
    try {
      return await standardPackRepository.create({ ...data, tenantId });
    } catch (error) {
      logger.error({ error, tenantId, data }, "Failed to create standard pack");
      throw new KernelError("Failed to create standard pack", "METADATA_CREATE_FAILED", error);
    }
  }

  async updateStandardPack(
    tenantId: string | null,
    id: string,
    data: Partial<CreateStandardPack>
  ): Promise<StandardPack> {
    try {
      return await standardPackRepository.update(tenantId, id, data);
    } catch (error) {
      logger.error({ error, tenantId, id, data }, "Failed to update standard pack");
      throw new KernelError("Failed to update standard pack", "METADATA_UPDATE_FAILED", error);
    }
  }

  /**
   * Search Operations
   */

  async search(
    tenantId: string | null,
    query: string,
    filters?: SearchFilters,
    options?: SearchOptions
  ): Promise<SearchResults> {
    try {
      return await metadataSearchService.search(tenantId, query, filters, options);
    } catch (error) {
      logger.error({ error, tenantId, query, filters }, "Failed to search metadata");
      throw new KernelError("Failed to search metadata", "METADATA_SEARCH_FAILED", error);
    }
  }

  async lookupByCanonicalKey(
    tenantId: string | null,
    canonicalKey: string,
    entityType?: 'business_term' | 'data_contract' | 'field_dictionary'
  ) {
    try {
      return await metadataSearchService.lookupByCanonicalKey(tenantId, canonicalKey, entityType);
    } catch (error) {
      logger.error({ error, tenantId, canonicalKey, entityType }, "Failed to lookup by canonical key");
      throw new KernelError("Failed to lookup by canonical key", "METADATA_LOOKUP_FAILED", error);
    }
  }
}

export const metadataService = new MetadataService();

