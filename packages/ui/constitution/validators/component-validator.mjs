/**
 * Component Validator
 * 
 * Validates component structure against components.yml constitution.
 * Priority C - Depends on token validation.
 * 
 * @module component-validator
 */

import { loadConstitution } from "../load-constitution.mjs";
import { validateTokensInFile } from "./token-validator.mjs";
import {
  parseFile,
  hasForwardRef,
  hasDisplayName,
  getComponentName,
  extractImports,
} from "./utils/ast-tools.mjs";
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
  return await validateComponent(filePath, fileContent);
}

/**
 * Validate component structure
 * 
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content (optional)
 * @returns {Object} Validation result
 */
export async function validateComponent(filePath, fileContent = null) {
  const constitution = loadConstitution("components");
  const rules = constitution.constitution || constitution;
  const violations = [];
  const warnings = [];

  if (!fileContent) {
    fileContent = fs.readFileSync(filePath, "utf8");
  }

  const ast = parseFile(filePath, fileContent);

  // Structure validation
  const structureResult = validateComponentStructure(ast, rules, filePath);
  violations.push(...structureResult.violations);
  warnings.push(...structureResult.warnings);

  // Props validation
  const propsResult = validateProps(ast, rules, filePath);
  violations.push(...propsResult.violations);

  // Styling validation
  const stylingResult = await validateComponentStyling(filePath, fileContent, rules);
  violations.push(...stylingResult.violations);
  warnings.push(...stylingResult.warnings);

  // Token alias mapping validation
  const tokenMappingResult = validateTokenAliasMapping(ast, rules, filePath);
  violations.push(...tokenMappingResult.violations);

  // State machine validation (if required)
  const stateMachineResult = validateStateMachine(ast, rules, filePath);
  if (!stateMachineResult.valid) {
    warnings.push(...stateMachineResult.warnings);
  }

  return {
    valid: violations.length === 0,
    violations,
    warnings,
  };
}

/**
 * Validate component structure (forwardRef, displayName, etc.)
 */
function validateComponentStructure(ast, rules, filePath) {
  const violations = [];
  const warnings = [];
  const structureRules = rules.structure?.required || [];

  // Check forwardRef
  if (structureRules.includes("forwardRef for components that accept refs")) {
    // Simplified - in production, check if component accepts ref prop
    const hasRef = filePath.includes("ref") || 
                   ast.toString().includes("React.Ref");
    
    if (hasRef && !hasForwardRef(ast)) {
      violations.push({
        rule: "COMP-001",
        type: "missing_forwardRef",
        message: "Component accepts refs but does not use forwardRef",
        file: filePath,
      });
    }
  }

  // Check displayName
  if (structureRules.includes("displayName must be defined")) {
    if (!hasDisplayName(ast)) {
      warnings.push({
        rule: "COMP-002",
        type: "missing_displayName",
        message: "Component should define displayName for better debugging",
        file: filePath,
      });
    }
  }

  // Check TypeScript interfaces
  if (structureRules.includes("Props must use TypeScript interfaces")) {
    // Simplified check - in production, use AST to verify interface existence
    if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) {
      warnings.push({
        rule: "COMP-003",
        type: "no_typescript",
        message: "Component should use TypeScript for prop interfaces",
        file: filePath,
      });
    }
  }

  return { violations, warnings };
}

/**
 * Validate component props
 */
function validateProps(ast, rules, filePath) {
  const violations = [];
  const propsRules = rules.props || {};

  // Check for forbidden props
  const forbidden = propsRules.forbidden || [];
  const fileContent = JSON.stringify(ast);

  for (const forbiddenProp of forbidden) {
    if (forbiddenProp.includes("override design tokens")) {
      // Check for style overrides
      if (fileContent.includes("style={{") || fileContent.includes("className={")) {
        // This is a simplified check - in production, use AST to detect actual token overrides
        // For now, we'll just warn
      }
    }
  }

  return { violations };
}

/**
 * Validate component styling
 */
async function validateComponentStyling(filePath, fileContent, rules) {
  const violations = [];
  const warnings = [];

  // Validate token usage
  const tokenResult = await validateTokensInFile(filePath, fileContent);
  violations.push(...tokenResult.violations);
  warnings.push(...tokenResult.warnings);

  // Check for forbidden styling patterns
  const stylingRules = rules.styling || {};
  const forbidden = stylingRules.forbidden || [];

  for (const pattern of forbidden) {
    if (pattern.includes("hex colors") && /#[0-9a-fA-F]{3,6}/i.test(fileContent)) {
      violations.push({
        rule: "COMP-STYLE-001",
        type: "hex_color_usage",
        message: "Component uses hex colors (use tokens instead)",
        file: filePath,
      });
    }

    if (pattern.includes("tailwind palette colors")) {
      const paletteRegex = /(?:bg|text|border)-(?:red|blue|green|yellow|orange|purple|pink|gray)-\d+/g;
      if (paletteRegex.test(fileContent)) {
        violations.push({
          rule: "COMP-STYLE-002",
          type: "palette_color_usage",
          message: "Component uses Tailwind palette colors (use tokens instead)",
          file: filePath,
        });
      }
    }

    if (pattern.includes("raw z-index")) {
      const zIndexRegex = /z-\[?\d+\]?/g;
      if (zIndexRegex.test(fileContent)) {
        violations.push({
          rule: "COMP-STYLE-003",
          type: "raw_zindex",
          message: "Component uses raw z-index (use layer tokens instead)",
          file: filePath,
        });
      }
    }
  }

  return { violations, warnings };
}

/**
 * Validate token alias mapping
 */
function validateTokenAliasMapping(ast, rules, filePath) {
  const violations = [];
  const tokenMapping = rules.styling?.token_alias_mapping;

  if (!tokenMapping) {
    return { violations: [] };
  }

  // Simplified validation - in production, use AST to extract variant/size props
  // and verify they map to correct tokens
  const fileContent = JSON.stringify(ast);

  // Check if variant props are used
  if (fileContent.includes("variant=")) {
    // Verify variant maps to semantic tokens
    const variantMapping = tokenMapping.variant || {};
    const variants = Object.keys(variantMapping);

    // This is a placeholder - in production, extract actual variant values
    // and verify they exist in the mapping
  }

  return { violations };
}

/**
 * Validate state machine requirements
 */
function validateStateMachine(ast, rules, filePath) {
  const warnings = [];
  const stateMachineRules = rules.structure?.state_machines;

  if (!stateMachineRules) {
    return { valid: true, warnings: [] };
  }

  const requiredFor = stateMachineRules.required_for || [];
  const fileName = filePath.split("/").pop().toLowerCase();

  // Check if component type requires state machine
  for (const componentType of requiredFor) {
    if (fileName.includes(componentType.toLowerCase())) {
      // Check if state machine is used (simplified)
      const fileContent = JSON.stringify(ast);
      const hasStateMachine = fileContent.includes("xstate") || 
                             fileContent.includes("useReducer") ||
                             fileContent.includes("stateMachine");

      if (!hasStateMachine) {
        warnings.push({
          rule: "COMP-STATE-001",
          type: "missing_state_machine",
          message: `Component ${fileName} should use state machine (${componentType})`,
          file: filePath,
        });
      }
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Detect component category (primitive, composition, functional, layout)
 */
export function detectComponentCategory(filePath, fileContent) {
  const imports = extractImports(parseFile(filePath, fileContent));
  const hasRadix = imports.some(imp => imp.source.startsWith("@radix-ui/"));
  const hasTanStack = imports.some(imp => imp.source.includes("tanstack"));
  const hasRecharts = imports.some(imp => imp.source.includes("recharts") || imp.source.includes("visx"));

  if (hasRadix) {
    return "composition";
  }

  if (hasTanStack || hasRecharts) {
    return "functional";
  }

  // Check file path for layout indicators
  if (filePath.includes("layout") || filePath.includes("shell") || 
      filePath.includes("header") || filePath.includes("sidebar")) {
    return "layout";
  }

  return "primitive";
}

