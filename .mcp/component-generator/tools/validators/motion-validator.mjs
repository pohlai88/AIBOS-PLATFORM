/**
 * Motion Validator
 * 
 * Validates motion and animation compliance against components.yml constitution.
 * Ensures reduced motion support, animation budgets, and token usage.
 * 
 * @module motion-validator
 */

import { loadConstitution } from "./load-constitution.mjs";
import { parseFile } from "./utils/ast-tools.mjs";
import fs from "fs";

/**
 * Main validate function (for pipeline compatibility)
 * 
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export async function validate(filePath, fileContent, options = {}) {
  return await validateMotion(filePath, fileContent);
}

/**
 * Validate motion and animation compliance
 * 
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content (optional)
 * @returns {Object} Validation result
 */
export async function validateMotion(filePath, fileContent = null) {
  const constitution = loadConstitution("components");
  const rules = constitution.constitution || constitution;
  const violations = [];
  const warnings = [];

  if (!fileContent) {
    fileContent = fs.readFileSync(filePath, "utf8");
  }

  const motionRules = rules.motion || {};

  // Animation budget validation
  const budgetResult = validateAnimationBudget(filePath, fileContent, motionRules);
  violations.push(...budgetResult.violations);
  warnings.push(...budgetResult.warnings);

  // Reduced motion validation
  const reducedMotionResult = validateReducedMotion(filePath, fileContent, motionRules);
  violations.push(...reducedMotionResult.violations);
  warnings.push(...reducedMotionResult.warnings);

  // Motion token usage validation
  const tokenResult = validateMotionTokens(filePath, fileContent, motionRules);
  violations.push(...tokenResult.violations);
  warnings.push(...tokenResult.warnings);

  // Async animation guardrails
  const guardrailsResult = validateAnimationGuardrails(filePath, fileContent, motionRules);
  violations.push(...guardrailsResult.violations);
  warnings.push(...guardrailsResult.warnings);

  return {
    valid: violations.length === 0,
    violations,
    warnings,
  };
}

/**
 * Validate animation budget limits
 */
function validateAnimationBudget(filePath, fileContent, rules) {
  const violations = [];
  const warnings = [];
  const budget = rules.animation_budget || {};
  const limits = budget.limits || {};

  // Extract animation durations from code
  const durationRegex = /(?:duration|transition|animation)[:\s]+([0-9]+)ms/gi;
  const durations = [];
  let match;

  while ((match = durationRegex.exec(fileContent)) !== null) {
    durations.push(parseInt(match[1], 10));
  }

  // Check against limits
  for (const duration of durations) {
    if (duration > parseInt(limits.max_complex_duration || 1000, 10)) {
      violations.push({
        rule: "MOTION-001",
        type: "exceeds_max_duration",
        message: `Animation duration ${duration}ms exceeds maximum ${limits.max_complex_duration}ms`,
        file: filePath,
        duration,
      });
    } else if (duration > parseInt(limits.max_component_duration || 500, 10)) {
      warnings.push({
        rule: "MOTION-002",
        type: "long_duration_warning",
        message: `Animation duration ${duration}ms is long, consider reducing`,
        file: filePath,
        duration,
      });
    }
  }

  // Check concurrent animations (simplified - count animation declarations)
  const animationCount = (fileContent.match(/(?:animation|transition):/gi) || []).length;
  const maxConcurrent = limits.concurrent_animations || 2;

  if (animationCount > maxConcurrent) {
    warnings.push({
      rule: "MOTION-003",
      type: "too_many_animations",
      message: `Component has ${animationCount} animations, limit is ${maxConcurrent}`,
      file: filePath,
      count: animationCount,
    });
  }

  return { violations, warnings };
}

/**
 * Validate reduced motion support
 */
function validateReducedMotion(filePath, fileContent, rules) {
  const violations = [];
  const warnings = [];
  const reducedMotionRules = rules.reduced_motion || [];

  // Check for prefers-reduced-motion media query
  const hasReducedMotion = fileContent.includes("prefers-reduced-motion") ||
                          fileContent.includes("@media (prefers-reduced-motion)") ||
                          fileContent.includes("matchMedia('prefers-reduced-motion')");

  // Check if component has animations
  const hasAnimations = fileContent.includes("animation:") ||
                       fileContent.includes("transition:") ||
                       fileContent.includes("animate") ||
                       fileContent.includes("AnimatePresence");

  if (hasAnimations && !hasReducedMotion) {
    violations.push({
      rule: "MOTION-004",
      type: "missing_reduced_motion",
      message: "Component has animations but does not respect prefers-reduced-motion",
      file: filePath,
    });
  }

  // Check for essential vs non-essential animations
  if (hasAnimations) {
    // Essential animations (focus indicators) should remain
    const hasFocusAnimations = fileContent.includes("focus") && 
                              (fileContent.includes("ring") || fileContent.includes("outline"));

    if (!hasFocusAnimations && !hasReducedMotion) {
      warnings.push({
        rule: "MOTION-005",
        type: "non_essential_animations",
        message: "Non-essential animations should be disabled in reduced motion mode",
        file: filePath,
      });
    }
  }

  return { violations, warnings };
}

/**
 * Validate motion token usage
 */
function validateMotionTokens(filePath, fileContent, rules) {
  const violations = [];
  const warnings = [];

  // Check for raw animation durations
  const rawDurationRegex = /(?:duration|transition|animation)[:\s]+([0-9]+)ms/gi;
  const rawDurations = [];
  let match;

  while ((match = rawDurationRegex.exec(fileContent)) !== null) {
    rawDurations.push(match[0]);
  }

  // Check if motion tokens are used
  const hasMotionTokens = fileContent.includes("--motion-duration-") ||
                         fileContent.includes("--motion-ease-") ||
                         fileContent.includes("motionTokens");

  if (rawDurations.length > 0 && !hasMotionTokens) {
    violations.push({
      rule: "MOTION-006",
      type: "raw_duration_usage",
      message: `Component uses raw animation durations (${rawDurations.join(", ")}) instead of motion tokens`,
      file: filePath,
      rawDurations,
    });
  }

  // Check for raw easing functions
  const rawEasingRegex = /cubic-bezier\([^)]+\)/gi;
  const rawEasings = fileContent.match(rawEasingRegex) || [];

  if (rawEasings.length > 0 && !hasMotionTokens) {
    violations.push({
      rule: "MOTION-007",
      type: "raw_easing_usage",
      message: `Component uses raw easing functions instead of motion tokens`,
      file: filePath,
      rawEasings,
    });
  }

  return { violations, warnings };
}

/**
 * Validate animation guardrails
 */
function validateAnimationGuardrails(filePath, fileContent, rules) {
  const violations = [];
  const warnings = [];
  const guardrails = rules.async_animation_guardrails || {};

  const required = guardrails.required || [];
  const forbidden = guardrails.forbidden || [];

  // Check for forbidden animation patterns
  for (const pattern of forbidden) {
    if (pattern.includes("top/left/width/height")) {
      const layoutProps = /(?:top|left|right|bottom|width|height)[:\s]+/gi;
      if (layoutProps.test(fileContent)) {
        violations.push({
          rule: "MOTION-008",
          type: "animating_layout_properties",
          message: "Animating layout properties (top/left/width/height) causes performance issues. Use transform instead.",
          file: filePath,
        });
      }
    }

    if (pattern.includes("blocking animations")) {
      // Check for animations without will-change
      const hasAnimations = fileContent.includes("animation:") || fileContent.includes("transition:");
      const hasWillChange = fileContent.includes("will-change");

      if (hasAnimations && !hasWillChange) {
        warnings.push({
          rule: "MOTION-009",
          type: "missing_will_change",
          message: "Animations should use will-change for better performance",
          file: filePath,
        });
      }
    }
  }

  // Check for required patterns
  if (required.includes("Use requestAnimationFrame")) {
    const hasRAF = fileContent.includes("requestAnimationFrame") ||
                  fileContent.includes("useFrame") ||
                  fileContent.includes("framer-motion"); // framer-motion uses RAF internally

    if (fileContent.includes("setTimeout") && fileContent.includes("animation")) {
      warnings.push({
        rule: "MOTION-010",
        type: "setTimeout_for_animation",
        message: "Use requestAnimationFrame instead of setTimeout for animations",
        file: filePath,
      });
    }
  }

  if (required.includes("Use transform instead of layout properties")) {
    const hasTransform = fileContent.includes("transform:") ||
                        fileContent.includes("translate") ||
                        fileContent.includes("scale") ||
                        fileContent.includes("rotate");

    const hasLayoutAnimation = /(?:top|left|right|bottom|width|height)[:\s]+(?:var|calc)/gi.test(fileContent);

    if (hasLayoutAnimation && !hasTransform) {
      violations.push({
        rule: "MOTION-011",
        type: "layout_animation_without_transform",
        message: "Layout animations should use transform for GPU acceleration",
        file: filePath,
      });
    }
  }

  return { violations, warnings };
}

