/**
 * A11y Validator
 * 
 * Validates accessibility compliance against components.yml and a11y guidelines.
 * Priority D - Warnings only, doesn't block.
 * 
 * @module a11y-validator
 */

import { loadConstitution } from "./load-constitution.mjs";
import { validateTokensInFile } from "./token-validator.mjs";
import { parseFile, extractImports } from "./utils/ast-tools.mjs";
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
  return await validateAccessibility(filePath, fileContent);
}

/**
 * Validate accessibility compliance
 * 
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content (optional)
 * @returns {Object} Validation result
 */
export async function validateAccessibility(filePath, fileContent = null) {
  const constitution = loadConstitution("components");
  const rules = constitution.constitution || constitution;
  const violations = [];
  const warnings = [];

  if (!fileContent) {
    fileContent = fs.readFileSync(filePath, "utf8");
  }

  const ast = parseFile(filePath, fileContent);
  const a11yRules = rules.accessibility || {};

  // Keyboard navigation validation
  const keyboardResult = validateKeyboardNavigation(filePath, fileContent, a11yRules);
  warnings.push(...keyboardResult.warnings);

  // ARIA attributes validation
  const ariaResult = validateARIAAttributes(filePath, fileContent, a11yRules);
  violations.push(...ariaResult.violations);
  warnings.push(...ariaResult.warnings);

  // Contrast validation
  const contrastResult = await validateContrast(filePath, fileContent, a11yRules);
  warnings.push(...contrastResult.warnings);

  // Focus management validation
  const focusResult = validateFocusManagement(filePath, fileContent, a11yRules);
  violations.push(...focusResult.violations);
  warnings.push(...focusResult.warnings);

  // Touch target validation
  const touchTargetResult = validateTouchTargets(filePath, fileContent, a11yRules);
  warnings.push(...touchTargetResult.warnings);

  // Typography WCAG validation
  const typographyResult = validateTypographyWCAG(filePath, fileContent, a11yRules);
  warnings.push(...typographyResult.warnings);

  return {
    valid: violations.length === 0,
    violations,
    warnings,
  };
}

/**
 * Validate keyboard navigation
 */
function validateKeyboardNavigation(filePath, fileContent, rules) {
  const warnings = [];
  const keyboardRules = rules.keyboard || [];

  // Check for interactive elements
  const hasInteractive = fileContent.includes("onClick") || 
                        fileContent.includes("onChange") ||
                        fileContent.includes("button") ||
                        fileContent.includes("input");

  if (hasInteractive) {
    // Check for keyboard handlers
    const hasKeyboardHandlers = fileContent.includes("onKeyDown") ||
                                fileContent.includes("onKeyPress") ||
                                fileContent.includes("onKeyUp");

    if (!hasKeyboardHandlers && fileContent.includes("onClick")) {
      warnings.push({
        rule: "A11Y-KEY-001",
        type: "missing_keyboard_handler",
        message: "Interactive element should have keyboard handlers",
        file: filePath,
      });
    }

    // Check for Escape key handling in modals/dialogs
    if (fileContent.includes("Dialog") || fileContent.includes("Modal")) {
      if (!fileContent.includes("Escape") && !fileContent.includes("Escape")) {
        warnings.push({
          rule: "A11Y-KEY-002",
          type: "missing_escape_handler",
          message: "Modal/Dialog should handle Escape key",
          file: filePath,
        });
      }
    }
  }

  return { warnings };
}

/**
 * Validate ARIA attributes
 */
function validateARIAAttributes(filePath, fileContent, rules) {
  const violations = [];
  const warnings = [];
  const ariaRules = rules.aria || [];

  // Check for icon-only buttons
  if (fileContent.includes("IconButton") || 
      (fileContent.includes("button") && fileContent.includes("icon") && 
       !fileContent.includes("aria-label"))) {
    violations.push({
      rule: "A11Y-ARIA-001",
      type: "missing_aria_label",
      message: "Icon-only button must have aria-label",
      file: filePath,
    });
  }

  // Check for form inputs
  if (fileContent.includes("<input") || fileContent.includes("Input")) {
    const hasLabel = fileContent.includes("<label") || 
                    fileContent.includes("Label") ||
                    fileContent.includes("aria-labelledby") ||
                    fileContent.includes("aria-label");

    if (!hasLabel) {
      violations.push({
        rule: "A11Y-ARIA-002",
        type: "missing_input_label",
        message: "Form input must have associated label",
        file: filePath,
      });
    }
  }

  // Check for images
  if (fileContent.includes("<img") || fileContent.includes("Image")) {
    const hasAlt = fileContent.includes("alt=") || 
                   fileContent.includes('alt="') ||
                   fileContent.includes("alt={");

    if (!hasAlt) {
      violations.push({
        rule: "A11Y-ARIA-003",
        type: "missing_alt_text",
        message: "Image must have alt text",
        file: filePath,
      });
    }
  }

  // Check for error states
  if (fileContent.includes("error") || fileContent.includes("invalid")) {
    const hasAriaInvalid = fileContent.includes("aria-invalid");

    if (!hasAriaInvalid) {
      warnings.push({
        rule: "A11Y-ARIA-004",
        type: "missing_aria_invalid",
        message: "Error state should use aria-invalid",
        file: filePath,
      });
    }
  }

  return { violations, warnings };
}

/**
 * Validate contrast compliance
 */
async function validateContrast(filePath, fileContent, rules) {
  const warnings = [];
  const contrastRules = rules.contrast || {};

  // Validate token usage for contrast
  const tokenResult = await validateTokensInFile(filePath, fileContent);
  
  // Check if color tokens are used (they should be WCAG compliant)
  const hasColorTokens = /var\(--color-[^)]+\)/g.test(fileContent);

  if (hasColorTokens) {
    // Token validator will check contrast, but we can add additional warnings here
    warnings.push({
      rule: "A11Y-CONTRAST-001",
      type: "contrast_validation_required",
      message: "Color tokens should be validated for WCAG AA (4.5:1) or AAA (7:1) contrast",
      file: filePath,
    });
  }

  return { warnings };
}

/**
 * Validate focus management
 */
function validateFocusManagement(filePath, fileContent, rules) {
  const violations = [];
  const warnings = [];
  const focusRules = rules.focus || [];

  // Check for modals/dialogs
  if (fileContent.includes("Dialog") || fileContent.includes("Modal")) {
    // Check for focus trap
    const hasFocusTrap = fileContent.includes("focus-trap") ||
                        fileContent.includes("FocusTrap") ||
                        fileContent.includes("trapFocus");

    if (!hasFocusTrap) {
      violations.push({
        rule: "A11Y-FOCUS-001",
        type: "missing_focus_trap",
        message: "Modal/Dialog must trap focus",
        file: filePath,
      });
    }

    // Check for focus restoration
    const hasFocusRestore = fileContent.includes("restoreFocus") ||
                           fileContent.includes("onClose") ||
                           fileContent.includes("onEscapeKeyDown");

    if (!hasFocusRestore) {
      warnings.push({
        rule: "A11Y-FOCUS-002",
        type: "missing_focus_restore",
        message: "Modal/Dialog should restore focus on close",
        file: filePath,
      });
    }
  }

  // Check for focus ring tokens
  if (fileContent.includes("focus") && !fileContent.includes("focus-ring")) {
    warnings.push({
      rule: "A11Y-FOCUS-003",
      type: "missing_focus_ring_token",
      message: "Interactive elements should use focus ring tokens",
      file: filePath,
    });
  }

  return { violations, warnings };
}

/**
 * Validate touch targets
 */
function validateTouchTargets(filePath, fileContent, rules) {
  const warnings = [];
  const touchTargetRules = rules.touchTargets || [];

  // Check for interactive elements
  if (fileContent.includes("button") || fileContent.includes("Button")) {
    // Check for minimum size (44px)
    // This is a simplified check - in production, use CSS parsing
    const hasMinSize = fileContent.includes("min-h-11") || // 44px in Tailwind
                      fileContent.includes("min-h-[44px]") ||
                      fileContent.includes("h-11");

    if (!hasMinSize) {
      warnings.push({
        rule: "A11Y-TOUCH-001",
        type: "touch_target_size",
        message: "Interactive elements should have minimum 44px × 44px touch target",
        file: filePath,
      });
    }
  }

  return { warnings };
}

/**
 * Validate typography WCAG compliance
 */
function validateTypographyWCAG(filePath, fileContent, rules) {
  const warnings = [];
  const typographyRules = rules.typography || {};

  // Check for body text
  if (fileContent.includes("body") || fileContent.includes("Body")) {
    const aaRules = typographyRules.aa || [];
    const aaaRules = typographyRules.aaa || [];

    // Simplified check - in production, use CSS parsing to verify font sizes
    warnings.push({
      rule: "A11Y-TYPE-001",
      type: "typography_wcag_validation",
      message: "Body text should meet WCAG AA (14px) or AAA (18px) minimum",
      file: filePath,
    });
  }

  return { warnings };
}

