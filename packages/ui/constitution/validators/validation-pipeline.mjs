/**
 * Validation Pipeline
 *
 * Orchestrates all validators in the correct order.
 * Provides unified validation results for MCP servers.
 *
 * @module validation-pipeline
 */

import { loadConstitutionIndex } from '../load-constitution.mjs'
import { validateTokensInFile } from './token-validator.mjs'
import {
  validateRSCBoundaries,
  validateServerActions,
} from './rsc-validator.mjs'
import {
  validateComponent,
  detectComponentCategory,
} from './component-validator.mjs'
import { validateAccessibility } from './a11y-validator.mjs'
import { validateMotion } from './motion-validator.mjs'
import { validateVisual } from './visual-validator.mjs'
import fs from 'fs'
import path from 'path'

/**
 * Run validation pipeline from constitution-index.yml
 *
 * @param {string} indexPath - Path to constitution-index.yml
 * @param {Object} args - Validation arguments
 * @returns {Object} Validation results
 */
export async function runValidationPipeline(indexPath = null, args = {}) {
  const indexPathResolved =
    indexPath ||
    path.join(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      'constitution-index.yml'
    )

  const indexContent = fs.readFileSync(indexPathResolved, 'utf8')
  const yaml = await import('yaml')
  const index = yaml.parse(indexContent)

  const results = []
  const filePath = args.filePath || args.path
  const fileContent =
    args.code ||
    args.content ||
    (filePath ? fs.readFileSync(filePath, 'utf8') : null)

  if (!filePath && !fileContent) {
    throw new Error('Either filePath or fileContent must be provided')
  }

  // Run validators in pipeline order
  for (const step of index.pipeline) {
    const validatorPath = index.validators[step]

    if (!validatorPath) {
      console.warn(`⚠️  Validator not found for step: ${step}`)
      continue
    }

    try {
      // Import validator dynamically
      const validatorModule = await import(
        path.resolve(path.dirname(indexPathResolved), validatorPath)
      )

      // Get validation function (supports multiple naming conventions)
      const validateFn =
        validatorModule.validate ||
        validatorModule[
          `validate${step.charAt(0).toUpperCase() + step.slice(1)}`
        ] ||
        validatorModule.default

      if (!validateFn) {
        throw new Error(`Validator ${step} does not export a validate function`)
      }

      // Run validator
      const result = await validateFn(filePath, fileContent, args)

      results.push({
        step,
        validator: validatorPath,
        result,
      })

      // Stop on first failure if configured
      if (!result.valid && args.stopOnError !== false) {
        console.log(`❌ Validation failed at step: ${step}`)
        return {
          valid: false,
          results,
          failedAt: step,
        }
      }
    } catch (error) {
      console.error(`❌ Error in validator ${step}:`, error.message)
      results.push({
        step,
        validator: validatorPath,
        result: {
          valid: false,
          error: error.message,
        },
      })

      if (args.stopOnError !== false) {
        return {
          valid: false,
          results,
          failedAt: step,
          error: error.message,
        }
      }
    }
  }

  return {
    valid: results.every(r => r.result.valid !== false),
    results,
  }
}

/**
 * Run all validations on a file (backward compatibility)
 *
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content (optional, will read if not provided)
 * @param {Object} options - Validation options
 * @returns {Object} Unified validation results
 */
export async function runAllValidations(
  filePath,
  fileContent = null,
  options = {}
) {
  const {
    skipA11y = false,
    skipToken = false,
    skipRSC = false,
    skipComponent = false,
    skipMotion = false,
    skipVisual = false,
  } = options

  const index = loadConstitutionIndex()
  const results = {
    valid: true,
    violations: [],
    warnings: [],
    byValidator: {},
    summary: {
      token: { valid: true, violations: 0, warnings: 0 },
      rsc: { valid: true, violations: 0, warnings: 0 },
      component: { valid: true, violations: 0, warnings: 0 },
      a11y: { valid: true, violations: 0, warnings: 0 },
      motion: { valid: true, violations: 0, warnings: 0 },
      visual: { valid: true, violations: 0, warnings: 0 },
    },
  }

  // Priority A: Token Validation (must run first)
  if (!skipToken) {
    try {
      const tokenResult = await validateTokensInFile(filePath, fileContent)
      results.byValidator.token = tokenResult
      results.summary.token = {
        valid: tokenResult.valid,
        violations: tokenResult.violations.length,
        warnings: tokenResult.warnings.length,
      }
      results.violations.push(...tokenResult.violations)
      results.warnings.push(...tokenResult.warnings)
    } catch (error) {
      results.byValidator.token = {
        valid: false,
        error: error.message,
      }
      results.violations.push({
        rule: 'PIPELINE-001',
        type: 'token_validation_error',
        message: `Token validation failed: ${error.message}`,
        file: filePath,
      })
    }
  }

  // Priority B: RSC Validation (can run in parallel with component)
  if (!skipRSC) {
    try {
      const rscResult = await validateRSCBoundaries(filePath, fileContent)
      results.byValidator.rsc = rscResult
      results.summary.rsc = {
        valid: rscResult.valid,
        violations: rscResult.violations.length,
        warnings: rscResult.warnings.length,
      }
      results.violations.push(...rscResult.violations)
      results.warnings.push(...rscResult.warnings)

      // Also validate Server Actions if present
      const serverActionResult = validateServerActions(filePath, fileContent)
      if (!serverActionResult.valid) {
        results.byValidator.serverActions = serverActionResult
        results.violations.push(...serverActionResult.violations)
        results.summary.rsc.violations += serverActionResult.violations.length
      }
    } catch (error) {
      results.byValidator.rsc = {
        valid: false,
        error: error.message,
      }
      results.violations.push({
        rule: 'PIPELINE-002',
        type: 'rsc_validation_error',
        message: `RSC validation failed: ${error.message}`,
        file: filePath,
      })
    }
  }

  // Priority C: Component Validation (depends on token validation)
  if (!skipComponent) {
    try {
      const componentResult = await validateComponent(filePath, fileContent)
      results.byValidator.component = componentResult
      results.summary.component = {
        valid: componentResult.valid,
        violations: componentResult.violations.length,
        warnings: componentResult.warnings.length,
      }
      results.violations.push(...componentResult.violations)
      results.warnings.push(...componentResult.warnings)

      // Detect component category
      try {
        const category = detectComponentCategory(filePath, fileContent)
        results.byValidator.component.category = category
      } catch (error) {
        // Category detection is optional
      }
    } catch (error) {
      results.byValidator.component = {
        valid: false,
        error: error.message,
      }
      results.violations.push({
        rule: 'PIPELINE-003',
        type: 'component_validation_error',
        message: `Component validation failed: ${error.message}`,
        file: filePath,
      })
    }
  }

  // Priority D: A11y Validation (warnings only, doesn't block)
  if (!skipA11y) {
    try {
      const a11yResult = await validateAccessibility(filePath, fileContent)
      results.byValidator.a11y = a11yResult
      results.summary.a11y = {
        valid: a11yResult.valid,
        violations: a11yResult.violations.length,
        warnings: a11yResult.warnings.length,
      }
      // A11y violations are treated as warnings in the pipeline
      results.warnings.push(...a11yResult.violations)
      results.warnings.push(...a11yResult.warnings)
    } catch (error) {
      results.byValidator.a11y = {
        valid: false,
        error: error.message,
      }
      // A11y errors don't block the pipeline
      results.warnings.push({
        rule: 'PIPELINE-004',
        type: 'a11y_validation_error',
        message: `A11y validation failed: ${error.message}`,
        file: filePath,
      })
    }
  }

  // Priority E: Motion Validation
  if (!skipMotion) {
    try {
      const motionResult = await validateMotion(filePath, fileContent)
      results.byValidator.motion = motionResult
      results.summary.motion = {
        valid: motionResult.valid,
        violations: motionResult.violations.length,
        warnings: motionResult.warnings.length,
      }
      results.violations.push(...motionResult.violations)
      results.warnings.push(...motionResult.warnings)
    } catch (error) {
      results.byValidator.motion = {
        valid: false,
        error: error.message,
      }
      results.warnings.push({
        rule: 'PIPELINE-005',
        type: 'motion_validation_error',
        message: `Motion validation failed: ${error.message}`,
        file: filePath,
      })
    }
  }

  // Priority F: Visual Validation
  if (!skipVisual) {
    try {
      const visualResult = await validateVisual(filePath, fileContent, options)
      results.byValidator.visual = visualResult
      results.summary.visual = {
        valid: visualResult.valid,
        violations: visualResult.violations.length,
        warnings: visualResult.warnings.length,
      }
      results.violations.push(...visualResult.violations)
      results.warnings.push(...visualResult.warnings)
    } catch (error) {
      results.byValidator.visual = {
        valid: false,
        error: error.message,
      }
      results.warnings.push({
        rule: 'PIPELINE-006',
        type: 'visual_validation_error',
        message: `Visual validation failed: ${error.message}`,
        file: filePath,
      })
    }
  }

  // Determine overall validity
  // A11y violations don't block, but token, rsc, and component violations do
  const blockingViolations = results.violations.filter(
    v => !v.type?.includes('a11y')
  )
  results.valid = blockingViolations.length === 0

  // Add execution metadata
  results.metadata = {
    filePath,
    timestamp: new Date().toISOString(),
    validatorsRun: Object.keys(results.byValidator),
    executionOrder: index.pipeline || [],
    version: index.metadata?.version || '2.2.0',
  }

  return results
}

/**
 * Run validations in parallel where possible
 *
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content
 * @returns {Object} Validation results
 */
export async function runValidationsParallel(filePath, fileContent) {
  const index = loadConstitutionIndex()
  const parallelGroups = index.validationPipeline?.parallelExecution || []

  // Run token validation first (required)
  const tokenResult = await validateTokensInFile(filePath, fileContent)

  // Run RSC and component in parallel (they don't depend on each other)
  const [rscResult, componentResult] = await Promise.all([
    validateRSCBoundaries(filePath, fileContent),
    validateComponent(filePath, fileContent),
  ])

  // Run a11y last (warnings only)
  const a11yResult = await validateAccessibility(filePath, fileContent)

  return {
    valid: tokenResult.valid && rscResult.valid && componentResult.valid,
    violations: [
      ...tokenResult.violations,
      ...rscResult.violations,
      ...componentResult.violations,
    ],
    warnings: [
      ...tokenResult.warnings,
      ...rscResult.warnings,
      ...componentResult.warnings,
      ...a11yResult.violations, // A11y violations are warnings
      ...a11yResult.warnings,
    ],
    byValidator: {
      token: tokenResult,
      rsc: rscResult,
      component: componentResult,
      a11y: a11yResult,
    },
  }
}

/**
 * Format validation results for MCP response
 *
 * @param {Object} results - Validation results
 * @returns {Object} Formatted results
 */
export function formatValidationResults(results) {
  return {
    valid: results.valid,
    summary: {
      totalViolations: results.violations.length,
      totalWarnings: results.warnings.length,
      byCategory: {
        token: results.summary.token,
        rsc: results.summary.rsc,
        component: results.summary.component,
        a11y: results.summary.a11y,
      },
    },
    violations: results.violations.map(v => ({
      rule: v.rule,
      type: v.type,
      message: v.message,
      file: v.file,
      line: v.line,
      token: v.token,
    })),
    warnings: results.warnings.map(w => ({
      rule: w.rule,
      type: w.type,
      message: w.message,
      file: w.file,
      line: w.line,
    })),
    metadata: results.metadata,
  }
}
