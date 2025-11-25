/**
 * Token Validator
 *
 * Validates token usage against tokens.yml constitution.
 * Priority A - Must run first as components depend on tokens.
 *
 * @module token-validator
 */

import { loadConstitution } from '../load-constitution.mjs'
import {
  extractCSSVariables,
  tokenExists,
  validateTokenNaming,
  validateTokenHierarchy,
  getTokenValue,
} from './utils/css-variable-extractor.mjs'

/**
 * Validate token against constitution rules
 *
 * @param {string} tokenName - Token name to validate
 * @param {string} filePath - File where token is used
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export async function validateToken(tokenName, filePath, options = {}) {
  const constitution = loadConstitution('tokens')
  const rules = constitution.constitution || constitution
  const violations = []
  const warnings = []

  // Extract CSS variables
  const cssVariables = extractCSSVariables()

  // VAL-001: Token must exist in globals.css
  if (!tokenExists(tokenName, cssVariables)) {
    violations.push({
      rule: 'VAL-001',
      message: `Token ${tokenName} does not exist in globals.css`,
      file: filePath,
      token: tokenName,
    })
    return { valid: false, violations, warnings }
  }

  // VAL-002: Token follows naming prefix rules
  const namingRules = rules.naming?.rules || []
  const allowedPrefixes = rules.naming?.allowedPrefixes || []
  const namingResult = validateTokenNaming(tokenName, allowedPrefixes)

  if (!namingResult.valid) {
    violations.push({
      rule: 'VAL-002',
      message: `Token ${tokenName} violates naming conventions`,
      violations: namingResult.violations,
      file: filePath,
      token: tokenName,
    })
  }

  // VAL-003: WCAG contrast validated (for color tokens)
  if (tokenName.startsWith('--color-')) {
    const contrastResult = validateColorContrast(tokenName, cssVariables, rules)
    if (!contrastResult.valid) {
      warnings.push(...contrastResult.warnings)
    }
  }

  // VAL-004: Tenant override rules validated
  const tenantResult = validateTenantOverride(tokenName, rules)
  if (!tenantResult.valid) {
    violations.push({
      rule: 'VAL-004',
      message: tenantResult.message,
      file: filePath,
      token: tokenName,
    })
  }

  // VAL-005: Safe Mode override validation
  const safeModeResult = validateSafeMode(tokenName, rules)
  if (!safeModeResult.valid) {
    warnings.push({
      rule: 'VAL-005',
      message: safeModeResult.message,
      file: filePath,
      token: tokenName,
    })
  }

  // VAL-006: Density mode validation
  if (tokenName.startsWith('--space-') || tokenName.startsWith('--grid-')) {
    const densityResult = validateDensityMode(tokenName, rules)
    if (!densityResult.valid) {
      warnings.push({
        rule: 'VAL-006',
        message: densityResult.message,
        file: filePath,
        token: tokenName,
      })
    }
  }

  // VAL-007: State tokens validated
  if (
    tokenName.includes('-hover') ||
    tokenName.includes('-active') ||
    tokenName.includes('-disabled') ||
    tokenName.includes('-selected')
  ) {
    const stateResult = validateStateToken(tokenName, rules)
    if (!stateResult.valid) {
      violations.push({
        rule: 'VAL-007',
        message: stateResult.message,
        file: filePath,
        token: tokenName,
      })
    }
  }

  // VAL-008: Cross-category conflict rules validated
  const conflictResult = validateCrossCategoryConflicts(tokenName, rules)
  if (!conflictResult.valid) {
    violations.push({
      rule: 'VAL-008',
      message: conflictResult.message,
      file: filePath,
      token: tokenName,
    })
  }

  // Validate token hierarchy
  const tokenValue = getTokenValue(tokenName, cssVariables)
  if (tokenValue) {
    const hierarchyResult = validateTokenHierarchy(
      tokenName,
      tokenValue,
      cssVariables
    )
    if (!hierarchyResult.valid) {
      violations.push({
        rule: 'TOK-HIER-010',
        message: `Token hierarchy violation: ${hierarchyResult.violations.join(', ')}`,
        file: filePath,
        token: tokenName,
      })
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    warnings,
  }
}

/**
 * Validate color contrast against WCAG rules
 */
function validateColorContrast(tokenName, cssVariables, rules) {
  const colorRules = rules.categories?.color
  if (!colorRules) {
    return { valid: true, warnings: [] }
  }

  const warnings = []
  const tokenValue = getTokenValue(tokenName, cssVariables)

  // Basic validation - in production, use a proper contrast calculator
  // This is a placeholder that checks if token exists and follows naming
  if (tokenName.includes('text') && !tokenName.includes('muted')) {
    warnings.push({
      message: `Text color ${tokenName} should be validated for WCAG AA (4.5:1) or AAA (7:1) contrast`,
    })
  }

  return {
    valid: true, // Don't fail on contrast warnings, just warn
    warnings,
  }
}

/**
 * Validate tenant override rules
 */
function validateTenantOverride(tokenName, rules) {
  const tenantRules = rules.categories?.color?.tenantOverride
  if (!tenantRules) {
    return { valid: true }
  }

  const allowed = tenantRules.allowed || []
  const forbidden = tenantRules.forbidden || []

  // Check if token is in forbidden list
  for (const pattern of forbidden) {
    if (tokenName.includes(pattern.replace('--', '').replace('*', ''))) {
      return {
        valid: false,
        message: `Token ${tokenName} is forbidden for tenant override (TENANT-002)`,
      }
    }
  }

  return { valid: true }
}

/**
 * Validate Safe Mode rules
 */
function validateSafeMode(tokenName, rules) {
  const safeMode = rules.themes?.safeMode
  if (!safeMode) {
    return { valid: true }
  }

  // Check if token should be overridden in Safe Mode
  if (tokenName.startsWith('--shadow-')) {
    return {
      valid: true,
      message: `Shadow token ${tokenName} will be disabled in Safe Mode (SAFE-002)`,
    }
  }

  return { valid: true }
}

/**
 * Validate density mode support
 */
function validateDensityMode(tokenName, rules) {
  const density = rules.categories?.density
  if (!density) {
    return { valid: true }
  }

  return {
    valid: true,
    message: `Spacing token ${tokenName} should support density modes (compact, default, comfortable)`,
  }
}

/**
 * Validate state token
 */
function validateStateToken(tokenName, rules) {
  const stateRules = rules.categories?.state
  if (!stateRules) {
    return { valid: true }
  }

  // Check if state token follows naming convention
  const validStates = stateRules.states || []
  const tokenState = tokenName.split('-').pop()

  if (!validStates.includes(tokenState)) {
    return {
      valid: false,
      message: `State token ${tokenName} uses invalid state: ${tokenState}`,
    }
  }

  return { valid: true }
}

/**
 * Validate cross-category conflicts
 */
function validateCrossCategoryConflicts(tokenName, rules) {
  const conflictRules = rules.conflictRules || []

  // Check if token name violates conflict rules
  for (const conflictRule of conflictRules) {
    const ruleId = conflictRule.id
    const rule = conflictRule.rule

    // Example: Check if color token defines spacing
    if (tokenName.startsWith('--color-') && rule.includes('spacing')) {
      if (
        tokenName.includes('space') ||
        tokenName.includes('gap') ||
        tokenName.includes('padding') ||
        tokenName.includes('margin')
      ) {
        return {
          valid: false,
          message: `Token ${tokenName} violates ${ruleId}: ${rule}`,
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Main validate function (for pipeline compatibility)
 *
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export async function validate(filePath, fileContent, options = {}) {
  return await validateTokensInFile(filePath, fileContent)
}

/**
 * Validate all tokens in a file
 *
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content
 * @returns {Object} Validation result
 */
export async function validateTokensInFile(filePath, fileContent) {
  const violations = []
  const warnings = []

  // Extract token usage from file (simplified - in production, use AST)
  const tokenRegex = /var\((--[a-z0-9-]+)\)/gi
  const tokens = new Set()
  let match

  while ((match = tokenRegex.exec(fileContent)) !== null) {
    tokens.add(match[1])
  }

  // Also check for Tailwind token classes
  const tailwindTokenRegex =
    /(?:bg|text|border|ring|shadow)-\[var\((--[a-z0-9-]+)\)\]/gi
  while ((match = tailwindTokenRegex.exec(fileContent)) !== null) {
    tokens.add(match[1])
  }

  // Validate each token
  for (const token of tokens) {
    const result = await validateToken(token, filePath)
    violations.push(...result.violations)
    warnings.push(...result.warnings)
  }

  return {
    valid: violations.length === 0,
    violations,
    warnings,
  }
}
