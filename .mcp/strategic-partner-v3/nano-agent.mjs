/**
 * NANO AGENT v2
 * Design System Auditor with Validation Pipelines
 * 
 * Implements:
 * - Skill #1: Validation Pipelines
 * - Skill #7: Design Token Extraction
 */

import { BasePipeline, ValidationResult, MCPError, ErrorSeverity } from "./mcp-core.mjs";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Input Schema for Design Audit
// interface DesignAuditRequest {
//   cssContent: string;
//   framework: "react" | "vue" | "html";
// }

// --- NANO'S PIPELINE ---
export class DesignAuditPipeline extends BasePipeline {
  // Implements Skill 1: Centralized Validation
  validate(input) {
    const errors = [];

    if (!input.cssContent || input.cssContent.length < 10) {
      errors.push("CSS Content is empty or too short.");
    }

    if (!input.cssContent.includes(":root")) {
      errors.push("CSS missing ':root' definitions. Cannot extract global tokens.");
    }

    if (input.framework && !["react", "vue", "html"].includes(input.framework)) {
      errors.push(`Framework must be one of: react, vue, html. Got: ${input.framework}`);
    }

    return new ValidationResult(errors.length === 0, errors);
  }

  // Implements Skill 7: Token Extraction logic
  async process(input) {
    const { cssContent, framework = "html" } = input;

    // Extract design tokens
    const tokenCount = (cssContent.match(/--[\w-]+:/g) || []).length;
    const hasPhysics = cssContent.includes("keyframes") || cssContent.includes("@keyframes");
    const hasDarkMode = cssContent.includes(".dark") || cssContent.includes("[data-mode=\"dark\"]");
    const hasThemeSupport = cssContent.includes("[data-theme") || cssContent.includes("data-theme");

    // Check for adaptive luminance (Nano Banana Principle)
    const lightModeBlock = cssContent.split(".dark")[0];
    const darkModeBlock = cssContent.match(/\.dark\s*{([^}]*)}/)?.[1] || "";
    
    const extractTokens = (block) => {
      const tokens = {};
      const regex = /--([\w-]+):\s*(#[0-9a-fA-F]{6}|[^;]+);/g;
      let match;
      while ((match = regex.exec(block)) !== null) {
        tokens[match[1]] = match[2].trim();
      }
      return tokens;
    };

    const lightTokens = extractTokens(lightModeBlock);
    const darkTokens = extractTokens(darkModeBlock);
    const hasAdaptiveLuminance = Object.keys(lightTokens).length > 0 && Object.keys(darkTokens).length > 0;

    // Validation checks
    const issues = [];
    if (tokenCount < 5) {
      issues.push({
        type: "DESIGN_POVERTY",
        severity: ErrorSeverity.WARNING,
        message: "System lacks sufficient tokens.",
        suggestion: "Run 'nano_generate_palette' to create base tokens.",
      });
    }

    if (!hasPhysics) {
      issues.push({
        type: "STATIC_DESIGN",
        severity: ErrorSeverity.WARNING,
        message: "No animation keyframes detected.",
        suggestion: "Add kinetic physics with @keyframes animations.",
      });
    }

    if (!hasDarkMode) {
      issues.push({
        type: "MISSING_DARK_MODE",
        severity: ErrorSeverity.INFO,
        message: "Dark mode support not detected.",
        suggestion: "Add .dark or [data-mode='dark'] theme definitions.",
      });
    }

    if (!hasThemeSupport) {
      issues.push({
        type: "MISSING_THEME_SWITCHING",
        severity: ErrorSeverity.INFO,
        message: "Theme switching not detected.",
        suggestion: "Add [data-theme] attribute support for theme switching.",
      });
    }

    // Calculate score
    let score = 0;
    if (tokenCount >= 5) score += 30;
    if (hasPhysics) score += 30;
    if (hasDarkMode) score += 20;
    if (hasThemeSupport) score += 10;
    if (hasAdaptiveLuminance) score += 10;

    const verdict = score >= 80 ? "OUTSTANDING" : score >= 60 ? "GOOD" : score >= 40 ? "NEEDS_IMPROVEMENT" : "STATIC";

    return {
      status: "AUDIT_COMPLETE",
      metrics: {
        tokenDensity: tokenCount,
        hasPhysicsEngine: hasPhysics,
        hasDarkMode: hasDarkMode,
        hasThemeSupport: hasThemeSupport,
        hasAdaptiveLuminance: hasAdaptiveLuminance,
        lightTokenCount: Object.keys(lightTokens).length,
        darkTokenCount: Object.keys(darkTokens).length,
      },
      score: `${score}/100`,
      verdict,
      issues,
      framework,
      recommendations: issues.map((issue) => issue.suggestion),
    };
  }
}

// Additional utility: File-based audit
export class FileDesignAuditPipeline extends BasePipeline {
  constructor(cssPath = "packages/ui/src/design/tokens/globals.css") {
    super();
    this.cssPath = cssPath;
  }

  validate(input) {
    const errors = [];
    const root = process.cwd();
    const fullPath = resolve(root, this.cssPath);

    if (!existsSync(fullPath)) {
      errors.push(`CSS file not found at: ${this.cssPath}`);
    }

    return new ValidationResult(errors.length === 0, errors);
  }

  async process(input) {
    const root = process.cwd();
    const fullPath = resolve(root, this.cssPath);
    const cssContent = readFileSync(fullPath, "utf-8");

    // Delegate to DesignAuditPipeline
    const auditPipeline = new DesignAuditPipeline();
    return await auditPipeline.process({
      cssContent,
      framework: input.framework || "html",
    });
  }
}

