/**
 * Name Engine
 *
 * The ONLY place that knows how to convert between label/slug/variants.
 * All naming transformations flow through here.
 */

import type { NameVariants } from "./types";

/**
 * Convert any slug-like or identifier string into an array of lowercase words.
 * Handles:
 *  - snake_case
 *  - kebab-case
 *  - Title Case
 *  - camelCase / PascalCase
 *  - mixed separators
 */
function splitWords(slugLike: string): string[] {
  if (!slugLike) return [];

  // Replace underscores / dashes with spaces
  const withSpaces = slugLike
    .replace(/[_\-]+/g, " ")
    // Insert space before capital letters that follow lowercase/digit
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  const lowered = withSpaces.toLowerCase();
  if (!lowered) return [];

  return lowered.split(" ").filter(Boolean);
}

function toTitleCase(words: string[]): string {
  return words
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function toSnakeCase(words: string[]): string {
  return words.join("_");
}

function toCamelCase(words: string[]): string {
  if (!words.length) return "";
  return (
    words[0] +
    words
      .slice(1)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join("")
  );
}

function toPascalCase(words: string[]): string {
  return words
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join("");
}

function toKebabCase(words: string[]): string {
  return words.join("-");
}

function toScreamingSnake(words: string[]): string {
  return words.join("_").toUpperCase();
}

function toUpperCaseSentence(words: string[]): string {
  return words.join(" ").toUpperCase();
}

function toLowerCaseSentence(words: string[]): string {
  return words.join(" ");
}

function toTrainCase(words: string[]): string {
  return words
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join("-");
}

/**
 * Create the canonical slug from a human label.
 *
 * This is used when first creating a Business Term or Field.
 * Result is always lower_snake_case.
 *
 * Examples:
 *  - "Cost of Goods Sold"  -> "cost_of_goods_sold"
 *  - "  Journal  Date  "   -> "journal_date"
 *  - "COGS"                -> "cogs"
 */
export function createCanonicalSlugFromLabel(label: string): string {
  const normalized = label
    .trim()
    // remove quotes
    .replace(/['"`]/g, "")
    // any non-alphanumeric -> space
    .replace(/[^A-Za-z0-9]+/g, " ")
    // collapse spaces
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (!normalized) return "";

  const words = normalized.split(" ").filter(Boolean);
  return words.join("_");
}

/**
 * Ensure a slug is normalized to lower_snake_case, regardless of original style.
 *
 * Examples:
 *  - "CostOfGoodsSold"     -> "cost_of_goods_sold"
 *  - "cost-of-goods-sold"  -> "cost_of_goods_sold"
 *  - "cost_of_goods_sold"  -> "cost_of_goods_sold"
 */
export function normalizeSlug(slugLike: string): string {
  const words = splitWords(slugLike);
  return toSnakeCase(words);
}

/**
 * Given a canonical slug (or slug-like string), return all naming variants.
 *
 * Canonical rule:
 *  - We always normalize the input to lower_snake_case and treat that as the SSOT.
 */
export function getNameVariants(slugLike: string): NameVariants {
  const normalizedSlug = normalizeSlug(slugLike);
  const words = splitWords(normalizedSlug);

  const snake = toSnakeCase(words);

  return {
    slug: snake,
    titleCase: toTitleCase(words),
    snakeCase: snake,
    camelCase: toCamelCase(words),
    pascalCase: toPascalCase(words),
    kebabCase: toKebabCase(words),
    screamingSnake: toScreamingSnake(words),
    upperCase: toUpperCaseSentence(words),
    lowerCase: toLowerCaseSentence(words),
    trainCase: toTrainCase(words),
  };
}

