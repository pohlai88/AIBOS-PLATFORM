/**
 * CSS Variable Extractor Utility
 *
 * Extracts CSS variables from globals.css and validates token usage.
 *
 * @module css-variable-extractor
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Extract all CSS variables from globals.css
 *
 * @param {string} globalsCssPath - Path to globals.css
 * @returns {Object} Map of variable names to values
 */
export function extractCSSVariables(globalsCssPath = null) {
  const defaultPath = path.resolve(
    process.cwd(),
    'packages/ui/src/design/tokens/globals.css'
  )

  const cssPath = globalsCssPath || defaultPath

  if (!fs.existsSync(cssPath)) {
    throw new Error(`globals.css not found at: ${cssPath}`)
  }

  const content = fs.readFileSync(cssPath, 'utf8')
  const variables = {}

  // Match CSS variable definitions: --variable-name: value;
  const variableRegex = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi
  let match

  while ((match = variableRegex.exec(content)) !== null) {
    const [, name, value] = match
    variables[`--${name}`] = value.trim()
  }

  return variables
}

/**
 * Check if a token exists in globals.css
 *
 * @param {string} tokenName - Token name (e.g., "--color-accent")
 * @param {Object} variables - CSS variables map (optional, will extract if not provided)
 * @returns {boolean} True if token exists
 */
export function tokenExists(tokenName, variables = null) {
  const vars = variables || extractCSSVariables()
  return tokenName in vars
}

/**
 * Validate token naming convention
 *
 * @param {string} tokenName - Token name to validate
 * @param {string[]} allowedPrefixes - Allowed prefixes from constitution
 * @returns {Object} Validation result
 */
export function validateTokenNaming(tokenName, allowedPrefixes) {
  // Remove -- prefix for validation
  const nameWithoutPrefix = tokenName.replace(/^--/, '')

  // Check pattern: /^[a-z0-9-]+$/
  const patternValid = /^[a-z0-9-]+$/.test(nameWithoutPrefix)

  // Check if starts with allowed prefix
  const prefixValid = allowedPrefixes.some(prefix =>
    nameWithoutPrefix.startsWith(prefix)
  )

  // Check for uppercase letters
  const noUppercase = nameWithoutPrefix === nameWithoutPrefix.toLowerCase()

  // Check for raw values in name
  const rawValuePatterns = [
    /red|green|blue|yellow|orange|purple|pink/i,
    /small|medium|large|tiny|huge/i,
    /bold|normal|light|heavy/i,
  ]
  const noRawValues = !rawValuePatterns.some(pattern =>
    pattern.test(nameWithoutPrefix)
  )

  return {
    valid: patternValid && prefixValid && noUppercase && noRawValues,
    violations: [
      !patternValid && 'TOK-NAME-001: Must match pattern /^--[a-z0-9-]+$/',
      !prefixValid && 'TOK-NAME-002: Must use allowed prefix',
      !noUppercase && 'TOK-NAME-003: No uppercase letters allowed',
      !noRawValues &&
        'TOK-NAME-004: Semantic names must not contain raw values',
    ].filter(Boolean),
  }
}

/**
 * Get token value from globals.css
 *
 * @param {string} tokenName - Token name
 * @param {Object} variables - CSS variables map (optional)
 * @returns {string|null} Token value or null
 */
export function getTokenValue(tokenName, variables = null) {
  const vars = variables || extractCSSVariables()
  return vars[tokenName] || null
}

/**
 * Check if token references another token (var(--other-token))
 *
 * @param {string} tokenValue - Token value
 * @returns {string[]} Array of referenced token names
 */
export function extractTokenReferences(tokenValue) {
  if (!tokenValue) return []

  const varRegex = /var\((--[a-z0-9-]+)\)/gi
  const references = []
  let match

  while ((match = varRegex.exec(tokenValue)) !== null) {
    references.push(match[1])
  }

  return references
}

/**
 * Validate token hierarchy (semantic tokens must reference global tokens)
 *
 * @param {string} tokenName - Token name
 * @param {string} tokenValue - Token value
 * @param {Object} allVariables - All CSS variables
 * @returns {Object} Validation result
 */
export function validateTokenHierarchy(tokenName, tokenValue, allVariables) {
  const references = extractTokenReferences(tokenValue)

  if (references.length === 0) {
    // Global token - no validation needed
    return { valid: true, violations: [] }
  }

  // Semantic token - must reference global tokens
  const violations = []

  for (const ref of references) {
    if (!tokenExists(ref, allVariables)) {
      violations.push(
        `TOK-HIER-010: Semantic token ${tokenName} references non-existent token ${ref}`
      )
    }

    // Check if referenced token is also a semantic token (circular reference check)
    const refValue = getTokenValue(ref, allVariables)
    if (refValue && extractTokenReferences(refValue).length > 0) {
      // This is okay - semantic tokens can reference other semantic tokens
      // But we should check for circular references
      if (extractTokenReferences(refValue).includes(tokenName)) {
        violations.push(
          `TOK-HIER-010: Circular reference detected: ${tokenName} -> ${ref} -> ${tokenName}`
        )
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}
