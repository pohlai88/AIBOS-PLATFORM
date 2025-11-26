/**
 * Naming Types
 *
 * Central place for naming-related types.
 */

/**
 * All supported naming variants derived from a canonical slug.
 *
 * Canonical rule:
 *  - slug is always lower_snake_case (e.g. "cost_of_goods_sold")
 */
export type NameVariants = {
  /** Canonical lower_snake_case slug (SSOT for naming) */
  slug: string;
  /** "Cost Of Goods Sold" */
  titleCase: string;
  /** "cost_of_goods_sold" */
  snakeCase: string;
  /** "costOfGoodsSold" */
  camelCase: string;
  /** "CostOfGoodsSold" */
  pascalCase: string;
  /** "cost-of-goods-sold" */
  kebabCase: string;
  /** "COST_OF_GOODS_SOLD" */
  screamingSnake: string;
  /** "COST OF GOODS SOLD" */
  upperCase: string;
  /** "cost of goods sold" */
  lowerCase: string;
  /** "Cost-Of-Goods-Sold" */
  trainCase: string;
};

/**
 * Contract for any component that can look up aliases from storage.
 *
 * This keeps alias resolution decoupled from concrete DB implementation.
 */
export interface FieldAliasLookup {
  /**
   * Given a tenant (or null for global) and a normalized alias key,
   * return the canonical slug if any mapping exists.
   */
  findCanonicalSlugByAlias(
    tenantId: string | null,
    aliasNormalized: string
  ): Promise<string | null>;
}

