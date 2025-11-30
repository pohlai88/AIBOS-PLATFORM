#!/usr/bin/env node
/**
 * globals.css Validation Script
 * Validates globals.css against GRCD-GLOBALS-CSS.md requirements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GLOBALS_CSS_PATH = path.resolve(__dirname, 'src/design/tokens/globals.css');
const GRCD_PATH = path.resolve(__dirname, 'GRCD-GLOBALS-CSS.md');

// Validation results
const results = {
  passed: [],
  warnings: [],
  errors: [],
};

function validate() {
  console.log('🔍 Validating globals.css against GRCD-GLOBALS-CSS.md...\n');

  if (!fs.existsSync(GLOBALS_CSS_PATH)) {
    results.errors.push('globals.css not found at expected path');
    return;
  }

  const css = fs.readFileSync(GLOBALS_CSS_PATH, 'utf8');

  // 1. Check file structure
  validateFileStructure(css);

  // 2. Check CSS variable naming conventions
  validateNamingConventions(css);

  // 3. Check for !important usage (should be minimal, only in reduced-motion)
  validateImportantUsage(css);

  // 4. Check theme override hierarchy
  validateThemeHierarchy(css);

  // 5. Check for component-specific styles (should be minimal)
  validateComponentStyles(css);

  // 6. Check file size
  validateFileSize();

  // 7. Check CSS variable count
  validateVariableCount(css);

  // Print results
  printResults();
}

function validateFileStructure(css) {
  const requiredSections = [
    '@import \'tailwindcss\'',
    ':root {',
    '.dark,',
    ':root[data-tenant',
    ':root[data-safe-mode',
    'body {',
    ':focus-visible {',
    '@media (prefers-reduced-motion',
  ];

  for (const section of requiredSections) {
    if (css.includes(section)) {
      results.passed.push(`✅ Required section found: ${section}`);
    } else {
      results.warnings.push(`⚠️  Missing section: ${section}`);
    }
  }
}

function validateNamingConventions(css) {
  // Extract all CSS variables
  const variableRegex = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  const variables = [];
  let match;

  while ((match = variableRegex.exec(css)) !== null) {
    const [, name, value] = match;
    variables.push({ name: `--${name}`, value: value.trim() });
  }

  // Check naming patterns
  const namingPatterns = {
    color: /^--color-/,
    radius: /^--radius-/,
    shadow: /^--shadow-/,
    font: /^--font-/,
    accent: /^--accent-/,
    secondary: /^--secondary-/,
  };

  const violations = [];
  for (const variable of variables) {
    const name = variable.name;
    let matches = false;

    // Check if it matches any pattern
    for (const [category, pattern] of Object.entries(namingPatterns)) {
      if (pattern.test(name)) {
        matches = true;
        break;
      }
    }

    // Allow layout tokens (sidebar-width, topbar-height, spacing-*)
    if (/^--(sidebar|topbar|spacing)-/.test(name)) {
      matches = true;
    }

    // Allow MCP-specific tokens
    if (/^--mcp-/.test(name)) {
      matches = true;
    }

    if (!matches) {
      violations.push(name);
    }
  }

  if (violations.length === 0) {
    results.passed.push(`✅ All ${variables.length} CSS variables follow naming conventions`);
  } else {
    results.warnings.push(`⚠️  ${violations.length} variables don't follow naming conventions: ${violations.slice(0, 5).join(', ')}`);
  }
}

function validateImportantUsage(css) {
  const importantMatches = css.match(/!important/g);
  const importantCount = importantMatches ? importantMatches.length : 0;

  // !important is allowed in reduced-motion and MCP validation indicators
  // Check by looking at the block context, not just nearby lines
  const lines = css.split('\n');
  const violations = [];
  let currentBlock = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track current block context
    if (line.includes('@media (prefers-reduced-motion')) {
      currentBlock = 'reduced-motion';
    } else if (line.includes('[data-mcp-validated') || line.includes('[data-constitution-violation')) {
      currentBlock = 'mcp-validation';
    } else if (line.includes('}') && currentBlock) {
      // Reset block context when we exit
      if (line.trim() === '}') {
        currentBlock = '';
      }
    }

    if (line.includes('!important')) {
      const isAllowed = 
        currentBlock === 'reduced-motion' || 
        currentBlock === 'mcp-validation' ||
        line.includes('prefers-reduced-motion') ||
        line.includes('data-mcp-validated') ||
        line.includes('data-constitution-violation');

      if (!isAllowed) {
        violations.push(`Line ${i + 1}: ${line.trim()}`);
      }
    }
  }

  if (violations.length === 0) {
    results.passed.push(`✅ !important usage is appropriate (${importantCount} occurrences in allowed contexts)`);
  } else {
    results.errors.push(`❌ !important used outside allowed contexts:\n${violations.slice(0, 3).join('\n')}`);
  }
}

function validateThemeHierarchy(css) {
  // Check that theme selectors are in correct order
  const selectors = [
    { pattern: /:root\s*{/, name: 'Base (:root)' },
    { pattern: /:root\[data-tenant=/, name: 'Tenant (:root[data-tenant])' },
    { pattern: /\.dark,|:root\[data-mode=['"]dark['"]\]/, name: 'Dark Mode (.dark)' },
    { pattern: /:root\[data-safe-mode/, name: 'Safe Mode (:root[data-safe-mode])' },
  ];

  const positions = [];
  for (const selector of selectors) {
    const match = css.match(selector.pattern);
    if (match) {
      positions.push({
        name: selector.name,
        index: match.index,
      });
    }
  }

  // Check order: Base should come before Tenant, Dark, Safe Mode
  const baseIndex = positions.find(p => p.name.includes('Base'))?.index ?? -1;
  const tenantIndex = positions.find(p => p.name.includes('Tenant'))?.index ?? -1;
  const darkIndex = positions.find(p => p.name.includes('Dark'))?.index ?? -1;
  const safeIndex = positions.find(p => p.name.includes('Safe'))?.index ?? -1;

  if (baseIndex >= 0 && tenantIndex >= 0 && baseIndex < tenantIndex) {
    results.passed.push('✅ Theme hierarchy: Base before Tenant');
  } else {
    results.warnings.push('⚠️  Theme hierarchy: Base should come before Tenant');
  }

  if (safeIndex >= 0 && tenantIndex >= 0 && safeIndex > tenantIndex) {
    results.passed.push('✅ Theme hierarchy: Safe Mode after Tenant (correct priority)');
  } else if (safeIndex >= 0 && tenantIndex >= 0) {
    results.warnings.push('⚠️  Theme hierarchy: Safe Mode should come after Tenant');
  }
}

function validateComponentStyles(css) {
  // Component-specific styles should be minimal (only utility classes)
  const componentClasses = css.match(/\.(theme-|mcp-|server-|client-|shared-|migrating-)/g);
  const componentClassCount = componentClasses ? componentClasses.length : 0;

  if (componentClassCount > 0) {
    results.passed.push(`✅ Found ${componentClassCount} utility classes (allowed)`);
  }
}

function validateFileSize() {
  const stats = fs.statSync(GLOBALS_CSS_PATH);
  const sizeKB = stats.size / 1024;

  if (sizeKB < 50) {
    results.passed.push(`✅ File size: ${sizeKB.toFixed(2)}KB (target: <50KB)`);
  } else {
    results.warnings.push(`⚠️  File size: ${sizeKB.toFixed(2)}KB (target: <50KB)`);
  }
}

function validateVariableCount(css) {
  const variableRegex = /--([a-z0-9-]+)\s*:\s*[^;]+;/gi;
  const matches = css.match(variableRegex);
  const count = matches ? matches.length : 0;

  // Count unique variables (excluding overrides)
  const uniqueVars = new Set();
  for (const match of matches || []) {
    const nameMatch = match.match(/--([a-z0-9-]+)/);
    if (nameMatch) {
      uniqueVars.add(nameMatch[1]);
    }
  }

  if (count < 200) {
    results.passed.push(`✅ CSS variable count: ${count} total, ${uniqueVars.size} unique (target: <200)`);
  } else {
    results.warnings.push(`⚠️  CSS variable count: ${count} (target: <200)`);
  }
}

function printResults() {
  console.log('📊 Validation Results:\n');

  if (results.passed.length > 0) {
    console.log('✅ Passed:');
    results.passed.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }

  if (results.errors.length > 0) {
    console.log('❌ Errors:');
    results.errors.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }

  const total = results.passed.length + results.warnings.length + results.errors.length;
  const passed = results.passed.length;
  const warnings = results.warnings.length;
  const errors = results.errors.length;

  console.log('📈 Summary:');
  console.log(`   Total checks: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   ❌ Errors: ${errors}`);

  if (errors === 0 && warnings === 0) {
    console.log('\n🎉 All validations passed!');
    process.exit(0);
  } else if (errors === 0) {
    console.log('\n✅ Validation passed with warnings');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed');
    process.exit(1);
  }
}

// Run validation
validate();

