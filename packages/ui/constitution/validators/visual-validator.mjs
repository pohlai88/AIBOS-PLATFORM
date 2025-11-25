/**
 * Visual Validator
 *
 * Validates visual regression compliance against components.yml constitution.
 * Ensures snapshot baselines, visual diff thresholds, and auto-rollback rules.
 *
 * @module visual-validator
 */

import { loadConstitution } from '../load-constitution.mjs'
import fs from 'fs'
import path from 'path'

/**
 * Main validate function (for pipeline compatibility)
 *
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export async function validate(filePath, fileContent, options = {}) {
  return await validateVisual(filePath, fileContent, options)
}

/**
 * Validate visual regression requirements
 *
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content (optional)
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export async function validateVisual(
  filePath,
  fileContent = null,
  options = {}
) {
  const constitution = loadConstitution('components')
  const rules = constitution.constitution || constitution
  const violations = []
  const warnings = []

  if (!fileContent) {
    fileContent = fs.readFileSync(filePath, 'utf8')
  }

  const visualRules = rules.visual_regression || {}

  // Snapshot baseline validation
  const snapshotResult = validateSnapshotBaseline(
    filePath,
    visualRules,
    options
  )
  violations.push(...snapshotResult.violations)
  warnings.push(...snapshotResult.warnings)

  // Visual diff threshold validation
  const diffResult = validateVisualDiff(filePath, visualRules, options)
  violations.push(...diffResult.violations)
  warnings.push(...diffResult.warnings)

  // Auto-rollback validation
  const rollbackResult = validateAutoRollback(filePath, visualRules, options)
  warnings.push(...rollbackResult.warnings)

  return {
    valid: violations.length === 0,
    violations,
    warnings,
  }
}

/**
 * Validate snapshot baseline requirements
 */
function validateSnapshotBaseline(filePath, rules, options) {
  const violations = []
  const warnings = []
  const required = rules.required || []

  // Check if snapshot directory exists
  const snapshotDir =
    options.snapshotDir || path.join(path.dirname(filePath), '__snapshots__')

  const componentName = path.basename(filePath, path.extname(filePath))
  const snapshotFile = path.join(snapshotDir, `${componentName}.snap`)

  // Check for snapshot baseline
  if (required.includes('Snapshot baseline for all components')) {
    if (!fs.existsSync(snapshotFile)) {
      violations.push({
        rule: 'VISUAL-001',
        type: 'missing_snapshot_baseline',
        message: `Component ${componentName} is missing snapshot baseline`,
        file: filePath,
        snapshotFile,
      })
    }
  }

  // Check for variant snapshots
  if (required.includes('Snapshot of all variants')) {
    // Check if component has variants
    const hasVariants =
      fileContent.includes('variant=') ||
      fileContent.includes('variants') ||
      fileContent.includes('variant:')

    if (hasVariants) {
      // Check for variant-specific snapshots
      const variantSnapshotPattern = path.join(
        snapshotDir,
        `${componentName}.*.snap`
      )
      // Simplified check - in production, use glob to find variant snapshots
      warnings.push({
        rule: 'VISUAL-002',
        type: 'variant_snapshots_recommended',
        message: `Component with variants should have snapshots for each variant`,
        file: filePath,
      })
    }
  }

  // Check for safe mode snapshot
  if (required.includes('Snapshot of safe mode')) {
    const safeModeSnapshot = path.join(
      snapshotDir,
      `${componentName}.safe-mode.snap`
    )
    if (!fs.existsSync(safeModeSnapshot)) {
      warnings.push({
        rule: 'VISUAL-003',
        type: 'missing_safe_mode_snapshot',
        message: `Component should have snapshot for safe mode state`,
        file: filePath,
      })
    }
  }

  // Check for reduced motion snapshot
  if (required.includes('Snapshot of reduced motion')) {
    const reducedMotionSnapshot = path.join(
      snapshotDir,
      `${componentName}.reduced-motion.snap`
    )
    if (!fs.existsSync(reducedMotionSnapshot)) {
      warnings.push({
        rule: 'VISUAL-004',
        type: 'missing_reduced_motion_snapshot',
        message: `Component should have snapshot for reduced motion state`,
        file: filePath,
      })
    }
  }

  return { violations, warnings }
}

/**
 * Validate visual diff thresholds
 */
function validateVisualDiff(filePath, rules, options) {
  const violations = []
  const warnings = []

  // This would typically compare current visual state with baseline
  // For now, we'll just check if diff tooling is configured
  const mcpTools = rules.mcp_tools || []

  if (mcpTools.includes('mcp_visual_regression_compare')) {
    // Check if visual diff has been run
    if (options.visualDiff && options.visualDiff.diff > 0) {
      const threshold = options.visualDiff.threshold || 0.1 // 10% default
      const diff = options.visualDiff.diff

      if (diff > threshold) {
        violations.push({
          rule: 'VISUAL-005',
          type: 'visual_diff_exceeds_threshold',
          message: `Visual diff ${(diff * 100).toFixed(2)}% exceeds threshold ${(threshold * 100).toFixed(2)}%`,
          file: filePath,
          diff,
          threshold,
        })
      } else if (diff > threshold * 0.5) {
        warnings.push({
          rule: 'VISUAL-006',
          type: 'visual_diff_warning',
          message: `Visual diff ${(diff * 100).toFixed(2)}% is approaching threshold`,
          file: filePath,
          diff,
          threshold,
        })
      }
    }
  }

  return { violations, warnings }
}

/**
 * Validate auto-rollback rules
 */
function validateAutoRollback(filePath, rules, options) {
  const warnings = []
  const rollbackRules = rules.auto_rollback || {}

  if (rollbackRules.rules) {
    // Check if rollback is configured
    if (options.visualDiff && options.visualDiff.diff > 0) {
      const threshold = options.visualDiff.threshold || 0.1
      const diff = options.visualDiff.diff

      if (
        diff > threshold &&
        rollbackRules.rules.includes('Rollback on unacceptable deviation')
      ) {
        warnings.push({
          rule: 'VISUAL-007',
          type: 'rollback_triggered',
          message: `Visual diff exceeds threshold, auto-rollback should be triggered`,
          file: filePath,
          diff,
          threshold,
        })
      }
    }

    // Check for per-component threshold configuration
    if (rollbackRules.rules.includes('Threshold defined per component')) {
      // In production, check if component has custom threshold
      warnings.push({
        rule: 'VISUAL-008',
        type: 'custom_threshold_recommended',
        message: `Component should have custom visual diff threshold if needed`,
        file: filePath,
      })
    }
  }

  return { warnings }
}

/**
 * Capture visual snapshot (placeholder for MCP integration)
 *
 * @param {string} filePath - Component file path
 * @param {Object} options - Snapshot options
 * @returns {Object} Snapshot result
 */
export async function captureSnapshot(filePath, options = {}) {
  // This would integrate with MCP visual regression tools
  // For now, return placeholder
  return {
    success: true,
    message:
      'Snapshot capture should be done via mcp_visual_regression_capture',
    filePath,
  }
}

/**
 * Compare visual snapshot (placeholder for MCP integration)
 *
 * @param {string} filePath - Component file path
 * @param {Object} options - Comparison options
 * @returns {Object} Comparison result
 */
export async function compareSnapshot(filePath, options = {}) {
  // This would integrate with MCP visual regression tools
  // For now, return placeholder
  return {
    success: true,
    message:
      'Snapshot comparison should be done via mcp_visual_regression_compare',
    filePath,
    diff: 0,
    threshold: options.threshold || 0.1,
  }
}
