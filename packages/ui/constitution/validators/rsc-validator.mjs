/**
 * RSC Validator
 * 
 * Validates React Server Component boundaries against rsc.yml constitution.
 * Priority B - Critical for Next.js safety.
 * 
 * @module rsc-validator
 */

import { loadConstitution } from "../load-constitution.mjs";
import { checkImportChain } from "./utils/import-tracer.mjs";
import {
  parseFile,
  hasUseClientDirective,
  checkForbiddenGlobals,
  checkForbiddenHooks,
  extractImports,
  importsRadixUI,
  isAsyncComponent,
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
  return await validateRSCBoundaries(filePath, fileContent);
}

/**
 * Validate RSC boundaries in a file
 * 
 * @param {string} filePath - File to validate
 * @param {string} fileContent - File content (optional, will read if not provided)
 * @returns {Object} Validation result
 */
export async function validateRSCBoundaries(filePath, fileContent = null) {
  const constitution = loadConstitution("rsc");
  const rules = constitution.constitution || constitution;
  const violations = [];
  const warnings = [];

  if (!fileContent) {
    fileContent = fs.readFileSync(filePath, "utf8");
  }

  const isClientComponent = hasUseClientDirective(fileContent);
  const ast = parseFile(filePath, fileContent);

  // Server Component Validation
  if (!isClientComponent) {
    // Check for forbidden browser globals
    const forbiddenGlobals = rules.server?.forbidden?.browser_globals || [];
    const globalViolations = checkForbiddenGlobals(ast, forbiddenGlobals);
    violations.push(...globalViolations.map(v => ({
      rule: "RSC-003",
      type: "server_component_browser_api",
      message: `Server component uses forbidden browser API: ${v.name}`,
      file: filePath,
      line: v.line,
    })));

    // Check for forbidden hooks
    const forbiddenHooks = rules.server?.forbidden?.hooks || [];
    const hookViolations = checkForbiddenHooks(ast, forbiddenHooks);
    violations.push(...hookViolations.map(v => ({
      rule: "RSC-002",
      type: "server_component_client_hook",
      message: `Server component uses forbidden hook: ${v.name}`,
      file: filePath,
      line: v.line,
    })));

    // Check for Radix UI imports
    if (importsRadixUI(ast)) {
      violations.push({
        rule: "RSC-006",
        type: "server_component_radix_import",
        message: "Server component imports Radix UI (client-only)",
        file: filePath,
      });
    }

    // Check for forbidden imports
    const forbiddenImports = rules.server?.forbidden?.imports || [];
    const imports = extractImports(ast);
    for (const imp of imports) {
      for (const forbidden of forbiddenImports) {
        if (imp.source.includes(forbidden.replace("@radix-ui/react-", ""))) {
          violations.push({
            rule: "RSC-006",
            type: "server_component_forbidden_import",
            message: `Server component imports forbidden: ${imp.source}`,
            file: filePath,
            line: imp.line,
          });
        }
      }
    }

    // Check for hydration
    if (fileContent.includes("ReactDOM.render") || 
        fileContent.includes("ReactDOM.hydrateRoot")) {
      violations.push({
        rule: "RSC-006",
        type: "server_component_hydration",
        message: "Server component contains hydration calls",
        file: filePath,
      });
    }

    // Check for async side effects
    if (isAsyncComponent(ast)) {
      const sideEffectResult = validateAsyncSideEffects(ast, rules);
      if (!sideEffectResult.valid) {
        violations.push(...sideEffectResult.violations);
      }
    }

    // Validate import chain
    const importChainResult = checkImportChain(filePath, constitution);
    if (!importChainResult.valid) {
      violations.push(...importChainResult.violations.map(v => ({
        rule: "RSC-006",
        type: "server_component_transitive_violation",
        message: `Transitive import violation: ${v.type}`,
        file: v.file || filePath,
        line: v.line,
      })));
    }

    // Check styling rules
    const stylingResult = validateServerComponentStyling(fileContent, rules);
    if (!stylingResult.valid) {
      violations.push(...stylingResult.violations);
    }
  }

  // Client Component Validation
  if (isClientComponent) {
    // Check that 'use client' is at the top
    if (!fileContent.trim().startsWith("'use client'") && 
        !fileContent.trim().startsWith('"use client"')) {
      violations.push({
        rule: "RSC-001",
        type: "client_component_missing_directive",
        message: "'use client' directive must be at the first line",
        file: filePath,
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    warnings,
  };
}

/**
 * Validate async server component side effects
 */
function validateAsyncSideEffects(ast, rules) {
  const violations = [];
  const sideEffectGuard = rules.async_server_components?.side_effect_guard;
  
  if (!sideEffectGuard) {
    return { valid: true, violations: [] };
  }

  const forbidden = sideEffectGuard.forbidden || [];
  const allowed = sideEffectGuard.allowed || [];

  // Simplified check - in production, use more sophisticated AST analysis
  // This checks for common side effect patterns
  const fileContent = JSON.stringify(ast);
  
  for (const pattern of forbidden) {
    if (pattern.includes("logging") && fileContent.includes("console.log")) {
      violations.push({
        rule: "RSC-006",
        type: "async_component_side_effect",
        message: "Async component contains forbidden side effect: logging",
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Validate server component styling rules
 */
function validateServerComponentStyling(fileContent, rules) {
  const violations = [];
  const stylingRules = rules.styling?.server_components;

  if (!stylingRules) {
    return { valid: true, violations: [] };
  }

  const forbidden = stylingRules.forbidden || [];

  // Check for inline styles with dynamic values
  if (forbidden.includes("inline styles (dynamic)")) {
    const dynamicStyleRegex = /style=\{\{[^}]+\}\}/g;
    if (dynamicStyleRegex.test(fileContent)) {
      violations.push({
        rule: "RSC-001",
        type: "server_component_dynamic_style",
        message: "Server component uses dynamic inline styles (use CSS variables instead)",
      });
    }
  }

  // Check for hex colors
  if (forbidden.includes("hex colors") || fileContent.includes("#")) {
    const hexColorRegex = /#[0-9a-fA-F]{3,6}/g;
    if (hexColorRegex.test(fileContent)) {
      violations.push({
        rule: "RSC-001",
        type: "server_component_hex_color",
        message: "Server component uses hex colors (use CSS variables instead)",
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Validate Server Actions input validation
 */
export function validateServerActions(filePath, fileContent) {
  const constitution = loadConstitution("rsc");
  const rules = constitution.constitution || constitution;
  const violations = [];

  const serverActionRules = rules.server_actions?.input_validation;
  if (!serverActionRules) {
    return { valid: true, violations: [] };
  }

  // Check for Server Actions (simplified - in production, use AST)
  const serverActionRegex = /(?:async\s+)?function\s+\w+Action|"use server"/gi;
  if (serverActionRegex.test(fileContent)) {
    // Check if zod or similar validation is used
    const hasZod = fileContent.includes("zod") || 
                   fileContent.includes("z.object") ||
                   fileContent.includes("schema.parse");

    if (!hasZod) {
      violations.push({
        rule: "RSC-006",
        type: "server_action_validation_failure",
        message: "Server Action missing input validation (zod schema required)",
        file: filePath,
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

