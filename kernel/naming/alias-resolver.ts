/**
 * Alias Resolver
 *
 * The "forgiving edge": normalize human/legacy input → resolve to canonical slug via aliases.
 * Kept pure + DB-agnostic by depending on FieldAliasLookup interface.
 */

import type { FieldAliasLookup } from "./types";

/**
 * Normalize raw external names into a lookup key.
 *
 * This is intentionally conservative in v1:
 *  - trim
 *  - lowercase
 *  - strip accents
 *  - collapse non-alphanumerics into single spaces
 *
 * Examples:
 *  - " Apple "          -> "apple"
 *  - "Apples"           -> "apples"
 *  - "CostOfGoodsSold"  -> "cost of goods sold"
 *  - "COGS"             -> "cogs"
 */
export function normalizeRawName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const lowered = trimmed.toLowerCase();

  const ascii = lowered
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, ""); // strip accents

  const normalized = ascii
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

/**
 * Resolve a raw external name (CSV header, JSON key, ERP label, etc.)
 * to a canonical slug via the alias table.
 *
 * NOTES:
 *  - This does NOT guess; it only uses alias mappings you have curated.
 *  - If no alias exists, returns null. Callers can then:
 *    - ask a human/AI to map it
 *    - or fall back to creating a new Business Term
 */
/**
 * Resolve alias to canonical key (GRCD-compliant).
 * @deprecated Use resolveAliasToCanonicalKey instead
 */
export async function resolveAliasToCanonicalSlug(
  tenantId: string | null,
  rawName: string,
  aliasLookup: FieldAliasLookup
): Promise<string | null> {
  return resolveAliasToCanonicalKey(tenantId, rawName, aliasLookup);
}

/**
 * Resolve a raw external name to a canonical key via the alias table (GRCD-compliant).
 */
export async function resolveAliasToCanonicalKey(
  tenantId: string | null,
  rawName: string,
  aliasLookup: FieldAliasLookup
): Promise<string | null> {
  const normalized = normalizeRawName(rawName);
  if (!normalized) return null;

  // Try new method first (canonicalKey)
  if (typeof (aliasLookup as any).findCanonicalKeyByAlias === 'function') {
    const canonical = await (aliasLookup as any).findCanonicalKeyByAlias(
      tenantId,
      normalized
    );
    if (canonical) return canonical;
  }

  // Fallback to legacy method for backward compatibility
  const canonical = await aliasLookup.findCanonicalSlugByAlias(
    tenantId,
    normalized
  );

  return canonical ?? null;
}

/**
 * Helper: try alias resolution, else fall back to normalized slug.
 *
 * This is useful for quick-and-dirty import flows where:
 *  - If alias exists        -> use curated canonical slug
 *  - If alias does not exist -> treat normalized form as candidate slug
 *
 * You can decide whether to accept the fallback or require human approval.
 */
/**
 * Resolve or suggest canonical key (GRCD-compliant).
 * @deprecated Use resolveOrSuggestCanonicalKey instead
 */
export async function resolveOrSuggestCanonicalSlug(
  tenantId: string | null,
  rawName: string,
  aliasLookup: FieldAliasLookup
): Promise<{ canonicalSlug: string; fromAlias: boolean }> {
  const result = await resolveOrSuggestCanonicalKey(tenantId, rawName, aliasLookup);
  return { canonicalSlug: result.canonicalKey, fromAlias: result.fromAlias };
}

/**
 * Helper: try alias resolution, else fall back to normalized key (GRCD-compliant).
 */
export async function resolveOrSuggestCanonicalKey(
  tenantId: string | null,
  rawName: string,
  aliasLookup: FieldAliasLookup
): Promise<{ canonicalKey: string; fromAlias: boolean }> {
  const normalized = normalizeRawName(rawName);
  if (!normalized) {
    return { canonicalKey: "", fromAlias: false };
  }

  // Try new method first (canonicalKey)
  if (typeof (aliasLookup as any).findCanonicalKeyByAlias === 'function') {
    const fromAlias = await (aliasLookup as any).findCanonicalKeyByAlias(
      tenantId,
      normalized
    );
    if (fromAlias) {
      return { canonicalKey: fromAlias, fromAlias: true };
    }
  }

  // Fallback to legacy method
  const fromAlias = await aliasLookup.findCanonicalSlugByAlias(
    tenantId,
    normalized
  );

  if (fromAlias) {
    return { canonicalKey: fromAlias, fromAlias: true };
  }

  // Suggest canonical key by converting normalized phrase to snake_case
  const canonicalKey = normalized.split(" ").join("_");
  return { canonicalKey, fromAlias: false };
}

