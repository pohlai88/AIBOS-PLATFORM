import type { ValidationError } from "../types/ValidationError.js";
import fs from "fs";
import path from "path";

// Import config
import ciConfig from "./config.ci.json" with { type: "json" };

export interface CIResult {
  theme: string;
  errors: ValidationError[];
  fixedFiles?: Record<string, string>;
  fileCount: number;
}

export interface CIValidationOptions {
  themes?: string[];
  autoFix?: boolean;
}

/**
 * Run CI validation on component files.
 */
export async function runCIValidation(
  componentPaths: string[],
  options: CIValidationOptions = {}
): Promise<CIResult[]> {
  const { themes = ciConfig.tenants, autoFix = ciConfig.autoFix } = options;

  const results: CIResult[] = [];

  // Dynamic imports to avoid circular dependencies
  const { extractDesignNodesFromComponent } = await import("../extractor/index.js");
  const { validateAll } = await import("../validators/validateAll.js");

  for (const theme of themes) {
    let allErrors: ValidationError[] = [];
    const fixedFiles: Record<string, string> = {};

    for (const file of componentPaths) {
      try {
        const fullPath = path.resolve(process.cwd(), file);

        if (!fs.existsSync(fullPath)) {
          console.warn(`[CI] File not found: ${file}`);
          continue;
        }

        const nodes = await extractDesignNodesFromComponent(file);
        const errors = validateAll(nodes);

        // Tag errors with file info
        const taggedErrors = errors.map((e) => ({
          ...e,
          nodeId: `${file}:${e.nodeId}`,
        }));

        allErrors = allErrors.concat(taggedErrors);

        // Auto-fix if enabled
        if (autoFix && errors.length > 0) {
          const { autoFix: applyFixes } = await import("../autofix/index.js");
          const originalSource = fs.readFileSync(fullPath, "utf8");
          const fixed = applyFixes(originalSource, errors);

          if (fixed.stats.fixed > 0) {
            fixedFiles[file] = fixed.fixedSource;
          }
        }
      } catch (err) {
        console.error(`[CI] Error processing ${file}:`, err);
      }
    }

    results.push({
      theme,
      errors: allErrors,
      fixedFiles: Object.keys(fixedFiles).length > 0 ? fixedFiles : undefined,
      fileCount: componentPaths.length,
    });
  }

  return results;
}

/**
 * Get list of changed files from git diff.
 */
export function getChangedFiles(base = "origin/main"): string[] {
  try {
    const { execSync } = require("child_process");
    const output = execSync(`git diff --name-only ${base}`, { encoding: "utf8" });

    return output
      .split("\n")
      .filter((f: string) => f.match(/\.(tsx?|jsx?)$/))
      .filter((f: string) => !f.includes(".test.") && !f.includes(".stories."));
  } catch {
    return [];
  }
}

/**
 * Filter files by CI config paths.
 */
export function filterByConfigPaths(files: string[]): string[] {
  const { include, exclude } = ciConfig.paths;

  return files.filter((file) => {
    const matchesInclude = include.some((pattern) => matchGlob(file, pattern));
    const matchesExclude = exclude.some((pattern) => matchGlob(file, pattern));

    return matchesInclude && !matchesExclude;
  });
}

/**
 * Simple glob matching.
 */
function matchGlob(file: string, pattern: string): boolean {
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^/]*")
        .replace(/\//g, "\\/") +
      "$"
  );
  return regex.test(file);
}

